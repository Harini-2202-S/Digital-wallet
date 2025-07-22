import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DepositPage.css";

const DepositPage = () => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [source, setSource] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [depositId, setDepositId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/deposit/initiate",
        { amount, method, source },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setDepositId(response.data.depositId);
      setOtpSent(true);
      setMessage("Deposit initiated. Please verify OTP.");
      setError("");
    } catch (err) {
      console.error("Deposit error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "An error occurred. Try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/deposit/verify",
        { depositId, otp, pin },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage("Deposit successful!");
      setError("");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to verify OTP.");
    }
  };

  return (
    <div className="deposit-page">
      <h2>Deposit Funds</h2>
      {!otpSent ? (
        <form onSubmit={handleDeposit}>
          <label>Amount</label>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label>Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NETBANKING">Net Banking</option>
          </select>

          <label htmlFor="sourceOfFunds">Source of Funds</label>
          <select
            id="sourceOfFunds"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          >
            <option value="">Select Source</option>
            <option value="Salary">Salary</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash Deposit">Cash Deposit</option>
            <option value="Loan">Loan</option>
            <option value="Gift">Gift</option>
            <option value="Investment">Investment</option>
            <option value="Sale of Property">Sale of Property</option>
            <option value="Inheritance">Inheritance</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit">Initiate Deposit</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <label>OTP</label>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <label>PIN</label>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />

          <button type="submit">Verify & Complete Deposit</button>
        </form>
      )}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default DepositPage;
