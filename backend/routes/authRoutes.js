import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* ---------------------------------------
 ✅ REGISTER USER
---------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { email, phone, password, desoPublicKey } = req.body;

    // Validate inputs
    if (!email || !phone || !password) {
      return res.status(400).json({ message: "Email, phone, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (include desoPublicKey if provided)
    const newUser = await User.create({
      email,
      phone,
      password: hashedPassword,
      desoPublicKey: desoPublicKey || null,
    });

    res.json({
      message: "✅ User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        desoPublicKey: newUser.desoPublicKey,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Server error while registering user", error });
  }
});

/* ---------------------------------------
 ✅ LOGIN USER
---------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email" });

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "✅ Login successful",
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        desoPublicKey: user.desoPublicKey,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error while logging in", error });
  }
});

/* ---------------------------------------
 ✅ STORE / UPDATE DESO PUBLIC KEY
---------------------------------------- */
router.post("/storeDesoKey", async (req, res) => {
  try {
    const { email, desoPublicKey } = req.body;

    if (!email || !desoPublicKey)
      return res.status(400).json({ message: "Email and Deso Public Key are required" });

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { desoPublicKey },
      { new: true }
    );

    if (!updatedUser)
      return res.status(400).json({ message: "User not found" });

    res.json({
      message: "✅ DeSo Wallet Linked Successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        desoPublicKey: updatedUser.desoPublicKey,
      },
    });
  } catch (error) {
    console.error("❌ Error linking wallet:", error);
    res.status(500).json({ message: "Error linking wallet", error });
  }
});

export default router;
