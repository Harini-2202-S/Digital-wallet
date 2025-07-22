const speakeasy = require("speakeasy");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generatePaymentHandle } = require("../utils/userUtils");

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ["deposit", "withdrawal"], required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
});

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pinHash: { type: String, select: false },
  verified: {
    type: Boolean,
    default: false,
  },
  hasPin: {
    type: Boolean,
    default: false,
  },
  paymentHandle: {
    type: String,
    unique: true,
    sparse: true,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    required: false,
  },

  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  otp: {
    type: String,
    default: null,
  },
  transactions: [TransactionSchema],
  savingsGoals: [
    {
      name: String,
      target: Number,
      saved: Number,
    },
  ],
  recentDeposits: [
    {
      amount: Number,
      date: Date,
      isSavings: Boolean,
      savingsName: String,
    },
  ],
  milestones: [String],
});

// Function to generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(20).toString("hex");
}

// Pre-save hook for user document
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Only set the verification token if the user is not verified
  if (!this.verified && !this.verificationToken) {
    this.verificationToken = generateVerificationToken();
  }

  if (!this.paymentHandle) {
    this.paymentHandle = await generatePaymentHandle(this);
  }

  next();
});

// Compare passwords
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate 2FA secret
UserSchema.methods.generate2FASecret = function () {
  const secret = speakeasy.generateSecret();
  this.twoFactorSecret = secret.base32;
  this.twoFactorEnabled = true;
  return secret;
};

module.exports = mongoose.model("User", UserSchema);
