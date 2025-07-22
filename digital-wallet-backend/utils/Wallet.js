const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

async function WalletExists(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  let wallet = await Wallet.findOne({ userId: objectId });

  if (!wallet) {
    wallet = new Wallet({
      userId: objectId,
      transactions: [],
    });
    await wallet.save();
    console.log("Wallet created for user:", userId);
  }

  return wallet;
}

module.exports = WalletExists;
