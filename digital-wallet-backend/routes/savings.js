const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const SavingsGoal = require("../models/Savings");

// GET all goals for the user
router.get("/", authenticate, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id });
    res.json({ goals });
  } catch (err) {
    console.error("Failed to fetch goals", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new goal
router.post("/", authenticate, async (req, res) => {
  const { name, target, note, deadline } = req.body;
  if (!name || !target) {
    return res.status(400).json({ message: "Name and target are required" });
  }

  try {
    const goal = new SavingsGoal({
      user: req.user._id,
      name,
      target,
      saved: 0,
      note: note || "",
      deadline: deadline || null,
    });

    await goal.save();
    res.status(201).json({ message: "Goal created", goal });
  } catch (err) {
    console.error("Error creating goal", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
