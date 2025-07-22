import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userHandle");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar">
      {/* Text Logo on the left */}
      <div className="nav-logo">SafePay</div>

      {/* Toggle button */}
      <button
        className={`menu-icon ${isMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <div className="line1"></div>
        <div className="line2"></div>
      </button>

      {/* Menu links */}
      <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        <a href="/dashboard">Home</a>
        <a href="/wallet">My Wallet</a>
        <a href="/smart-deposit">Deposit Money</a>
        <a href="/transfer">Transfer Money</a>
        <a href="/TransactionHistory">Transaction History</a>
        <a href="/profile">My Profile</a>
        <button className="nav-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar2;
