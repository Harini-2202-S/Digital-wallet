const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const SpendingLimit = require("../models/SpendingLimit");
const Favorite = require("../models/Favorite");
const bcrypt = require("bcryptjs");

// Generate transaction ID
const generateTransactionId = () => {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `TXN${YY}${MM}${DD}${hh}${mm}${ss}${rand}`;
};

const performTransfer = async ({
  senderId,
  recipientHandle,
  amount,
  note,
  purpose,
}) => {
  const sender = await User.findById(senderId);
  const recipient = await User.findOne({
    paymentHandle: { $regex: new RegExp(`^${recipientHandle.trim()}$`, "i") },
  });

  if (!sender || !recipient) throw new Error("Sender or recipient not found");

  const senderWallet = await Wallet.findOne({ userId: sender._id });
  const recipientWallet = await Wallet.findOne({ userId: recipient._id });

  if (!senderWallet || !recipientWallet) throw new Error("Wallet(s) not found");

  if (senderWallet.balance < amount) throw new Error("Insufficient balance");

  senderWallet.balance -= amount;
  recipientWallet.balance += amount;

  await senderWallet.save();
  await recipientWallet.save();

  const txnId = generateTransactionId();

  // Sender transaction
  await Transaction.create({
    user_id: sender._id,
    from: sender.paymentHandle,
    to: recipient.paymentHandle,
    transaction_id: txnId,
    transaction_type: "transfer",
    transaction_status: "success",
    counterparty_name: recipient.name,
    counterparty_account: recipient.paymentHandle,
    amount,
    note,
    purpose,
    timestamp: new Date(),
  });

  // Recipient transaction
  await Transaction.create({
    user_id: recipient._id,
    from: sender.paymentHandle,
    to: recipient.paymentHandle,
    transaction_id: txnId + "R",
    transaction_type: "transfer",
    transaction_status: "success",
    counterparty_name: sender.name,
    counterparty_account: sender.paymentHandle,
    amount,
    note,
    purpose,
    timestamp: new Date(),
  });

  return { from: sender.paymentHandle, to: recipient.paymentHandle };
};

// Handle transfer- the main transfer API
const handleTransfer = async (req, res) => {
  const {
    recipientHandle,
    amount,
    pin,
    note,
    schedule,
    scheduleDate,
    purpose,
  } = req.body;

  if (!recipientHandle || !amount || amount <= 0 || !pin) {
    return res.status(400).json({ msg: "Invalid input" });
  }

  // Authenticates user & PIN
  try {
    const sender = await User.findById(req.user._id).select("+pinHash");
    const recipient = await User.findOne({
      paymentHandle: { $regex: new RegExp(`^${recipientHandle.trim()}$`, "i") },
    });

    if (!recipient) return res.status(404).json({ msg: "Recipient not found" });

    const isPinValid = await bcrypt.compare(pin, sender.pinHash);
    if (!isPinValid) return res.status(401).json({ msg: "Invalid PIN" });

    const senderWallet = await Wallet.findOne({ userId: sender._id });
    const recipientWallet = await Wallet.findOne({ userId: recipient._id });

    if (!senderWallet || !recipientWallet) {
      return res.status(400).json({ msg: "Wallet(s) not found" });
    }

    // Wallets & balance
    const amt = parseFloat(amount);
    if (isNaN(amt) || senderWallet.balance < amt) {
      return res
        .status(400)
        .json({ msg: "Insufficient balance or invalid amount" });
    }

    // Spending Limit Check
    const limitDoc = await SpendingLimit.findOne({
      userId: sender._id,
      contactHandle: recipient.paymentHandle,
    });
    if (limitDoc && amt > limitDoc.limit) {
      return res.status(400).json({
        msg: `Transfer exceeds your set limit for ${recipient.paymentHandle}`,
      });
    }

    // Scheduled Transfer Handling
    if (schedule && scheduleDate) {
      await Transaction.create({
        user_id: sender._id,
        from: sender.paymentHandle,
        to: recipient.paymentHandle,
        transaction_id: generateTransactionId(),
        transaction_type: "transfer",
        transaction_status: "scheduled",
        counterparty_name: recipient.name,
        counterparty_account: recipient.paymentHandle,
        amount: amt,
        note: note || `Scheduled transfer to ${recipient.paymentHandle}`,
        purpose: purpose || "Uncategorized",
        scheduleDate: new Date(scheduleDate),
        timestamp: new Date(),
      });

      return res.json({
        msg: `Transfer scheduled for ${new Date(
          scheduleDate
        ).toLocaleString()}`,
      });
    }

    // Immediate Transfer
    senderWallet.balance -= amt;
    recipientWallet.balance += amt;

    await senderWallet.save();
    await recipientWallet.save();

    // Transaction Record for Sender
    await Transaction.create({
      user_id: sender._id,
      from: sender.paymentHandle,
      to: recipient.paymentHandle,
      transaction_id: generateTransactionId(),
      transaction_type: "transfer",
      transaction_status: "success",
      counterparty_name: recipient.name,
      counterparty_account: recipient.paymentHandle,
      amount: amt,
      note: note || `To ${recipient.paymentHandle}`,
      purpose: purpose || "Uncategorized",
      timestamp: new Date(),
    });

    // Transaction Record for Recipient
    await Transaction.create({
      user_id: recipient._id,
      from: sender.paymentHandle,
      to: recipient.paymentHandle,
      transaction_id: generateTransactionId(),
      transaction_type: "transfer",
      transaction_status: "success",
      counterparty_name: sender.name,
      counterparty_account: sender.paymentHandle,
      amount: amt,
      note: note || `From ${sender.paymentHandle}`,
      purpose: purpose || "Uncategorized",
      timestamp: new Date(),
    });

    res.json({
      msg: "Transfer successful!",
      from: sender.paymentHandle,
      to: recipient.paymentHandle,
      amount: amt,
      newBalance: senderWallet.balance,
      note: note || `To ${recipient.paymentHandle}`,
      estimatedTime: "Instant",
    });
  } catch (err) {
    console.error("Transfer Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Favorites management
// Fetch favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favDoc = await Favorite.findOne({ userId });

    if (!favDoc) {
      return res.json({ favorites: [] });
    }

    res.json({ favorites: favDoc.handles });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ msg: "Server error while fetching favorites" });
  }
};

