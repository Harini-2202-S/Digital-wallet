import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `https://digital-wallet-u6ag.onrender.com/api/auth/token/verify/${token}`
        );

        if (res.data.success) {
          alert("Email verified successfully! Now set your password.");
          navigate(`/set-password/${token}`);
        } else {
          alert(res.data.message || "Verification failed.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Verification error:", err);
        alert("Something went wrong during verification.");
        navigate("/login");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return <div>Verifying your email, please wait...</div>;
};

export default VerifyEmail;
