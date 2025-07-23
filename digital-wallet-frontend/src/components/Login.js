import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import login from "../assets/login-2.png";
import currencyNote from "../assets/currency-note.png";
import pic1 from "../assets/pic1.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        // "http://192.168.68.100:5000/api/auth/login",
        "https://digital-wallet-u6ag.onrender.com/api/auth/login",
        { email, password }
      );

      if (response.data.success) {
        // Store JWT token in localStorage
        localStorage.setItem("token", response.data.token);

        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user && response.data.user.handle) {
          localStorage.setItem("userHandle", response.data.user.handle);
          console.log(
            "Saved userHandle to localStorage:",
            response.data.user.handle
          );
        } else {
          console.warn("response.data.user.handle is missing!");
        }
        const user =
          response.data.user || JSON.parse(localStorage.getItem("user"));

        if (user && !user.hasPin) {
          navigate("/set-pin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(
          response.data.message || "Invalid credentials. Please try again."
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Something went wrong. Please try again later." + (err.message || "")
        );
      }
    }
  };

  return (
    <div className="login-container">
      <div className="btn">
        <label htmlFor="modal_confirm1">Login</label>
      </div>

      <div className="modal">
        <div className="header">
          <img src={login} alt=""></img>
          <img src={currencyNote} alt=""></img>
          <img src={pic1} alt=""></img>
        </div>
        <div className="content">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
