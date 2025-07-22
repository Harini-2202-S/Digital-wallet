const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  handles: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
