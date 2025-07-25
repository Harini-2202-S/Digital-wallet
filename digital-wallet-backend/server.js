const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

const allowedOrigins = [
  "https://digital-wallet-1-qqre.onrender.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const connectDB = require("./config/db");
connectDB();

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const userRoutes = require("./routes/user");
const transferRoutes = require("./routes/transfer");
const depositRoutes = require("./routes/deposit");
const transactionRoutes = require("./routes/transactions");
const savingsRoutes = require("./routes/savings");
const spendingLimitRoutes = require("./routes/SpendingLimit");
const otpRoutes = require("./routes/otp");

const Transaction = require("./models/Transaction");

require("./Scheduler/scheduler");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/limit", spendingLimitRoutes);
app.use("/api/Otp", otpRoutes);
app.use("/api/deposits", require("./routes/deposit"));
app.use("/api/goal", require("./routes/goal"));

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

app.get("/api/test-connection", async (req, res) => {
  res.json({
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    uri: process.env.MONGO_URI,
    collections: Object.keys(mongoose.connection.collections),
  });
});
