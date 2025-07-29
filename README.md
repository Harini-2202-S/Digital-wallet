# Digital-wallet

Digital Wallet Application

A full-stack secure web application that enables users to manage virtual currency transactions, including user registration, login, deposits, withdrawals, and tracking transaction history.

Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB (with Mongoose for schema modeling)
- Authentication: JSON Web Token (JWT), bcrypt.js for password hashing
- Deployment: GitHub, Render
- Version Control: Git

Project Summary

The Digital Wallet Application is a robust and secure web-based platform designed to simulate the core functionalities of a modern e-wallet system. It allows users to securely register, authenticate, and manage virtual funds through an intuitive and minimal user interface.

Key Highlights:

- Developed a clean and responsive interface enabling users to:
  - Register and log in securely
  - Deposit and withdraw funds
  - View real-time balance
  - Access a complete transaction history
- Implemented user authentication using JWT and password encryption with bcrypt.js
- Designed scalable and secure RESTful APIs using Express.js
- Utilized MongoDB with Mongoose for structured data modeling and persistent storage
- Added real-time form validation and user-friendly alert messages for better UX
- Ensured robust backend error handling and status consistency across API responses
- Deployed on Render, enabling live usage and testing of the application

Live Demo

Try the application live:  
 [https://digital-wallet-1-qqre.onrender.com]

How to Run Locally

1. Clone the repository
   bash
   git clone https://github.com/Harini-2202-S/Digital-wallet.git
   cd digital-wallet

2. Install dependencies
   npm install

3. Configure environment variables
   Create a .env file and add:

   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key

4. Start the server
   node server.js

This application will run at https://localhost:5000.

Implemented features

⦁ User registration and login
⦁ Secure password storage with bcrypt
⦁ JWT-based authentication
⦁ Deposit and withdrawal operations
⦁ Real-time balance tracking
⦁ Transaction history logs
⦁ Input validation and alert feedback
⦁ RESTful API architecture
⦁ Hosted and deployed on Render