// Add favorites
const addFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { handle } = req.body;

    if (!handle) {
      return res.status(400).json({ msg: "Handle is required" });
    }

    let favDoc = await Favorite.findOne({ userId });

    if (!favDoc) {
      favDoc = await Favorite.create({ userId, handles: [handle] });
    } else if (!favDoc.handles.includes(handle)) {
      favDoc.handles.push(handle);
      await favDoc.save();
    }

    res.json({ msg: "Added to favorites", favorites: favDoc.handles });
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res.status(500).json({ msg: "Server error while adding favorite" });
  }
};

// Remove favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { handle } = req.body;

    if (!handle) {
      return res.status(400).json({ msg: "Handle is required" });
    }

    const favDoc = await Favorite.findOne({ userId });
    if (!favDoc) {
      return res.status(404).json({ msg: "Favorites not found for user" });
    }

    favDoc.handles = favDoc.handles.filter((h) => h !== handle);
    await favDoc.save();

    res.json({ msg: "Removed from favorites", favorites: favDoc.handles });
  } catch (err) {
    console.error("Error removing from favorites:", err);
    res.status(500).json({ msg: "Server error while removing favorite" });
  }
};

// Returns user details
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-pinHash");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Verify recipient
const verifyRecipient = async (req, res) => {
  try {
    const { recipientHandle } = req.body;
    const recipient = await User.findOne({
      paymentHandle: { $regex: new RegExp(`^${recipientHandle.trim()}$`, "i") },
    });

    if (!recipient) return res.status(404).json({ msg: "Recipient not found" });

    const limitDoc = await SpendingLimit.findOne({
      userId: req.user._id,
      contactHandle: recipientHandle,
    });

    res.json({
      recipientName: recipient.name,
      spendingLimit: limitDoc?.limit || null,
    });
  } catch (err) {
    console.error("verifyRecipient error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Search recipients
const searchRecipients = async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: "Query missing", debug: req.query });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: "Unauthorized: No user info" });
  }

  try {
    const users = await User.find({
      paymentHandle: { $regex: query, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .limit(5)
      .select("paymentHandle");

    res.json(users.map((u) => u.paymentHandle));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  handleTransfer,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUserById,
  performTransfer,
  verifyRecipient,
  searchRecipients,
};
