import React, { useRef, useEffect, useState } from "react";
import "./HomePage.css";
import welcomeImage from "../assets/phone.jpg";
import settingIcon from "../assets/neon-ring.png";
import pic4 from "../assets/pic4.png";
import pic1 from "../assets/pic1.png";
import pic2 from "../assets/e-wallet-concept-illustration.png";
import sendMoney from "../assets/send-money-2.jpg";
import trackSpending from "../assets/track-spending-2.jpg";
import securePayment from "../assets/secure-payment.jpg";

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           entry.target.classList.add("show");
  //         } else {
  //           entry.target.classList.remove("show");
  //         }
  //       });
  //     },
  //     { threshold: 0.4 }
  //   );

  //   const elements = document.querySelectorAll(".autoShow, .autoRotate");
  //   elements.forEach((el) => observer.observe(el));

  //   return () => observer.disconnect();
  // }, []);

  useEffect(() => {
    const icon = document.querySelector(".autoRotate");
    let lastScrollTop = window.scrollY;
    let lastRotation = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollDelta = currentScroll - lastScrollTop;
      lastScrollTop = currentScroll;

      if (icon && icon.classList.contains("show")) {
        lastRotation += scrollDelta * 0.5;
        icon.style.transform = `rotate(${lastRotation}deg)`;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;

          if (entry.isIntersecting) {
            target.classList.add("show");

            // If it's a card-article, trigger the content animation
            if (target.classList.contains("card-article")) {
              target.classList.add("animate"); // <-- This triggers .card-content via CSS
            }
          } else {
            target.classList.remove("show");

            // Optional: remove animation if you want it to reset on scroll out
            if (target.classList.contains("card-article")) {
              target.classList.remove("animate");
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    const elements = document.querySelectorAll(
      ".autoShow, .autoRotate, .card-article"
    );
    elements.forEach((el) => observer.observe(el));

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <div className="welcome-image">
        <img src={welcomeImage} alt="Welcome" />
      </div>
      <div class="typeWriter">
        <p className="simple">Simple.</p>
        <br></br>
        <p className="secure">Secure.</p>
        <br></br>
        <p className="instant">Instant.</p>
        <br></br>
      </div>
      <div className="learnMore">
        <a href="#what-we-do" className="cta">
          Learn More
        </a>
      </div>

      <section className="hero">
        <div className="setting-icon">
          <img src={settingIcon} alt="setting-icon" class="autoRotate" />
        </div>
        <h1 className="autoShow">Welcome to Your Digital Wallet</h1>
        <div className="pic4">
          <img src={pic4} alt="pic" class="autoShow" />
        </div>
        <p className="para1">
          A Safe and Easy Way to Manage Your Virtual Finances Welcome to the
          future of money management! Our Digital Wallet gives you a simple,
          secure, and virtual way to handle your finances. Whether you want to
          track your spending, simulate transfers, or just explore how virtual
          money works, you're in the right place. Here's what you can expect:
          Simulate Real-World Transactions: Make fake deposits, transfer money,
          and check your balance – all without any real financial risk. Get
          Organized: Keep track of every transaction and categorize your
          spending with ease. Explore UPI Transfers: Experience the convenience
          and speed of UPI-based transactions in a virtual environment. Master
          Money Management: Learn how to manage a wallet, monitor balances, and
          review past transactions – all in one place.
        </p>
        <h2 className="autoShow">Why Choose Our Digital Wallet? </h2>.
        <div className="pic2">
          <img src={pic2} alt="pic" class="autoShow" />
        </div>
        <p className="para2">
          Our platform is designed for simplicity and security. Whether you're a
          beginner or an experienced user, you'll find it intuitive to manage
          your virtual wallet. We provide you with powerful tools to practice
          managing your finances, all while keeping your data safe.
        </p>
        <h3 className="autoShow">What’s Inside Your Digital Wallet?</h3>
        <div className="pic1">
          <img src={pic1} alt="pic" class="autoShow" />
        </div>
        <p className="para3">
          User-Friendly Dashboard: A clear and organized space to manage your
          virtual finances. Transaction History: Track every deposit and
          transfer with a simple view of your transaction log. Instant
          Transfers: Experience the ease of making virtual money transfers with
          just a click. Security First: Rest easy knowing that your account is
          protected with the latest security features like MFA and encryption.
        </p>
      </section>

      <section className="what-we-do" id="what-we-do">
        <h2>What We Do</h2>

        <div className="card">
          <div className="card-item">
            <article className="card-article">
              <img src={sendMoney} alt="pic" className="card-img" />
              <div className="cardData">
                <h2 className="cardTitle">Send money</h2>
                <span className="cardDescription">
                  Effortlessly transfer virtual money to friends or family in
                  just a few clicks.{" "}
                </span>
                <a href="#" class="cardButton">
                  Read More
                </a>
              </div>
            </article>

            <article className="card-article">
              <img src={trackSpending} alt="pic" className="card-img" />
              <div className="cardData">
                <h2 className="cardTitle">Track spending</h2>
                <span className="cardDescription">
                  Keep tabs on every transaction with detailed spending history
                  and insights.
                </span>
                <a href="#" class="cardButton">
                  Read More
                </a>
              </div>
            </article>

            <article className="card-article">
              <img src={securePayment} alt="pic" className="card-img" />
              <div className="cardData">
                <h2 className="cardTitle">Secure payment</h2>
                <span className="cardDescription">
                  Experience peace of mind with encrypted data and multi-layer
                  authentication for every transaction.
                </span>
                <a href="#" class="cardButton">
                  Read More
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
