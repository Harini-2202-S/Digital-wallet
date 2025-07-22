//CODE-15
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifyOtp.css";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const jwtToken = location.state?.token;

  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !jwtToken) {
      navigate("/signup");
    }
  }, [email, jwtToken, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || !name || !phone || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      console.log("Sending data:", { name, email, phone, password, otp });

      // Send data to the backend via POST request
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          name,
          email,
          phone,
          password,
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (res.data.token) {
        const { token } = res.data;
        localStorage.setItem("jwtToken", token);
        alert("OTP verified successfully!");
        navigate("/login");
      } else {
        setMessage(res.data.message || "Failed to verify OTP.");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="verify-otp-container">
      <h2>OTP Verification</h2>
      <p>
        OTP sent to: <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify} autoComplete="off">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="off"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="off"
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          autoComplete="off"
        />
        <button type="submit">Verify & Create Account</button>
      </form>

      {message && <p className="error">{message}</p>}
    </div>
  );
};

export default VerifyOtp;
