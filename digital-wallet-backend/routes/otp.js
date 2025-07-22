const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP and send via email
router.post("/generate", async (req, res) => {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: "userId and email are required" });
  }

  const otp = Otp.generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    const newOtp = new Otp({ userId, otp, expiresAt });
    await newOtp.save();

    const mailOptions = {
      from: "janaaharinis@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "OTP generated and email sent", otpId: newOtp._id });
  } catch (error) {
    console.error("Error generating or sending OTP:", error);
    res.status(500).json({ error: "Failed to generate and send OTP" });
  }
});

// Check if OTP is expired
router.get("/:otpId", async (req, res) => {
  const otpId = req.params.otpId;

  try {
    const otp = await Otp.findById(otpId);
    if (!otp) {
      return res.status(404).json({ error: "OTP not found" });
    }

    if (otp.isExpired()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.status(200).json({ message: "OTP is still valid" });
  } catch (error) {
    res.status(500).json({ error: "Failed to check OTP" });
  }
});

module.exports = router;
