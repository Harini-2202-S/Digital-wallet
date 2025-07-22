// // const express = require("express");
// // const router = express.Router();
// // const {
// //   generateRegistrationOptions,
// //   verifyRegistrationResponse,
// //   generateAuthenticationOptions,
// //   verifyAuthenticationResponse,
// // } = require("@simplewebauthn/server");
// // const User = require("../models/User");

// // const rpName = "YourAppName";
// // const rpID = "localhost"; // Change to your domain for production
// // const origin = `http://${rpID}:3000`; // Frontend origin, adjust port if needed

// // // In-memory challenge storage per user (replace with DB or session in production)
// // const userChallengeMap = new Map();

// // /**
// //  * POST /api/webauthn/register-options
// //  * Body: { email }
// //  * Generates registration options for user to create new credential
// //  */
// // router.post("/register-options", async (req, res) => {
// //   const { email } = req.body;
// //   if (!email) return res.status(400).json({ error: "Missing email" });

// //   let user = await User.findOne({ email });
// //   if (!user) {
// //     user = new User({ email, webAuthnCredentials: [] });
// //     await user.save();
// //   }

// //   const options = generateRegistrationOptions({
// //     rpName,
// //     rpID,
// //     userID: user._id.toString(),
// //     userName: user.email,
// //     attestationType: "none",
// //     excludeCredentials: user.webAuthnCredentials.map((cred) => ({
// //       id: Buffer.from(cred.credentialID, "base64url"),
// //       type: "public-key",
// //       transports: ["internal"],
// //     })),
// //   });

// //   userChallengeMap.set(user._id.toString(), options.challenge);
// //   res.json(options);
// // });

// // /**
// //  * POST /api/webauthn/register-verify
// //  * Body: { email, ...credential }
// //  * Verifies and stores new credential
// //  */
// // router.post("/register-verify", async (req, res) => {
// //   const { email, ...credential } = req.body;
// //   if (!email) return res.status(400).json({ error: "Missing email" });

// //   const user = await User.findOne({ email });
// //   if (!user) return res.status(404).json({ error: "User not found" });

// //   const expectedChallenge = userChallengeMap.get(user._id.toString());
// //   if (!expectedChallenge)
// //     return res.status(400).json({ error: "No challenge found" });

// //   try {
// //     const verification = await verifyRegistrationResponse({
// //       credential,
// //       expectedChallenge,
// //       expectedOrigin: origin,
// //       expectedRPID: rpID,
// //     });

// //     const { verified, registrationInfo } = verification;
// //     if (verified && registrationInfo) {
// //       // Add new credential to user
// //       const { credentialID, credentialPublicKey, counter } = registrationInfo;
// //       user.webAuthnCredentials.push({
// //         credentialID: credentialID.toString("base64url"),
// //         publicKey: credentialPublicKey.toString("base64url"),
// //         counter,
// //       });
// //       await user.save();
// //     }
// //     res.json({ verified });
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // /**
// //  * POST /api/webauthn/auth-options
// //  * Body: { email }
// //  * Generates authentication options for user to assert credential
// //  */
// // router.post("/auth-options", async (req, res) => {
// //   const { email } = req.body;
// //   if (!email) return res.status(400).json({ error: "Missing email" });

// //   const user = await User.findOne({ email });
// //   if (!user) return res.status(404).json({ error: "User not found" });

// //   const options = generateAuthenticationOptions({
// //     rpID,
// //     userVerification: "preferred",
// //     allowCredentials: user.webAuthnCredentials.map((cred) => ({
// //       id: Buffer.from(cred.credentialID, "base64url"),
// //       type: "public-key",
// //       transports: ["internal"],
// //     })),
// //   });

// //   userChallengeMap.set(user._id.toString(), options.challenge);
// //   res.json(options);
// // });

// // /**
// //  * POST /api/webauthn/auth-verify
// //  * Body: { email, ...assertion }
// //  * Verifies authentication assertion
// //  */
// // router.post("/auth-verify", async (req, res) => {
// //   const { email, ...assertion } = req.body;
// //   if (!email) return res.status(400).json({ error: "Missing email" });

// //   const user = await User.findOne({ email });
// //   if (!user) return res.status(404).json({ error: "User not found" });

// //   const expectedChallenge = userChallengeMap.get(user._id.toString());
// //   if (!expectedChallenge)
// //     return res.status(400).json({ error: "No challenge found" });

// //   // Find authenticator matching credentialID
// //   const authenticator = user.webAuthnCredentials.find(
// //     (cred) => cred.credentialID === assertion.id
// //   );
// //   if (!authenticator)
// //     return res.status(400).json({ error: "Authenticator not registered" });

// //   try {
// //     const verification = await verifyAuthenticationResponse({
// //       credential: assertion,
// //       expectedChallenge,
// //       expectedOrigin: origin,
// //       expectedRPID: rpID,
// //       authenticator: {
// //         credentialPublicKey: Buffer.from(authenticator.publicKey, "base64url"),
// //         credentialID: Buffer.from(authenticator.credentialID, "base64url"),
// //         counter: authenticator.counter,
// //       },
// //     });

