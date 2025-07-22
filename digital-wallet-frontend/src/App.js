import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Navbar2 from "./components/Navbar2";
import HomePage from "./components/HomePage";
import SignUp from "./components/SignUp";
import SetPassword from "./components/SetPassword";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TransactionHistory from "./components/TransactionHistory";
import PrivateRoute from "./components/PrivateRoute";
import WalletPage from "./components/WalletPage";
import VerifyOtp from "./components/VerifyOtp";
import SetPIN from "./components/SetPIN";
import TransferMoney from "./components/TransferMoney";
import SmartDeposit from "./components/SmartDeposit";
import SetGoalPage from "./components/SetGoalPage";
import SmartDepositForm from "./components/SmartDepositForm";
import UserProfile from "./components/UserProfile";
import BackgroundShards from "./components/BackgroundShards";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUsPage";
import ContactUs from "./components/ContactUs";

const AppContent = () => {
  const location = useLocation();

  const hideNavbarRoutes = ["/set-password", "/verify", "/transaction-history"];

  const showNavbar2Routes = [
    "/TransactionHistory",
    "/dashboard",
    "/deposit",
    "/wallet",
    "/otp-verification",
    "/smart-deposit",
    "/transfer",
    "/profile",
    "/set-goal",
  ];
  const isNavbar2Page = showNavbar2Routes.includes(location.pathname);
  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  let user = null;
  try {
    const userString = localStorage.getItem("user");

    if (
      userString &&
      userString !== "undefined" &&
      userString !== "null" &&
      userString.trim().startsWith("{")
    ) {
      user = JSON.parse(userString);
    } else {
      localStorage.removeItem("user");
    }
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
    localStorage.removeItem("user");
  }

  return (
    <>
      {!shouldHideNavbar && !isNavbar2Page && <Navbar />}
      {isNavbar2Page && <Navbar2 />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/set-password/:token" element={<SetPassword />} />
        <Route
          path="/set-pin"
          element={
            user && !user.hasPin ? (
              <SetPIN />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route path="/TransactionHistory" element={<TransactionHistory />} />
        <Route path="/smart-deposit" element={<SmartDeposit />} />
        <Route path="/deposit" element={<SmartDepositForm />} />
        <Route path="/set-goal" element={<SetGoalPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/transfer" element={<TransferMoney />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <BackgroundShards />
      <AppContent />
      <Footer />
    </Router>
  );
};

export default App;
