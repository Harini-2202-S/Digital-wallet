import React, { useState } from "react";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="contact-wrapper">
      <div className="contact-content">
        <div className="contact-left">
          <h2>Need Help? Let’s Talk</h2>
          <p>
            Reach out to us with your queries, feedback, or concerns. Our
            SafePay support team is here to assist you.
          </p>
          <br />
          <br />
          <br />

          <ul>
            <li>
              <strong>Email:</strong> support@safepay.app
            </li>
            <li>
              <strong>Phone:</strong> +91-98765-43210
            </li>
            <li>
              <strong>Office:</strong> 4th Floor, Fintech Tower, Bengaluru
            </li>
          </ul>
        </div>

        <div className="contact-center">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Send a Message</h3>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="contact-right">
          <iframe
            title="SafePay Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.647949092502!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670b2a45b55%3A0x6a7f6f05c1cc7177!2sBangalore!5e0!3m2!1sen!2sin!4v1634297104231"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
