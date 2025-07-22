import React, { useState } from "react";
import axios from "axios";

const OTPModal = ({ otpToken, setOtp, setOtpModalOpen }) => {
  const [otpInput, setOtpInput] = useState("");

  const handleOtpChange = (e) => {
    setOtpInput(e.target.value);
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("/api/deposit/verify-otp", {
        otp: otpInput,
        token: otpToken,
      });
      if (response.data.message === "OTP verified") {
        alert("OTP Verified. Proceeding with deposit.");
      }
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="otp-modal">
      <h2>Enter OTP</h2>
      <input
        type="text"
        value={otpInput}
        onChange={handleOtpChange}
        maxLength="6"
      />
      <button onClick={handleVerifyOtp}>Verify OTP</button>
      <button onClick={() => setOtpModalOpen(false)}>Cancel</button>
    </div>
  );
};

export default OTPModal;
