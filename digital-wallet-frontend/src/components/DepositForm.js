import React, { useState } from "react";
import axios from "axios";
import OTPModal from "./OTPModal";

const DepositForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bankTransfer");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setAmount(value);
    } else if (name === "paymentMethod") {
      setPaymentMethod(value);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/deposit/generate-otp", {
        email: "user@example.com",
      });
      setOtpToken(response.data.token);
      setOtpModalOpen(true);
    } catch (error) {
      alert("Error generating OTP");
    }
  };

  return (
    <div className="deposit-form">
      <h2>Deposit Funds</h2>
      <label>Amount</label>
      <input
        type="number"
        name="amount"
        value={amount}
        onChange={handleInputChange}
        required
      />

      <label>Payment Method</label>
      <select
        name="paymentMethod"
        value={paymentMethod}
        onChange={handleInputChange}
        required
      >
        <option value="bankTransfer">Bank Transfer</option>
        <option value="card">Credit/Debit Card</option>
        <option value="eWallet">E-Wallet</option>
      </select>

      <button onClick={handleSubmit}>Proceed</button>

      {otpModalOpen && (
        <OTPModal
          otpToken={otpToken}
          setOtp={setOtp}
          setOtpModalOpen={setOtpModalOpen}
        />
      )}
    </div>
  );
};

export default DepositForm;
