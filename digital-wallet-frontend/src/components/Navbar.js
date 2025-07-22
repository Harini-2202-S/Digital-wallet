import React, { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <a href="/">Home</a>
        <a href="/signup">Sign up</a>
        <a href="/login">Login</a>
        <a href="/about-us">About Us</a>
        <a href="/contact-us">Contact US</a>
      </div>
    </nav>
  );
};

export default Navbar;
