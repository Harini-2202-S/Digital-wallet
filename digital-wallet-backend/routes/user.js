const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserById,
  getFavorites,
  addFavorite,
  handleTransfer,
} = require("../controllers/TransferController");

const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKey";

// Favorites
router.get("/favorites", authMiddleware, getFavorites);

// Set 4-digit PIN
router.post("/set-pin", authMiddleware, async (req, res) => {
  const { pin } = req.body;

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "PIN must be exactly 4 digits" });
  }

  try {
    const user = await User.findById(req.user._id);
    const salt = await bcrypt.genSalt(10);
    user.pinHash = await bcrypt.hash(pin, salt);
    user.hasPin = true;
    await user.save();

    res.json({ message: "PIN set successfully" });
  } catch (error) {
    console.error("Error setting PIN:", error);
    res.status(500).json({ error: "Failed to set PIN" });
  }
});

// Get logged-in user's info
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "email balance pinHash"
    );
    res.json({
      email: user.email,
      balance: user.balance,
      hasPin: !!user.pinHash,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// User profile info
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    console.log("🧪 /profile route hit");
    console.log("🔍 req.user = ", req.user);

    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Missing user ID in token" });
    }

    const user = await User.findById(req.user._id).select("-password -pinHash");
    res.json(user);
  } catch (err) {
    console.error("🔥 /profile crash:", err);
    res.status(500).json({ message: "Server error in /profile" });
  }
});

// Fallback for id
router.get("/:id", authMiddleware, getUserById);

module.exports = router;
