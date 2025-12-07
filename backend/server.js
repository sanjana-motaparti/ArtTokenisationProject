import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import artworkRoutes from "./routes/artwork.js";
import authRoutes from "./routes/authRoutes.js";   // ✅ Added

dotenv.config();

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* MongoDB Connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* Ensure uploads folder exists */
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const __dirname = path.resolve();

/* Serve uploads */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* API Routes */
app.use("/api/artwork", artworkRoutes);
app.use("/api/auth", authRoutes);   // ✅ Auth API added

/* Serve frontend */
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/createToken.html"));
});

/* Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
