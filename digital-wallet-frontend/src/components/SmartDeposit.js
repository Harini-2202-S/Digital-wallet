import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./SmartDeposit.css";

const motivationalTips = [
  "Save today, secure tomorrow.",
  "A rupee saved is a rupee earned.",
  "Emergency funds = peace of mind.",
  "Discipline now, freedom later.",
  "Tiny deposits make big dreams.",
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

const SmartDeposit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [amount, setAmount] = useState("");
  const [isSavings, setIsSavings] = useState(false);
  const [savingsName, setSavingsName] = useState("");
  const [message, setMessage] = useState("");
  const [goals, setGoals] = useState([]);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [tip, setTip] = useState("");
  const [milestoneMessage, setMilestoneMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
    setTip(
      motivationalTips[Math.floor(Math.random() * motivationalTips.length)]
    );
  }, [location.state?.goalUpdated]);

  const fetchData = async () => {
    try {
      const res1 = await fetch("http://localhost:5000/api/savings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res2 = await fetch("http://localhost:5000/api/deposits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const goalsData = await res1.json();
      const recentData = await res2.json();

      console.log("🌟 Goals fetched:", goalsData.goals);

      setGoals(goalsData.goals || []);
      setRecentDeposits(recentData.deposits || []);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      isSavings &&
      (!savingsName || !goals.some((g) => g.name === savingsName))
    ) {
      setMessage("Please enter a valid savings goal name.");
      return;
    }

    navigate("/deposit", {
      state: {
        amount: parseFloat(amount),
        isSavings,
        savingsName: isSavings ? savingsName : null,
        intent: isSavings ? savingsName : null,
      },
    });
  };

  const checkMilestone = (goal) => {
    if (goal && goal.saved >= goal.target) {
      setMilestoneMessage(
        `🎉 Congrats! You’ve reached your goal: ${goal.name}`
      );
    } else {
      setMilestoneMessage("");
    }
  };

  const ProgressBar = ({ value }) => {
    return (
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${value}%`,
            backgroundSize: "400% 100%",
            backgroundPosition: "left",
          }}
        ></div>
      </div>
    );
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/goal/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Goal deleted: " + (data.deletedGoal?.name || "Goal"));
        fetchData();
      } else {
        alert(data.message || "Failed to delete goal");
      }
    } catch (err) {
      console.error("Error deleting goal", err);
      alert("Error deleting goal");
    }
  };

  return (
    <div className="smart-deposit-dashboard">
      <h1 className="smart-deposit-title">Smart Deposit</h1>

      <div className="dashboard-content">
        <div className="left-panel">
          <div className="tip-section">
            <h2>Tip of the Day</h2>
            <p>{tip}</p>
          </div>

          <div className="recent-deposits">
            <h2>Recent Deposits</h2>
            {recentDeposits.length === 0 ? (
              <p>No deposits yet.</p>
            ) : (
              <ul>
                {recentDeposits.slice(0, 9).map((dep, i) => {
                  const formattedDate = dep.createdAt
                    ? new Date(dep.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown Date";

                  return (
                    <li key={dep._id || i}>
                      ₹{dep.amount.toLocaleString()} — {formattedDate}{" "}
                      {dep.vault && <span>→ {dep.vault}</span>}
                      {dep.intentTag && <span> — {dep.intentTag}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="center-panel">
          <div className="deposit-box">
            <form className="deposit-form" onSubmit={handleSubmit}>
              <div>
                <p>
                  Make every rupee count! Use this page to deposit money into
                  your digital wallet or tag it to a specific savings goal.
                  Whether it's a dream vacation, an emergency fund, or a future
                  purchase — you're one step closer to reaching it!
                </p>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isSavings}
                    onChange={(e) => setIsSavings(e.target.checked)}
                  />
                  <span>Add to Savings</span>
                </label>

                {isSavings && (
                  <>
                    <input
                      type="text"
                      value={savingsName}
                      onChange={(e) => setSavingsName(e.target.value)}
                      list="goal-suggestions"
                      placeholder="Savings Goal Name"
                    />
                    <datalist id="goal-suggestions">
                      {goals.map((goal, i) => (
                        <option key={i} value={goal.name} />
                      ))}
                    </datalist>
                    {!goals.some((g) => g.name === savingsName) &&
                      savingsName !== "" && (
                        <p style={{ color: "red" }}>Goal doesn't exist.</p>
                      )}
                  </>
                )}
              </div>

              <div>
                <button type="submit">Make Deposit</button>
              </div>
              {message && <p>{message}</p>}
              {milestoneMessage && <p>{milestoneMessage}</p>}
            </form>

            <div className="chart-section">
              <h2>Savings Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={goals}
                    dataKey="saved"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {goals.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="goals-section">
            <h2>Your Goals</h2>

            {goals.length === 0 ? (
              <div className="no-goals-placeholder">
                <p>You haven’t set up any savings goals yet.</p>
                <button onClick={() => navigate("/set-goal")}>Set Goal</button>
              </div>
            ) : (
              <>
                {goals.map((goal, idx) => {
                  const percent = ((goal.saved / goal.target) * 100).toFixed(1);
                  return (
                    <div key={idx} className="goal-bar">
                      <p>
                        <strong>{goal.name}</strong>: ₹{goal.saved} / ₹
                        {goal.target} ({percent}%)
                        <button
                          className="delete-goal-btn"
                          onClick={() => deleteGoal(goal._id)}
                        >
                          Delete
                        </button>
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ "--progress": `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                <button
                  className="setup-goal-btn"
                  onClick={() => navigate("/set-goal")}
                >
                  Add Another Goal
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDeposit;
