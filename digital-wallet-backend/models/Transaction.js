const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
    },
    transaction_date: {
      type: Date,
      default: Date.now,
    },
    transaction_type: {
      type: String,
      enum: ["transfer", "deposit"],
      required: true,
    },
    counterparty_name: {
      type: String,
      required: true,
    },
    counterparty_account: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transaction_status: {
      type: String,
      enum: ["success", "failed", "pending", "cancelled", "scheduled"],
      required: true,
    },
    scheduleDate: {
      type: Date,
    },
    payment_method: {
      type: String,
    },
    narration: {
      type: String,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    from: { type: String },
    to: { type: String },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user_id: 1, transaction_date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
