// password is not hashed beofre storing in database [do it later, compulsory!!!]

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Otp = require("../models/Otp");
const crypto = require("crypto");
const { generatePaymentHandle } = require("../utils/userUtils");
const WalletExists = require("../utils/Wallet");

require("dotenv").config();

const router = express.Router();

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Signup - send OTP
router.post("/signup", async (req, res) => {
  console.log("✅ /signup route hit");
  const { email } = req.body;
  console.log("📧 Email received:", email);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newOtp = new Otp({ email, otp, expiresAt });

    await newOtp.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP is ${otp}`,
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to continue.",
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const {
    name,
    email: emailFromBody,
    password,
    phone,
    verificationToken,
    otp,
  } = req.body;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email || emailFromBody;

    const allOtps = await Otp.find({ email });
    console.log("📦 Found OTPs for email:", allOtps);

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const newVerificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password,
      phone,
      verificationToken,
    });
    user.handle = await generatePaymentHandle(user);
    user.paymentHandle = user.handle;
    user.paymentHandle = await generatePaymentHandle(user);

    await user.save();
    await Otp.deleteMany({ email });

    const newToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({
      success: true,
      message: "OTP verified. Set your password.",
      token: newToken,
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// Set Password
router.post("/set-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid token or user not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    const Wallet = require("../models/Wallet");

    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({ userId: user._id });
    if (!existingWallet) {
      await Wallet.create({ userId: user._id });
    }

    res.json({ message: "Password set successfully. You can now log in." });
  } catch (error) {
    console.error("Error in /set-password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please check your email or sign up.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });
    }

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    await WalletExists(user._id);

    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      hasPin: user.hasPin,
      handle: user.paymentHandle,
    };

    res.status(200).json({
      success: true,
      token,
      user: userData,
      message: "Login successful!",
    });

    // Send Login Alert Email
    await sendLoginEmail(email);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// Login Alert Email
const sendLoginEmail = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "New Sign-In Alert",
    text: "A new sign-in was made to your account. If this was not you, please contact support.",
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Login alert email sent");
  } catch (error) {
    console.error("❌ Error sending login email:", error);
  }
};

module.exports = router;
