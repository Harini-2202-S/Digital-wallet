import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionHistory.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserHandle = localStorage.getItem("userHandle");
  const normalizeHandle = (handle) => handle?.toLowerCase().split("@")[0] || "";

  // Extract handle to display from email or full handle
  const extractHandle = (handle) => {
    if (!handle) return "N/A";
    if (handle.includes("@")) {
      return handle.split("@")[0];
    }
    return handle;
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setTransactions(res.data.transactions);
        } else {
          setError("Failed to load transactions");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Server error or unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    const formattedDate = date.toISOString().split("T")[0];
    const formattedTime = date.toTimeString().split(" ")[0];
    return { formattedDate, formattedTime };
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Normalize current user handle once
  const currentUserHandleNormalized = normalizeHandle(currentUserHandle);
  console.log("Component Rendered");
  console.log("transactions:", transactions);

  return (
    <div className="transaction">
      <h2>Transaction History</h2>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Counterparty</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No transactions found.
              </td>
            </tr>
          )}

          {transactions.map((txn) => {
            const { formattedDate, formattedTime } = formatDateTime(
              txn.transaction_date
            );

            // Normalize handles to ensure case-insensitive comparison
            const fromNormalized = normalizeHandle(txn.from || "");
            const toNormalized = normalizeHandle(txn.to || "");
            const currentUserHandleNormalized = normalizeHandle(
              currentUserHandle || ""
            );

            console.log("txn.from:", txn.from);
            console.log("txn.to:", txn.to);
            console.log("currentUserHandle:", currentUserHandle);
            console.log(
              "fromNormalized === currentUserHandleNormalized:",
              fromNormalized === currentUserHandleNormalized
            );
            console.log(
              "toNormalized === currentUserHandleNormalized:",
              toNormalized === currentUserHandleNormalized
            );

            // Determine if current user is sender or receiver
            const isSender = fromNormalized === currentUserHandleNormalized;
            const isReceiver = toNormalized === currentUserHandleNormalized;

            let typeLabel = "Unknown4";
            if (txn.transaction_type === "deposit") {
              typeLabel = "Deposit";
            } else if (txn.transaction_type === "transfer") {
              typeLabel = isSender
                ? "Sent"
                : isReceiver
                ? "Received"
                : "Transfer";
            } else if (txn.transaction_type === "credit") {
              typeLabel = isReceiver ? "Received" : "Credit";
            }

            let counterparty = "N/A";
            if (txn.transaction_type === "deposit") {
              counterparty = "Self Deposit";
            } else if (
              txn.transaction_type === "transfer" ||
              txn.transaction_type === "credit"
            ) {
              counterparty = isSender
                ? txn.to || "Unknown"
                : isReceiver
                ? txn.from || "Unknown"
                : "Unknown";
            }

            const isOutgoing = txn.transaction_type === "transfer" && isSender;
            const amountColor = isOutgoing ? "red" : "green";
            const amountSign = isOutgoing ? "-" : "+";

            console.log("txn.transaction_type:", txn.transaction_type);

            const amountValue = Math.abs(Number(txn.amount)).toFixed(2);
            const amountText = `${amountSign} ₹${amountValue}`;

            return (
              <tr key={txn._id || txn.transaction_id}>
                <td>{txn.transaction_id || txn._id}</td>
                <td>{formattedDate}</td>
                <td>{formattedTime}</td>
                <td>{typeLabel}</td>
                <td>{counterparty}</td>
                <td style={{ color: amountColor, fontWeight: "bold" }}>
                  {amountText}
                </td>
                <td>{txn.transaction_status || "Success"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
