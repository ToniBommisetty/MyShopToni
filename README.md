# 🛍️ TO||NI — E-Commerce Clothing Store

A full-stack online clothing store with user accounts, an account settings page, password reset by email OTP, and order placement. Built with Node.js, Express and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## ✨ Features

- **Product catalogue:** browse clothing products and add them to a cart
- **Authentication:** register and log in with **bcrypt**-hashed passwords and **JWT** sessions
- **Account settings:** view and update profile details, which are saved to MongoDB
- **Forgot password:** a one-time code is emailed via Nodemailer, then the password is reset
- **Orders:** place orders and view order history
- **Checkout UI:** supports Visa, Mastercard, PayPal and American Express

## 🔌 API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Log in and receive JWT |
| GET | `/get-user` | Fetch logged-in user |
| PUT | `/update-account` | Update profile |
| POST | `/send-otp` | Email a password-reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| POST | `/placeOrder` | Place an order |
| GET | `/orders` | Order history |

## 🚀 Getting Started

```bash
git clone https://github.com/ToniBommisetty/MyShopToni.git
cd MyShopToni
npm install express mongoose cors bcryptjs jsonwebtoken body-parser nodemailer dotenv
cp .env.example .env     # fill in your own values
node server.js           # http://localhost:5500
```

## 👤 Author

**Sai Narasimha Bommisetty**, Full Stack Developer · [GitHub](https://github.com/ToniBommisetty)
