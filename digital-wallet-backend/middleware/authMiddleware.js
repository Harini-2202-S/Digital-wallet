const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "yourDefaultSecretKey";
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token payload:", decoded);

    req.user = { _id: decoded._id, email: decoded.email };

    console.log("Attached req.user:", req.user);

    const userExists = await User.exists({ _id: decoded._id });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = verifyToken;
