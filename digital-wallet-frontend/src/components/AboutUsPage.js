import React from "react";
import "./AboutUsPage.css";

const AboutUsPage = () => {
  return (
    <div className="aboutus-container">
      <h1 className="aboutus-heading">About Us</h1>

      <p className="aboutus-description">
        <strong>SafePay</strong> is a digital wallet platform designed to help
        users manage funds efficiently, securely, and with full transparency.
        Built with user privacy and functionality at its core, SafePay
        simplifies financial operations with intuitive features and real-world
        logic.
      </p>

      <div className="aboutus-section">
        <h2>Key Features</h2>
        <ul>
          <li>
            <strong>Secure Account Management:</strong> Users can register,
            verify via email, and log in securely with password encryption and
            token-based authentication.
          </li>
          <li>
            <strong>Wallet Dashboard:</strong> Displays wallet balance,
            transaction history, and spending insights in a user-friendly
            layout.
          </li>
          <li>
            <strong>Deposit Money:</strong> Users can add money to their wallet
            through a guided deposit process that includes OTP verification and
            secure 4-digit PIN confirmation.
          </li>
          <li>
            <strong>Transaction History:</strong> A complete log of user
            transactions is available with date, amount, and description. The
            smart search function allows filtering for easy access to specific
            records.
          </li>
          <li>
            <strong>Favorites Management:</strong> Users can add and manage
            favorite recipients for quick access during transfers.
          </li>
          <li>
            <strong>Spending Goal Feature:</strong> Allows users to set and
            monitor a monthly spending goal to encourage financial awareness and
            control.
          </li>
        </ul>
      </div>

      <p className="aboutus-footer">
        SafePay is developed with a focus on real-world usability, ensuring each
        feature reflects practical financial needs. We aim to offer a smooth,
        secure, and insightful digital wallet experience.
      </p>
    </div>
  );
};

export default AboutUsPage;
