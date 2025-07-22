const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const WalletExists = require("../utils/Wallet");
const mongoose = require("mongoose");

// Initiate deposit
const initiateDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, paymentMethod, notes } = req.body;

    if (!amount || !paymentMethod) {
      return res
        .status(400)
        .json({ error: "Amount and payment method are required." });
    }

    const wallet = await WalletExists(userId);

    const transactionReference = `TXN${Date.now()}`;

    // Create new transaction
    const transaction = new Transaction({
      user: userId,
      wallet: wallet._id,
      amount,
      paymentMethod,
      transactionReference,
      notes,
      status: "pending",
      type: "deposit",
      date: new Date(),
    });

    await transaction.save();

    // Add transaction ID to wallet transaction array
    wallet.transactions.push(transaction._id);
    await wallet.save();

    res.status(200).json({
      message: "Deposit details received. Please review and confirm.",
      depositId: transaction._id,
      transactionReference,
    });
  } catch (error) {
    console.error("Deposit initiation error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

// Verify deposit
const verifyDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { depositId } = req.body;

    // Find pending transaction by ID and user
    const transaction = await Transaction.findOne({
      _id: depositId,
      user: userId,
      status: "pending",
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found or already processed." });
    }

    const wallet = await WalletExists(userId);

    // Update wallet balance
    wallet.balance += transaction.amount;
    await wallet.save();

    // Update user's balance field
    const user = await User.findById(userId);
    if (user) {
      user.balance = wallet.balance;
      await user.save();
    }

    // Update transaction status
    transaction.status = "completed";
    await transaction.save();

    res.status(200).json({
      message: "Deposit successful!",
      updatedBalance: wallet.balance,
      transactionReference: transaction.transactionReference,
    });
  } catch (error) {
    console.error("Deposit verification error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

module.exports = { initiateDeposit, verifyDeposit };
