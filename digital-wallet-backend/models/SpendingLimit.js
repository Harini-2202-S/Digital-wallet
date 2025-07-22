const mongoose = require("mongoose");

const SpendingLimitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contactHandle: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("SpendingLimit", SpendingLimitSchema);
