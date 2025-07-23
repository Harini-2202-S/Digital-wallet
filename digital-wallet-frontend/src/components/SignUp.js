import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await axios.post(
        "https://digital-wallet-u6ag.onrender.com/api/auth/signup",
        {
          email,
        }
      );

      if (res.data.token) {
        const { token } = res.data;
        localStorage.setItem("jwtToken", token);

        alert("OTP sent to your email.");
        navigate("/verify-otp", {
          state: {
            email,
            token,
          },
        });
      } else {
        setMsg(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Create Account</button>
      </form>
      {msg && <p className="error">{msg}</p>}
    </div>
  );
};

export default SignUp;
