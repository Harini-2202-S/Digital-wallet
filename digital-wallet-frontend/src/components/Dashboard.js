import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { jwtDecode } from "jwt-decode";

const DashboardPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLit, setIsLit] = useState(false);

  const [uniqueData, setUniqueData] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();
  const glowWordRef = useRef();
  const heroRef = useRef();
  const glowRef = useRef();
  const titleRef = useRef();

  // Fetch wallet data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated. Please log in.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          // "http://192.168.68.102:5000/api/wallet",
          "http://localhost:5000/api/wallet",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBalance(response.data.balance);
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Decode token and fetch unique user data based on email
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const email = decoded.email;
      setUserEmail(email);
      fetchUniqueDashboardData(email);
    } else {
      setError("You are not authenticated. Please log in.");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch unique user data
  const fetchUniqueDashboardData = async (userEmail, token) => {
    try {
      const response = await axios.get(
        // `http://192.168.68.102:5000/api/wallet/userdata/${userEmail}`,
        `http://localhost:5000/api/wallet/userdata/${userEmail}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUniqueData(response.data);
    } catch (error) {
      console.error("Error fetching unique user data", error);
    }
  };

  const fetchUserDetails = async (userId, token) => {
    try {
      const response = await axios.get(
        // `http://192.168.68.102:5000/api/user/${userId}`,.
        `http://localhost:5000/api/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setUserName(data.name);
      setUserHandle(data.paymentHandle);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (token && storedUser?._id) {
      fetchUserDetails(storedUser._id, token);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("_id");

    if (token && userId) {
      axios
        .get(`http://localhost:5000/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUserName(res.data.name);
          setUserHandle(res.data.paymentHandle);
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        });
    }
  }, []);

  // Glow line mouse tracking & overlap detection
  useEffect(() => {
    const interval = setInterval(() => {
      const heroSection = heroRef.current;
      const glowLine = glowRef.current;

      if (heroSection && glowLine) {
        clearInterval(interval);

        const handleMouseMove = (e) => {
          const rect = heroSection.getBoundingClientRect();
          const x = e.clientX - rect.left;

          glowLine.style.transform = `translate(${x}px, -50%)`;

          const percentageX = (x / rect.width) * 100;
          heroSection.style.setProperty("--glow-x", `${percentageX}%`);

          // Overlap detection
          const glowRect = glowLine.getBoundingClientRect();
          const wordRect = glowWordRef.current?.getBoundingClientRect();
          if (wordRect) {
            const isOverlapping =
              glowRect.left < wordRect.right && glowRect.right > wordRect.left;
            setIsLit(isOverlapping);
          }
        };

        heroSection.addEventListener("mousemove", handleMouseMove);
        return () =>
          heroSection.removeEventListener("mousemove", handleMouseMove);
      }
    }, 100);
  }, []);

  useEffect(() => {
    const handleGlowEffect = () => {
      const glowLine = glowRef.current;
      const word = glowWordRef.current;

      if (!glowLine || !word) return;

      const lineRect = glowLine.getBoundingClientRect();
      const letters = word.querySelectorAll(".glow-letter");

      letters.forEach((letter) => {
        const letterRect = letter.getBoundingClientRect();
        const isOverlapping =
          lineRect.left < letterRect.right && lineRect.right > letterRect.left;

        if (isOverlapping) {
          letter.classList.add("active-glow");
        } else {
          letter.classList.remove("active-glow");
        }
      });
    };

    const interval = setInterval(handleGlowEffect, 16);

    return () => clearInterval(interval);
  }, []);

  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [userHandle, setUserHandle] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning!");
    else if (hour < 17) setGreeting("Good Afternoon!");
    else setGreeting("Good Evening!");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const handle = localStorage.getItem("userHandle");

    if (storedUser) {
      setUserName(storedUser.name || storedUser.email?.split("@")[0]);
      setUserHandle(handle || "Not Available");
    }
  }, []);

  return (
    <div className="dashboard-container">
      <section className="hero-section" ref={heroRef}>
        <div className="glow-line" ref={glowRef}></div>
        <div className="hero-text">
          <h1>
            <span ref={glowWordRef} className="hidden-word">
              {greeting.split(" ").map((word, i) => (
                <span key={i} className="glow-word">
                  {word.split("").map((char, j) => (
                    <span key={j} className="glow-letter">
                      {char}
                    </span>
                  ))}
                  <span className="glow-space"> </span>
                </span>
              ))}

              <br />

              {userName.split(" ").map((word, i) => (
                <span key={i} className="glow-word">
                  {word.split("").map((char, j) => (
                    <span key={j} className="glow-letter">
                      {char}
                    </span>
                  ))}
                  <span className="glow-space"> </span>
                </span>
              ))}

              <br />

              <span className="glow-word handle-text">
                {userHandle.split("").map((char, i) => (
                  <span key={i} className="glow-letter">
                    {char}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p>
            Welcome back! Your wallet is secure and ready to use. All your
            transactions are protected, and your data stays safe with us —
            always. Many credit cards are lost by the users, stolen or expired.
            But those cards can still be used by others. Our app provides you
            with a new and necessary innovation.
          </p>
          <div className="cta-buttons">
            <button className="get-now">Get It Now</button>
            <button className="download">Download App</button>
          </div>
        </div>

        <div className="para-content">
          <h1>Trusted by thousands</h1>
          <p>
            Join a growing community of over <b>15,000+</b> users who trust
            SafePay for fast, simple, and secure digital transactions. Whether
            it’s splitting bills, transferring funds, or managing your wallet —
            SafePay makes it effortless. We’re proud to be part of your daily
            routine, and we’re only just getting started!
          </p>
        </div>

        <div className="hero-visual custom-cards">
          <div className="credit-card front-card">
            <div className="chip"></div>
            <div className="text1">Credit card</div>
            <div className="text2">Bank</div>
            <div className="card-number">5246 1234 5678 9012</div>
            <div className="card-info">
              <span className="card-holder">{userName || "Loading..."}</span>
              <span className="expiry">12/28</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wallet-stats">
        <div className="balance-box">
          <h2>Wallet Balance</h2>
          <p>₹{balance}</p>
        </div>

        <div className="transactions-box">
          <h3>Transaction History</h3>

          <ul>
            {transactions.slice(0, 5).map((t, idx) => {
              const date = new Date(t.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const time = new Date(t.date).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <li key={idx} className="txn-item">
                  <div className="txn-row">
                    <span className={`txn-type ${t.type}`}>
                      {t.type === "deposit" ? "⬆ Deposit" : "⬇ Transfer"}
                    </span>
                    <span className="txn-amount">₹{t.amount}</span>
                  </div>
                  <div className="txn-meta">
                    <span>{date}</span>
                    <span className="txn-time">{time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="txn-summary">
            Showing latest {Math.min(5, transactions.length)} of{" "}
            {transactions.length} transactions
          </p>
        </div>

        <div className="smart-tips-container">
          <h2>Smart Saving & Spending Tips</h2>
          <div className="tip-card">
            Track before you spend — you’ll be surprised where your money goes!
          </div>
          <div className="tip-card">
            The 24-hour rule: delay non-essential purchases to avoid impulse
            buys.
          </div>
          <div className="tip-card">
            Set up auto-savings — even ₹500/month builds up fast.
          </div>
          <div className="tip-card">
            Stick to the 50/30/20 rule — Needs / Wants / Savings.
          </div>
          <div className="tip-card">
            Cancel those forgotten subscriptions draining your wallet.
          </div>
          <div className="tip-card">
            Try no-spend days — your wallet and mind will thank you.
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
