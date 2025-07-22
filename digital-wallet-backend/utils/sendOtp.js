const DepositOtp = require("../models/DepositOtp");
const nodemailer = require("nodemailer");

const sendOtp = async (userId, email, depositId) => {
  const otp = DepositOtp.generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const newOtp = new DepositOtp({ userId, depositId, otp, expiresAt });
  await newOtp.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Deposit OTP Code",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  return { otpId: newOtp._id, expiresAt };
};

module.exports = sendOtp;
