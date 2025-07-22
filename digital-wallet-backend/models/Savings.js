const mongoose = require("mongoose");

const SavingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    target: { type: Number, required: true },
    saved: { type: Number, default: 0 },
    note: String,
    deadline: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavingsGoal", SavingsGoalSchema);
