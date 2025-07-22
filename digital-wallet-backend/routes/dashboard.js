const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({ msg: "Welcome to your dashboard!" });
});

module.exports = router;
