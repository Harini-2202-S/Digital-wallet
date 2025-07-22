import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./setPIN.css";

const SetPIN = () => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (pin.length !== 4 || confirmPin.length !== 4) {
      setLoading(false);
      return setError("PIN must be exactly 4 digits.");
    }

    if (pin !== confirmPin) {
      setLoading(false);
      return setError("PINs do not match.");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/user/set-pin",
        { pin },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("PIN set successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error setting PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setpin-container">
      <form onSubmit={handleSubmit} className="setpin-form">
        <h2>Set Your PIN</h2>

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/, ""))}
          maxLength={4}
          pattern="\d{4}"
          placeholder="Enter 4-digit PIN"
          className="pin-input"
          required
        />

        <input
          type="password"
          inputMode="numeric"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/, ""))}
          maxLength={4}
          pattern="\d{4}"
          placeholder="Confirm PIN"
          className="pin-input"
          required
        />

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`submit-button ${loading ? "loading" : ""}`}
        >
          {loading ? "Setting PIN..." : "Set PIN"}
        </button>
      </form>
    </div>
  );
};

export default SetPIN;
