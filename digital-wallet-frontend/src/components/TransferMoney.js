import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TransferMoney.css";

const TransferMoney = () => {
  const [step, setStep] = useState(1);
  const [to, setTo] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [spendingLimit, setSpendingLimit] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get("/api/user/favorites", config);
        setFavorites(res.data.favorites);
      } catch (err) {
        console.error("Failed to fetch favorites");
      }
    };
    fetchFavorites();
  }, []);

  const verifyRecipient = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/transfer/verify-recipient",
        { recipientHandle: to },
        config
      );
      setRecipientName(res.data.recipientName);
      setSpendingLimit(res.data.spendingLimit || null);
      setMessage("");
      setStep(2);
    } catch (error) {
      setMessage("Recipient not found");
    } finally {
      setLoading(false);
    }
  };

  const confirmTransfer = () => {
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("Enter a valid amount");
      return;
    }
    if (spendingLimit && numericAmount > spendingLimit) {
      setMessage(`Exceeds limit of ₹${spendingLimit} for this contact`);
      return;
    }
    setMessage("");
    setStep(3);
  };

  const executeTransfer = async () => {
    if (!pin || pin.length !== 4) {
      setMessage("Enter a valid 4-digit PIN");
      return;
    }

    const numericAmount = Number(amount);
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/transfer/initiate",
        {
          recipientHandle: to,
          amount: numericAmount,
          pin,
          note,
          schedule,
          scheduleDate,
          purpose,
        },
        config
      );

      if (res.data?.updatedBalance) {
        localStorage.setItem(
          "previousBalance",
          res.data.updatedBalance.toString()
        );
        console.log("Updated previousBalance to:", res.data.updatedBalance);
      }

      setMessage(res.data.msg);
      setStep(4);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      const res = await axios.post(
        "/api/transfer/favorites/add",
        { handle: to },
        config
      );
      alert("Added to favorites!");
      setFavorites(res.data.favorites);
    } catch (err) {
      alert("Failed to add to favorites.");
      console.error("Add to favorites error:", err);
    }
  };

  const handleRemoveFavorite = async (fav) => {
    try {
      const res = await axios.post(
        "/api/transfer/favorites/remove",
        { handle: fav },
        config
      );
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  return (
    <div className="transfer-container">
      {/* Left Section */}
      <h2 className="transfer-heading">Transfer Money</h2>
      <div className="transfer-form-section">
        {step === 1 && (
          <>
            <label className="form-label">Select from Favorites:</label>
            <div className="favorites-inline">
              {favorites.length === 0 ? (
                <p className="no-fav">No favorites</p>
              ) : (
                favorites.map((fav) => (
                  <button
                    key={fav}
                    className="fav-bubble"
                    onClick={() => setTo(fav)}
                  >
                    {fav}
                  </button>
                ))
              )}
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Enter recipient handle"
                value={to}
                onChange={async (e) => {
                  const value = e.target.value;
                  setTo(value);
                  if (value.trim() === "") {
                    setSuggestions([]);
                    return;
                  }
                  try {
                    const res = await axios.get(
                      `/api/transfer/search-recipients?query=${value}`,
                      config
                    );
                    setSuggestions(res.data);
                  } catch (err) {
                    console.error("Search error", err);
                    setSuggestions([]);
                  }
                }}
              />
              {suggestions.length > 0 && (
                <ul className="suggestion-list">
                  {suggestions.map((sug) => (
                    <li
                      key={sug}
                      onClick={() => {
                        setTo(sug);
                        setSuggestions([]);
                      }}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className="primary-btn"
              onClick={verifyRecipient}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Next"}
            </button>
            {message && <p className="error">{message}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <p>
              <strong>Recipient:</strong> {recipientName}
            </p>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="">Select purpose</option>
              <option value="Rent">Rent</option>
              <option value="Shopping">Shopping</option>
              <option value="Education">Education</option>
              <option value="Gift">Gift</option>
              <option value="Other">Other</option>
            </select>
            <label className="schedule-label">
              <input
                type="checkbox"
                checked={schedule}
                onChange={(e) => setSchedule(e.target.checked)}
              />
              Schedule this transfer
            </label>
            {schedule && (
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            )}
            <button className="primary-btn" onClick={confirmTransfer}>
              Proceed
            </button>
            {message && <p className="error">{message}</p>}
          </>
        )}

        {step === 3 && (
          <>
            <p>
              <strong>To:</strong> {recipientName}
            </p>
            <p>
              <strong>Amount:</strong> ₹{amount}
            </p>
            <p>
              <strong>Note:</strong> {note || "—"}
            </p>
            <p>
              <strong>Purpose:</strong> {purpose || "Not specified"}
            </p>
            {schedule && (
              <p>
                <strong>Scheduled for:</strong>{" "}
                {new Date(scheduleDate).toLocaleString()}
              </p>
            )}
            <input
              type="password"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setPin(val);
              }}
            />
            <button className="primary-btn" onClick={executeTransfer}>
              Confirm & Send
            </button>
            {message && <p className="error">{message}</p>}
          </>
        )}

        {step === 4 && (
          <>
            <h3>{message}</h3>
            <button className="fav-add-button" onClick={handleAddToFavorites}>
              Add this recipient to Favorites
            </button>
            <button onClick={() => window.location.reload()}>
              New Transfer
            </button>
          </>
        )}
      </div>

      {/* Right Section: Favorites */}
      <div className="favorites-column">
        <h3>Your Favorites</h3>
        {favorites.length === 0 ? (
          <p>No favorites</p>
        ) : (
          favorites.map((fav) => (
            <div className="favorite-item" key={fav}>
              <span>{fav}</span>
              <div className="fav-buttons">
                <button onClick={() => setTo(fav)}>Transfer</button>
                <button
                  className="remove-btn"
                  onClick={() =>
                    window.confirm(`Remove ${fav}?`) &&
                    handleRemoveFavorite(fav)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransferMoney;
