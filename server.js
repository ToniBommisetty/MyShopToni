// Updated server.js with account settings persistence support
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schemas
const authUserSchema = new mongoose.Schema({
  userId: String,
  firstname: String,
  surname: String,
  mobile: String,
  email: { type: String, unique: true },
  password: String,
  username: String,
  bio: String,
  birthday: String,
  country: String,
  twitter: String,
  linkedIn: String,
  profilePic: String
});
const AuthUser = mongoose.model("AuthUser", authUserSchema);

const orderSchema = new mongoose.Schema({
    itemName: String,
    quantity: Number,
    price: Number,
    image: String,
    status: { type: String, default: "processing" },
    username: String,
    email: String,
    phone: String,
    address: String,
    orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// ======= OTP & Email Setup =======
const otpStore = new Map();
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ======= Routes =======

// Register
app.post("/register", async (req, res) => {
  const { firstname, surname, mobile, email, password } = req.body;
  try {
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Math.random().toString(36).substring(2, 10); 
    const username = email.split('@')[0];
    const newUser = new AuthUser({ userId, firstname, surname, mobile, email, password: hashedPassword, username });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, redirectUrl: "frontpage.html" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get User by Email
app.get("/get-user", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await AuthUser.findOne({ email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Account Info
app.put("/update-account", async (req, res) => {
  const { email, username, fullname } = req.body;
  const [firstname, ...rest] = fullname.trim().split(" ");
  const surname = rest.join(" ");

  try {
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username;
    user.firstname = firstname;
    user.surname = surname;
    await user.save();

    res.status(200).json({ message: "Account updated successfully", user });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save full profile data
app.post("/api/user/update", async (req, res) => {
  const { userID, ...updateData } = req.body;
  try {
    await AuthUser.findByIdAndUpdate(userID, updateData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get full profile data
app.get("/api/user/:id", async (req, res) => {
  try {
    const user = await AuthUser.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const user = await AuthUser.findOne({ email });
  if (!user) return res.status(404).json({ message: "Email not registered" });

  const otp = generateOTP();
  otpStore.set(email, otp);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`
    });
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Error sending email" });
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const storedOtp = otpStore.get(email);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    otpStore.delete(email);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Place Order
app.post("/placeOrder", async (req, res) => {
  const { username, email, phone, address, items } = req.body;
  if (!username || !email || !phone || !address || !Array.isArray(items)) {
    return res.status(400).json({ message: "Missing or invalid order information" });
  }

  try {
    const orders = items.map(item => ({
      itemName: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      username,
      email,
      phone,
      address,
      orderDate: new Date()
    }));

    await Order.insertMany(orders);
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to place order" });
  }
});

// Get Orders
app.get("/orders", async (req, res) => {
  const { email } = req.query;
  try {
    const orders = await Order.find({ email }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Start Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
