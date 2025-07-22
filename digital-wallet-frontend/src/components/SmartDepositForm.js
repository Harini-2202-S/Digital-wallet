import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./SmartDepositForm.css";

const SmartDepositForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    method: "Bank Transfer",
    sourcePrimary: "Bank",
    sourceSecondary: "",
    goal: {
      name: "",
      isCustom: false,
    },

    autoVaultRule: {
      enabled: false,
      triggerAmount: 5000,
      transferAmount: 1000,
    },
  });

  const [step, setStep] = useState(1);
  const [depositId, setDepositId] = useState(null);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [sentiment, setSentiment] = useState("Neutral");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCustomIntent, setShowCustomIntent] = useState(false);
  const [showCustomPrimary, setShowCustomPrimary] = useState(false);
  const [showCustomSecondary, setShowCustomSecondary] = useState(false);
  const [showCustomMethod, setShowCustomMethod] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.isSavings && location.state?.savingsName) {
      setFormData((prev) => ({
        ...prev,
        goal: {
          ...prev.goal,
          name: location.state.savingsName,
          isCustom: true,
        },
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("goal.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        goal: {
          ...prev.goal,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const initiateDeposit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const cleanedFormData = {
        ...formData,
        goal: {
          name: formData.goal.name.trim(),
          isCustom: formData.goal.isCustom,
        },
      };

      const res = await axios.post(
        "/api/deposit/initiate-deposit",
        cleanedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response data:", res.data);

      if (!res.data.depositId) {
        setMessage("Error: Deposit ID missing in response.");
        return;
      }

      setDepositId(res.data.depositId);
      setStep(2);
      setMessage("");
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const verifyDeposit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/deposit/verify",
        { otp, pin, sentiment, depositId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("OTP received:", otp);
      console.log("PIN received:", pin);

      const updatedBalance = res.data?.updatedBalance;
      if (updatedBalance !== undefined) {
        localStorage.setItem("previousBalance", updatedBalance.toString());
        console.log(
          "💰 Updated previousBalance in localStorage to:",
          updatedBalance
        );
      }

      setMessage("Deposit completed!");
      setStep(3);
    } catch (err) {
      setMessage(
        "Verification failed: " + (err.response?.data?.error || err.message)
      );
    }
  };

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        navigate("/smart-deposit");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  return (
    <div className="smart-deposit-container">
      <h2 className="tex">Smart Deposit</h2>

      {step === 1 && (
        <>
          <input
            name="amount"
            placeholder="Amount"
            type="number"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            list="goal-options"
            name="goal.name"
            placeholder="Enter goal name"
            onChange={handleChange}
          />
          <datalist id="goal-options">
            <option value="Emergency Fund" />
            <option value="Vacation" />
            <option value="Education" />
            <option value="Wedding" />
          </datalist>

          <input
            list="method-options"
            name="method"
            placeholder="Payment Method"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <datalist id="method-options">
            <option value="UPI" />
            <option value="Net Banking" />
            <option value="Card" />
            <option value="Cash Deposit" />
            <option value="Cheque" />
          </datalist>

          <input
            list="source-primary-options"
            name="sourcePrimary"
            placeholder="Primary Source"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <datalist id="source-primary-options">
            <option value="Bank" />
            <option value="Salary" />
            <option value="Gift" />
            <option value="Savings" />
            <option value="Sale" />
            <option value="Freelancing" />
          </datalist>

          <button
            onClick={initiateDeposit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-4 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Continue ➡️"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter 6-digit OTP"
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded"
            autoComplete="off"
            name="otp"
          />

          <input
            type="password"
            placeholder="Enter 4-digit PIN"
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-2 border rounded"
            autoComplete="new-password"
            name="pin"
          />

          <select
            onChange={(e) => setSentiment(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select your mood</option>
            <option value="Motivated">😄 Motivated</option>
            <option value="Neutral">😐 Neutral</option>
            <option value="Regret">😞 Regret</option>
          </select>
          <button
            onClick={verifyDeposit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-4"
          >
            Confirm Deposit
          </button>
        </>
      )}

      {step === 3 && (
        <div className="deposit-success-message">
          <h1>Deposit Confirmed</h1>
          <p className="fade-subtext">Thank you! Redirecting...</p>
        </div>
      )}

      {message && step !== 3 && (
        <p className="text-red-500 text-sm text-center mt-2">{message}</p>
      )}
    </div>
  );
};

export default SmartDepositForm;
