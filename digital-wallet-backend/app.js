const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

const otpRoutes = require("./routes/otp");
const walletRoutes = require("./routes/wallet");
const depositRoutes = require("./routes/depositRoutes");

app.use("/api/otp", otpRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/goal", require("./routes/goal"));

// Start the server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
