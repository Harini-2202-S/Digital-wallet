import React, { useState } from "react";
import OTPVerificationModal from "./OTPVerificationModal";
import axios from "axios";

const DepositConfirmationModal = ({ depositDetails, onClose }) => {
  const [pin, setPin] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const verifyPin = async () => {
    try {
      const res = await axios.post("https://digital-wallet-u6ag.onrender.com/api/deposit/initiate", depositDetails);
      setTransactionId(res.data.transaction_id);

      await axios.post("https://digital-wallet-u6ag.onrender.com/api/deposit/verify-pin", { pin });
      setShowOtpModal(true);
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="modal">
      <h3>Confirm Deposit</h3>
      <input
        type="password"
        maxLength="4"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter 4-Digit PIN"
      />
      <button onClick={verifyPin}>Proceed</button>
      <button onClick={onClose}>Cancel</button>

      {showOtpModal && (
        <OTPVerificationModal transactionId={transactionId} onClose={onClose} />
      )}
    </div>
  );
};

export default DepositConfirmationModal;
