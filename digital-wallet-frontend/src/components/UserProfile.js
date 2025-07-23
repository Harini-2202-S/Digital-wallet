import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user profile from backend
        const userRes = await axios.get(
          "https://digital-wallet-u6ag.onrender.com/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = userRes.data;
        setUser(userData);

        // Fetch wallet data
        const walletRes = await axios.get(
          `https://digital-wallet-u6ag.onrender.com/api/wallet/${userData._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWallet(walletRes.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!user) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        <div className="profile-info">
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Phone: </strong>+91 {user.phone || "Not Provided"}
          </div>
          <div>
            <strong>Payment Handle:</strong> {user.handle || user.paymentHandle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