// //     if (verification.verified) {
// //       // Update counter to prevent replay attacks
// //       authenticator.counter = verification.authenticationInfo.newCounter;
// //       await user.save();
// //       res.json({ verified: true });
// //     } else {
// //       res.status(401).json({ verified: false });
// //     }
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // module.exports = router;

// const express = require("express");
// const {
//   generateRegistrationOptions,
//   verifyRegistrationResponse,
//   generateAuthenticationOptions,
//   verifyAuthenticationResponse,
// } = require("@simplewebauthn/server");
// const base64url = require("base64url");
// const User = require("../models/User");

// const router = express.Router();

// // Store challenges in DB per user
// const challenges = new Map();

// const rpID = "localhost"; // ⬅️ Change this to your domain in production
// const expectedOrigin = "http://localhost:3000"; // ⬅️ Use HTTPS in prod
// const authenticateUser = require("../middleware/authMiddleware");

// // ✅ Registration - Step 1
// router.post("/register-options", async (req, res) => {
//   const email = req.user?.email; // Get from JWT-authenticated session

//   if (!email) {
//     return res.status(400).json({ error: "User email not found in session" });
//   }

//   const user =
//     (await User.findOne({ email })) ||
//     new User({ email, webAuthnCredentials: [] });

//   const options = generateRegistrationOptions({
//     rpName: "My WebAuthn Demo",
//     rpID,
//     userID: Buffer.from(email, "utf8"), // Fix: pass Buffer instead of string
//     userName: email,
//     timeout: 60000,
//     attestationType: "none",
//     authenticatorSelection: {
//       residentKey: "preferred",
//       userVerification: "preferred",
//     },
//     excludeCredentials: user.webAuthnCredentials.map((cred) => ({
//       id: base64url.toBuffer(cred.credentialID),
//       type: "public-key",
//     })),
//   });

//   challenges.set(email, options.challenge);
//   res.json(options);
// });

// // ✅ Registration - Step 2
// router.post("/register-verify", authenticateUser, async (req, res) => {
//   const email = req.user?.email;
//   const body = req.body;

//   const expectedChallenge = challenges.get(email);
//   const user = await User.findOne({ email });

//   if (!user || !expectedChallenge) {
//     return res.status(400).json({ error: "Invalid registration" });
//   }

//   let verification;
//   try {
//     verification = await verifyRegistrationResponse({
//       response: body,
//       expectedChallenge,
//       expectedOrigin,
//       expectedRPID: rpID,
//     });
//   } catch (err) {
//     return res.status(400).json({ error: err.message });
//   }

//   const { verified, registrationInfo } = verification;
//   if (verified && registrationInfo) {
//     const { credentialPublicKey, credentialID, counter } = registrationInfo;

//     user.webAuthnCredentials.push({
//       credentialID: base64url.encode(credentialID),
//       publicKey: base64url.encode(credentialPublicKey),
//       counter,
//     });
//     await user.save();
//   }

//   challenges.delete(email);
//   res.json({ verified });
// });

// // ✅ Authentication - Step 1
// router.post("/auth-verify", authenticateUser, async (req, res) => {
//   const { email } = req.body;
//   // const email = req.user?.email;

//   const user = await User.findOne({ email });
//   if (!user || !user.webAuthnCredentials.length)
//     return res.status(400).json({ error: "No credentials" });

//   const options = generateAuthenticationOptions({
//     timeout: 60000,
//     allowCredentials: user.webAuthnCredentials.map((cred) => ({
//       id: base64url.toBuffer(cred.credentialID),
//       type: "public-key",
//       transports: ["internal"],
//     })),
//     userVerification: "preferred",
//     rpID,
//   });

//   challenges.set(email, options.challenge);
//   res.json(options);
// });

// // ✅ Authentication - Step 2
// router.post("/auth-verify", authenticateUser, async (req, res) => {
//   const email = req.user?.email;
//   const body = req.body;

//   const expectedChallenge = challenges.get(email);
//   const user = await User.findOne({ email });

//   if (!user || !expectedChallenge) {
//     return res.status(400).json({ error: "Invalid auth request" });
//   }

//   const dbCred = user.webAuthnCredentials.find(
//     (cred) => cred.credentialID === body.id
//   );
//   if (!dbCred) {
//     return res.status(400).json({ error: "Credential not found" });
//   }

//   let verification;
//   try {
//     verification = await verifyAuthenticationResponse({
//       response: body,
//       expectedChallenge,
//       expectedOrigin,
//       expectedRPID: rpID,
//       authenticator: {
//         credentialID: base64url.toBuffer(dbCred.credentialID),
//         credentialPublicKey: base64url.toBuffer(dbCred.publicKey),
//         counter: dbCred.counter,
//       },
//     });
//   } catch (err) {
//     return res.status(400).json({ error: err.message });
//   }

//   const { verified, authenticationInfo } = verification;
//   if (verified) {
//     dbCred.counter = authenticationInfo.newCounter;
//     await user.save();
//   }

//   challenges.delete(email);
//   res.json({ verified });
// });

// module.exports = router;
