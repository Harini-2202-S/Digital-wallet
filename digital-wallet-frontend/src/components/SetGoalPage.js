import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SetGoalPage.css";

const SetGoalPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !target) {
      setMessage("Name and target amount are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name,
          target: parseFloat(target),
          note,
          deadline,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const data = await res.json();
      if (res.ok) {
        setMessage("Goal created successfully!");
        setTimeout(
          () => navigate("/smart-deposit", { state: { goalUpdated: true } }),
          1500
        );
      } else {
        setMessage(data.message || "Failed to create goal.");
      }
    } catch (err) {
      console.error("Error creating goal", err);
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="set-goal-page">
      <h1>Set Up a New Savings Goal</h1>
      <form className="goal-form" onSubmit={handleSubmit}>
        <label>
          Goal Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Emergency Fund"
            required
          />
        </label>

        <label>
          Target Amount (₹):
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </label>

        <label>
          Deadline (optional):
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label>
          Note (optional):
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why are you saving for this goal?"
          ></textarea>
        </label>

        <button type="submit">Create Goal</button>
        {message && <p className="goal-message">{message}</p>}
      </form>

      <button className="back-btn" onClick={() => navigate("/smart-deposit")}>
        ⬅ Back to Deposit
      </button>
    </div>
  );
};

export default SetGoalPage;
