const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  vault: {
    type: String,
    default: "Main",
  },
  goal: {
    name: { type: String, default: null },
    isCustom: { type: Boolean, default: false },
  },
  sources: [
    {
      sourceType: String,
      sourceAmount: Number,
    },
  ],
  sentiment: {
    type: String,
    enum: ["Motivated", "Neutral", "Regret"],
    default: "Neutral",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Deposit", depositSchema);
