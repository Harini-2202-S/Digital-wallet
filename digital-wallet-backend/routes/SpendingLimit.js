const express = require("express");
const router = express.Router();
const SpendingLimit = require("../models/SpendingLimit");
const auth = require("../middleware/authMiddleware");

// Set or update limit
router.post("/set", auth, async (req, res) => {
  const { contactHandle, limit } = req.body;
  if (!contactHandle || !limit)
    return res.status(400).json({ msg: "Invalid input" });

  try {
    const updated = await SpendingLimit.findOneAndUpdate(
      { userId: req.user._id, contactHandle },
      { $set: { limit } },
      { upsert: true, new: true }
    );
    res.json({ msg: "Limit set successfully", data: updated });
  } catch (err) {
    res.status(500).json({ msg: "Server error while setting limit" });
  }
});

// Get limit for a contact
router.get("/:contactHandle", auth, async (req, res) => {
  try {
    const limitDoc = await SpendingLimit.findOne({
      userId: req.user._id,
      contactHandle: req.params.contactHandle,
    });

    if (!limitDoc) return res.json({ limit: 0 });
    res.json({ limit: limitDoc.limit });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching limit" });
  }
});

module.exports = router;
