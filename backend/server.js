import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import artRoutes from "./routes/artRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

/* ---------------------------------------
 ✅ Middleware
---------------------------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------
 ✅ MongoDB Connection
---------------------------------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* ---------------------------------------
 ✅ Ensure Upload Folder Exists
---------------------------------------- */
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 Created uploads/ folder");
}

/* ---------------------------------------
 ✅ API Routes
---------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/art", artRoutes);

/* ---------------------------------------
 ✅ Serve Frontend (HTML/CSS/JS)
---------------------------------------- */
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ---------------------------------------
 ✅ Start Server
---------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
