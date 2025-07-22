const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const auth = require("../middleware/authMiddleware");

router.post("/add", auth, async (req, res) => {
  try {
    const { name, target, note, deadline } = req.body;
    const user = req.user._id;

    // Prevent duplicate goals for same user
    const existingGoal = await Goal.findOne({ user, name });
    if (existingGoal) {
      return res
        .status(400)
        .json({ message: "Goal with this name already exists." });
    }

    const newGoal = new Goal({
      user,
      name: name.trim(),
      target,
      saved: 0,
      note,
      deadline,
    });

    await newGoal.save();
    console.log("🚀 Received Goal:", req.body);
    console.log("💾 Connected DB:", mongoose.connection.name);

    res.status(200).json({ message: "Goal created", goal: newGoal });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete goal by ID
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user._id;

    const deletedGoal = await Goal.findOneAndDelete({
      _id: goalId,
      user: userId,
    });

    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Server error while deleting goal" });
  }
});

module.exports = router;
