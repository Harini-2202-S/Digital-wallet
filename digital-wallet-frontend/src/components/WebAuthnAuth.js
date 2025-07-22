// // File: src/components/WebAuthnAuth.js

// import React, { useState } from "react";

// function base64urlToUint8Array(base64urlString) {
//   const padding = "=".repeat((4 - (base64urlString.length % 4)) % 4);
//   const base64 =
//     base64urlString.replace(/-/g, "+").replace(/_/g, "/") + padding;
//   const rawData = window.atob(base64);
//   return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
// }

// function uint8ArrayToBase64(buffer) {
//   const bytes = new Uint8Array(buffer);
//   let binary = "";
//   for (const b of bytes) binary += String.fromCharCode(b);
//   return window.btoa(binary);
// }

// export default function WebAuthnAuth() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   async function registerBiometric(userEmail) {
//     try {
//       setMessage("Fetching registration options...");
//       const res = await fetch("/api/webauthn/register-options", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userEmail }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch registration options");
//       const options = await res.json();

//       options.challenge = base64urlToUint8Array(options.challenge);
//       options.user.id = base64urlToUint8Array(options.user.id);
//       if (options.excludeCredentials) {
//         options.excludeCredentials = options.excludeCredentials.map((cred) => ({
//           ...cred,
//           id: base64urlToUint8Array(cred.id),
//         }));
//       }

//       setMessage("Creating credential...");
//       const credential = await navigator.credentials.create({
//         publicKey: options,
//       });
//       if (!credential) throw new Error("Failed to create credentials");

//       const credentialForServer = {
//         id: credential.id,
//         rawId: uint8ArrayToBase64(credential.rawId),
//         response: {
//           clientDataJSON: uint8ArrayToBase64(
//             credential.response.clientDataJSON
//           ),
//           attestationObject: uint8ArrayToBase64(
//             credential.response.attestationObject
//           ),
//         },
//         type: credential.type,
//       };

//       setMessage("Verifying registration...");
//       const verifyRes = await fetch("/api/webauthn/register-verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...credentialForServer, email }),
//       });
//       if (!verifyRes.ok) throw new Error("Failed to verify registration");
//       const verifyResult = await verifyRes.json();

//       if (verifyResult.verified) {
//         setMessage("Registration successful!");
//       } else {
//         setMessage("Registration failed!");
//       }
//     } catch (err) {
//       setMessage(`Error: ${err.message}`);
//     }
//   }

//   async function authenticateBiometric(email) {
//     try {
//       setMessage("Fetching authentication options...");
//       const res = await fetch("/api/webauthn/auth-options", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch authentication options");
//       const options = await res.json();

//       options.challenge = base64urlToUint8Array(options.challenge);
//       if (options.allowCredentials) {
//         options.allowCredentials = options.allowCredentials.map((cred) => ({
//           ...cred,
//           id: base64urlToUint8Array(cred.id),
//         }));
//       }

//       setMessage("Getting assertion...");
//       const assertion = await navigator.credentials.get({ publicKey: options });
//       if (!assertion) throw new Error("Failed to get assertion");

//       const assertionForServer = {
//         id: assertion.id,
//         rawId: uint8ArrayToBase64(assertion.rawId),
//         response: {
//           clientDataJSON: uint8ArrayToBase64(assertion.response.clientDataJSON),
//           authenticatorData: uint8ArrayToBase64(
//             assertion.response.authenticatorData
//           ),
//           signature: uint8ArrayToBase64(assertion.response.signature),
//           //   userHandle: assertion.response.userHandle
//           //     ? uint8ArrayToBase64(assertion.response.userHandle)
//           //     : null,

//           userHandle: assertion.response.userHandle
//             ? new TextDecoder().decode(
//                 base64urlToUint8Array(assertion.response.userHandle)
//               )
//             : null,
//         },
//         type: assertion.type,
//       };

//       setMessage("Verifying authentication...");
//       const verifyRes = await fetch("/api/webauthn/auth-verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...assertionForServer, email }),
//       });
//       if (!verifyRes.ok) throw new Error("Failed to verify authentication");
//       const verifyResult = await verifyRes.json();

//       if (verifyResult.verified) {
//         setMessage("Authentication successful!");
//       } else {
//         setMessage("Authentication failed!");
//       }
//     } catch (err) {
//       setMessage(`Error: ${err.message}`);
//     }
//   }

//   return (
//     <div
//       style={{
//         maxWidth: 400,
//         margin: "auto",
//         padding: 20,
//         fontFamily: "Arial",
//       }}
//     >
//       <h2>Biometric WebAuthn Demo</h2>
//       <input
//         type="email"
//         placeholder="Your Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         style={{ width: "100%", padding: 8, marginBottom: 10 }}
//       />
//       <button
//         onClick={() => registerBiometric(email)}
//         disabled={!email}
//         style={{ marginRight: 10, padding: "8px 16px" }}
//       >
//         Register Biometric
//       </button>
//       <button
//         onClick={() => authenticateBiometric(email)}
//         disabled={!email}
//         style={{ padding: "8px 16px" }}
//       >
//         Authenticate Biometric
//       </button>
//       <p style={{ marginTop: 20 }}>{message}</p>
//     </div>
//   );
// }
