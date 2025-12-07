import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* ---------------------------------------
   REGISTER USER
---------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, desoPublicKey } = req.body;

    // Required field check
    if (!name || !email || !phone || !password || !desoPublicKey) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email already registered" });

    // Check if phone already exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists)
      return res.status(400).json({ message: "Phone number already registered" });

    // Check if DeSo public key already exists
    const keyExists = await User.findOne({ desoPublicKey });
    if (keyExists)
      return res.status(400).json({ message: "DeSo Public Key already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      desoPublicKey,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        desoPublicKey: newUser.desoPublicKey,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    // Handle duplicate key errors from MongoDB
    if (error.code === 11000) {
      const dupField = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `${dupField.charAt(0).toUpperCase() + dupField.slice(1)} already exists`,
      });
    }

    res.status(500).json({ message: "Server error while registering user", error });
  }
});

/* ---------------------------------------
   LOGIN USER
---------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email" });

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        desoPublicKey: user.desoPublicKey,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error while logging in", error });
  }
});

/* ---------------------------------------
   STORE / UPDATE DESO PUBLIC KEY
---------------------------------------- */
router.post("/storeDesoKey", async (req, res) => {
  try {
    const { email, desoPublicKey } = req.body;

    if (!email || !desoPublicKey)
      return res.status(400).json({ message: "Email & DeSo Key required" });

    // Check if new deso key is already used by someone else
    const exists = await User.findOne({ desoPublicKey });
    if (exists)
      return res.status(400).json({ message: "DeSo Public Key already registered" });

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { desoPublicKey },
      { new: true }
    );

    if (!updatedUser)
      return res.status(400).json({ message: "User not found" });

    res.json({
      message: "DeSo Key updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("DeSo Key Error:", error);
    res.status(500).json({ message: "Error saving DeSo key", error });
  }
});

export default router;
