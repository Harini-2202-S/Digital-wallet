import express from "express";
const router = express.Router();
const Spending = require("../models/Spending");
const auth = require("../middleware/authMiddleware");

// Add new spending
router.post("/add", auth, async (req, res) => {
  try {
    const { category, amount, description } = req.body;
    const spending = new Spending({
      user: req.user._id,
      category,
      amount,
      description,
    });
    await spending.save();
    res.status(201).json({ message: "Spending added", spending });
  } catch (error) {
    console.error("Error adding spending:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all spendings for user
router.get("/", auth, async (req, res) => {
  try {
    const spendings = await Spending.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json({ spendings });
  } catch (error) {
    console.error("Error fetching spendings:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
