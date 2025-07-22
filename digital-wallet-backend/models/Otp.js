const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
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

OtpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

OtpSchema.statics.generateOtp = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = mongoose.model("Otp", OtpSchema);
