import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SetPassword.css";

const SetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/set-password",
        {
          token,
          password,
        }
      );

      setMsg(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="set-password-container">
      <h2>Set Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Save Password</button>
      </form>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SetPassword;
