const nodemailer = require("nodemailer");
const User = require("../models/User");

const sendEmail = async (senderUserId, toEmail, subject, text) => {
  try {
    const sender = await User.findById(senderUserId);

    if (!sender || !sender.email || !sender.appPassword) {
      throw new Error("Sender email or app password not found in DB");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender.email,
        pass: sender.appPassword,
      },
    });

    await transporter.sendMail({
      from: sender.email,
      to: toEmail,
      subject: subject,
      text: text,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent!", error);
  }
};

module.exports = sendEmail;
