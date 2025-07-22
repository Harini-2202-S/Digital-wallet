const mongoose = require("mongoose");

const transferMoneySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  amount: { type: Number, required: true },
  from: String,
  to: String,
  description: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TransferMoney", transferMoneySchema);
