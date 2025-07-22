const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Transaction = require("./Transaction");

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/digitalWalletDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// CSV file path
const csvFilePath =
  "C:/Users/Harini/Documents/VIT/MY_PROJECT/digital-wallet/dataset/digital_wallet_transactions.csv";

// Import CSV data
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", async (row) => {
    try {
      const transaction = new Transaction({
        idx: Number(row.idx),
        transaction_id: row.transaction_id,
        user_id: row.user_id,
        transaction_date: new Date(row.transaction_date),
        product_category: row.product_category,
        product_name: row.product_name,
        merchant_name: row.merchant_name,
        product_amount: Number(row.product_amount),
        transaction_fee: Number(row.transaction_fee),
        cashback: Number(row.cashback),
        loyalty_points: Number(row.loyalty_points),
        payment_method: row.payment_method,
        transaction_status: row.transaction_status,
        merchant_id: row.merchant_id,
        device_type: row.device_type,
        location: row.location,
      });

      await transaction.save();
    } catch (error) {
      console.error("❌ Error saving transaction:", error);
    }
  })
  .on("end", () => {
    console.log("✅ CSV file processed and data inserted!");
    mongoose.disconnect();
  });
