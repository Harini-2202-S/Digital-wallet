import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./WalletPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growthPercentage, setGrowthPercentage] = useState("0.00");
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/wallet";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error("No token found. Please log in again.");

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch wallet data");

        const data = await response.json();
        setWalletData(data);

        const previous = localStorage.getItem("previousBalance");

        if (previous !== null) {
          const previousVal = parseFloat(previous);
          const growth = ((data.balance - previousVal) / previousVal) * 100;
          console.log("✅ Current Balance:", data.balance);
          console.log("🕓 Previous Balance (from localStorage):", previousVal);
          console.log("📈 Growth % Calculated:", growth.toFixed(2));

          setGrowthPercentage(growth.toFixed(2));
        } else {
          console.log("⚠️ No previous balance found.");
          setGrowthPercentage("0.00");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token]);

  // Calculate growth
  useEffect(() => {
    if (walletData?.balance) {
      const previous = localStorage.getItem("previousBalance");

      if (previous !== null) {
        const previousVal = parseFloat(previous);
        const growth = ((walletData.balance - previousVal) / previousVal) * 100;

        console.log("✅ Current:", walletData.balance);
        console.log("🕓 Previous:", previousVal);
        console.log("📈 Growth:", growth.toFixed(2));

        setGrowthPercentage(growth.toFixed(2));
      } else {
        console.log("⚠️ No previous balance. Storing first value...");
        setGrowthPercentage("0.00");
      }
    }
  }, [walletData?.balance]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const incomeDataByMonth = new Array(12).fill(0);
  const expenseDataByMonth = new Array(12).fill(0);

  (walletData?.transactions || []).forEach((txn) => {
    const txnDate = new Date(txn.date);
    if (txnDate.getFullYear() === currentYear) {
      const monthIndex = txnDate.getMonth();
      if (txn.type === "deposit") {
        incomeDataByMonth[monthIndex] += txn.amount;
      } else if (txn.type === "transfer") {
        expenseDataByMonth[monthIndex] += txn.amount;
      }
    }
  });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: incomeDataByMonth,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
      {
        label: "Expenses",
        data: expenseDataByMonth,
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 7 } },
    },
  };

  if (loading) return <div className="wallet-page">Loading wallet data...</div>;
  if (error) return <div className="wallet-page">Error: {error}</div>;

  const growthPercent = growthPercentage;

  return (
    <div className="wallet-page">
      <h1>My Wallet</h1>
      <div className="wallet-content">
        {/* Left Column */}
        <div className="left-column">
          <div className="card-section">
            <div className="balance-card">
              <h5>Your Balance</h5>
              <strong>
                ₹
                {walletData.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </strong>
              <p className="growth">
                Growth Rate:{" "}
                <span
                  style={{
                    color: growthPercentage >= 0 ? "lightgreen" : "red",
                  }}
                >
                  {growthPercentage >= 0 ? "+" : ""}
                  {growthPercentage}% {growthPercentage >= 0 ? "🔼" : "🔽"}
                </span>
              </p>
              <p className="description">
                {growthPercentage > 0
                  ? "Nice! Your savings are increasing."
                  : growthPercentage < 0
                  ? "You’ve spent more than you earned."
                  : "No change in your balance this time."}
              </p>
            </div>
          </div>

          <div className="quick-transfer">
            <h3>Quick Transfer</h3>

            <button onClick={() => navigate("/transfer")}>Send Money</button>
          </div>
        </div>

        {/* Center Column */}
        <div className="center-column">
          <div className="overview">
            <div className="box">
              <h5>Balance</h5>
              <strong>₹{walletData.balance.toLocaleString()}</strong>
            </div>
            <div className="box">
              <h5>Income</h5>
              <strong>₹{walletData.income.toLocaleString()}</strong>
            </div>
            <div className="box">
              <h5>Savings</h5>
              <strong>
                ₹
                {(walletData?.savings || [])
                  .reduce((acc, s) => acc + s.amount, 0)
                  .toLocaleString()}
              </strong>
            </div>
            <div className="box">
              <h5>Expense</h5>
              <strong>₹{walletData.expense.toLocaleString()}</strong>
            </div>
          </div>

          <div className="money-flow">
            <h3>Money Flow</h3>
            <div className="chart-placeholder">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bottom-section">
            <div className="savings">
              <h3>My Savings</h3>
              <ul>
                {(walletData?.savings || []).map((s) => (
                  <li key={s.name}>
                    {s.name} - ₹{s.amount.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>

            <div className="expenses">
              <h3>Smart Spending Tip</h3>
              <p>
                Set a weekly spending limit and track every rupee. Even small
                expenses like subscriptions and snacks can add up!
              </p>
              <ul>
                <li>Review transactions weekly</li>
                <li>Prioritize needs over wants</li>
                <li>Use cashback offers wisely</li>
                <li>Automate savings before spending</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <h3>TRANSACTIONS</h3>
          <ul>
            {walletData.transactions.slice(0, 19).map((txn) => (
              <li key={txn.id}>
                {txn.description} - ₹{txn.amount.toLocaleString()}
              </li>
            ))}
          </ul>
          <button
            className="view-more-button"
            onClick={() => {
              window.location.href = "/TransactionHistory";
            }}
          >
            View More →
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
