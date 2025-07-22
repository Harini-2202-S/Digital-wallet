const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const { performTransfer } = require("../controllers/TransferController");

// Schedule function
const runScheduledTransfers = async () => {
  const now = new Date();
  console.log(
    "⏰ Checking for due scheduled transfers at",
    now.toLocaleString()
  );

  const scheduledTxns = await Transaction.find({
    transaction_status: "scheduled",
    scheduleDate: { $lte: now },
  });

  console.log("🔍 Found", scheduledTxns.length, "scheduled transactions");

  for (const txn of scheduledTxns) {
    console.log("🔁 Processing txn:", txn.transaction_id);

    const sender = await User.findOne({ paymentHandle: txn.from });
    const recipient = await User.findOne({ paymentHandle: txn.to });

    if (!sender || !recipient) {
      console.log("❌ Sender or recipient not found");
      continue;
    }

    const senderWallet = await Wallet.findOne({ userId: sender._id });
    const recipientWallet = await Wallet.findOne({ userId: recipient._id });

    if (!senderWallet || !recipientWallet) {
      console.log("❌ Wallets not found");
      continue;
    }

    const amt = txn.amount;

    if (senderWallet.balance < amt) {
      console.log(`❌ Insufficient funds for transfer from ${txn.from}`);
      continue;
    }

    senderWallet.balance -= amt;
    recipientWallet.balance += amt;

    await senderWallet.save();
    await recipientWallet.save();

    txn.transaction_status = "success";
    txn.timestamp = new Date();
    await txn.save();

    await Transaction.create({
      user_id: recipient._id,
      from: txn.from,
      to: txn.to,
      transaction_id: txn.transaction_id + "R",
      transaction_type: txn.transaction_type,
      transaction_status: "success",
      counterparty_name: sender.name,
      counterparty_account: sender.paymentHandle,
      amount: amt,
      note: txn.note,
      purpose: txn.purpose,
      timestamp: new Date(),
    });

    console.log(`Executed transfer from ${txn.from} to ${txn.to}`);
  }
};

setInterval(runScheduledTransfers, 60 * 1000);
