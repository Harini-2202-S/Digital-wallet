const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");

// Get transaction history for logged-in user with optional filters
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Base filter
    const filters = { user_id: userId };

    // Optional filters from query params
    if (req.query.status) filters.transaction_status = req.query.status;
    if (req.query.type) filters.transaction_type = req.query.type;
    if (req.query.startDate || req.query.endDate) {
      filters.transaction_date = {};
      if (req.query.startDate)
        filters.transaction_date.$gte = new Date(req.query.startDate);
      if (req.query.endDate)
        filters.transaction_date.$lte = new Date(req.query.endDate);
    }

    const transactions = await Transaction.find(filters)
      .sort({ transaction_date: -1 })
      .limit(50);
    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create new transaction tied to logged-in user
router.post("/", verifyToken, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      user_id: req.user._id,
    };
    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
