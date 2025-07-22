const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token." });
  }
};

// Example protected route
router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the protected dashboard!", user: req.user });
});

module.exports = router;
