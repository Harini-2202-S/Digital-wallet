const express = require("express");
const router = express.Router();
const Deposit = require("../models/Deposit");
const DepositOtp = require("../models/DepositOtp");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Goal = require("../models/Goal");

// Email sending config function
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Deposit OTP Code",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

async function createTransactionForDeposit(userId, deposit) {
  const transaction = new Transaction({
    user_id: userId,
    transaction_id: `TXN${Date.now()}`,
    transaction_type: "deposit",
    counterparty_name: "Self Deposit",
    counterparty_account: "External Source",
    amount: deposit.amount,
    transaction_status: "success",
    payment_method: deposit.paymentMethod || "Transfer",
    narration: "Deposit to wallet",
    currency: "INR",
  });
  await transaction.save();
  return transaction;
}

// Initiate deposit with savingsName
router.post("/initiate-deposit", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, savingsName } = req.body;

    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.email)
      return res.status(400).json({ error: "User does not have an email" });

    const newDeposit = new Deposit({
      user: userId,
      amount,
      savingsName: savingsName || null,
      status: "pending",
      createdAt: new Date(),
      goal: {
        name: req.body.goal?.name || null,
        isCustom: req.body.goal?.isCustom || false,
      },
    });
    await newDeposit.save();

    const otp = DepositOtp.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newOtp = new DepositOtp({
      userId,
      depositId: newDeposit._id,
      otp,
      expiresAt,
    });
    await newOtp.save();

    await sendOtpEmail(user.email, otp);

    res.status(200).json({
      message: "OTP sent for deposit confirmation",
      depositId: newDeposit._id.toString(),
    });
  } catch (error) {
    console.error("Error initiating deposit:", error);
    res.status(500).json({ error: "Server error during deposit initiation" });
  }
});

router.post("/verify", auth, async (req, res) => {
  try {
    const { otp, pin, depositId, sentiment } = req.body;
    const userId = req.user._id;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });

    console.log("⏳ Trying to update goal with:", {
      user: userId,
      name: deposit.goal.name,
    });

    const depositOtp = await DepositOtp.findOne({ userId, depositId, otp });
    if (!depositOtp) return res.status(401).json({ error: "Invalid OTP" });
    if (depositOtp.isExpired())
      return res.status(401).json({ error: "Expired OTP" });

    const user = await User.findById(userId).select("+pinHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPinMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isPinMatch) return res.status(401).json({ error: "Incorrect PIN" });

    deposit.sentiment = sentiment || deposit.sentiment;
    deposit.verified = true;
    deposit.status = "completed";
    await deposit.save();

    const transaction = await createTransactionForDeposit(userId, deposit);
    await Wallet.findOneAndUpdate(
      { userId: userId },
      {
        $inc: { balance: deposit.amount },
        $push: { transactions: transaction._id },
      },
      { new: true, upsert: true }
    );

    // Update saved amount in savings goal
    if (deposit.goal && deposit.goal.name) {
      const goalName = deposit.goal?.name?.trim();

      const updatedGoal = await Goal.findOneAndUpdate(
        {
          user: userId,
          name: { $regex: new RegExp(`^${goalName}$`, "i") },
        },
        {
          $inc: { saved: deposit.amount },
        },
        { new: true }
      );

      if (!updatedGoal) {
        console.warn("⚠️ Goal not found: ", goalName, "for user", userId);
      } else {
        console.log("✅ Goal updated:", updatedGoal);

        // Update savings in Wallet
        await Wallet.findOneAndUpdate(
          { userId: userId },
          { $inc: { savings: deposit.amount } },
          { new: true, upsert: true }
        );
      }
    }

    await DepositOtp.deleteOne({ _id: depositOtp._id });

    res.status(200).json({ message: "Deposit verified and goal updated." });
  } catch (err) {
    console.error("Verify route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/add-savings", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ message: "Missing name or amount" });
    }

    const user = await User.findById(userId);
    user.savings.push({ name, amount });
    await user.save();

    res
      .status(200)
      .json({ message: "Savings added successfully", savings: user.savings });
  } catch (err) {
    console.error("Add savings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/recent", auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ deposits });
  } catch (err) {
    console.error("Failed to fetch recent deposits", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Return all deposits for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ deposits });
  } catch (err) {
    console.error("Failed to fetch all deposits", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
