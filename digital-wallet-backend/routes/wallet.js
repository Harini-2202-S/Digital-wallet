const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const auth = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const Goal = require("../models/Goal");

async function WalletExists(userId) {
  let wallet = await Wallet.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (!wallet) {
    console.log("🪙 No wallet found — creating a new one for:", userId);
    wallet = new Wallet({
      userId: new mongoose.Types.ObjectId(userId),
      balance: 0,
      transactions: [],
    });
    await wallet.save();
    console.log("✅ Wallet created successfully!");
  } else {
    console.log("💼 Wallet already exists for:", userId);
  }
  return wallet;
}

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const wallet = await WalletExists(userId);

    const transactions = await Transaction.find({ user_id: userId })
      .sort({ transaction_date: -1 })
      .limit(50);

    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach((txn) => {
      if (txn.transaction_type === "deposit") {
        incomeTotal += txn.amount;
      } else if (txn.transaction_type === "transfer") {
        expenseTotal += txn.amount;
      }
    });

    const goalDocs = await Goal.find({ user: userId });

    const savings = goalDocs.map((goal) => ({
      name: goal.name,
      amount: goal.saved,
    }));

    res.json({
      balance: wallet.balance,
      income: incomeTotal,
      expense: expenseTotal,
      savings,
      transactions: transactions.map((txn) => ({
        id: txn._id,
        description: txn.narration || txn.counterparty_name || "Transaction",
        amount: txn.amount,
        type: txn.transaction_type,
        date: txn.transaction_date,
      })),
    });
  } catch (error) {
    console.error("Wallet route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
