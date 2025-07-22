const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKey";

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create a JWT token for the user
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Send response with user data and token
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
