const mongoose = require("mongoose");

const DepositOtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  depositId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deposit",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if the OTP is expired
DepositOtpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to generate a 6-digit OTP
DepositOtpSchema.statics.generateOtp = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = mongoose.model("DepositOtp", DepositOtpSchema);
