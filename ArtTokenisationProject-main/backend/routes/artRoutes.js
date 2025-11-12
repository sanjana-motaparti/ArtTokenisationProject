import path from "path";
import multer from "multer";
import express from "express";
import Art from "../models/artModels.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Ensure uploads folder exists
import fs from "fs";
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ POST /api/art/create
router.post("/create", upload.single("artworkImage"), async (req, res) => {
  try {
    const {
      artistName,
      artistEmail,
      artworkTitle,
      paintingType,
      fabricType,
      description,
      yearCreated,
      dimensions,
    } = req.body;

    if (
      !artistName ||
      !artistEmail ||
      !artworkTitle ||
      !paintingType ||
      !fabricType ||
      !description ||
      !yearCreated ||
      !dimensions
    ) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Artwork image is required" });
    }

    // ✅ Full URL for browser access
    // inside artRoutes.js POST /create
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // ✅ Save to MongoDB
    const newArt = new Art({
      artistName,
      artistEmail,
      artworkTitle,
      paintingType,
      fabricType,
      description,
      yearCreated,
      dimensions,
      imageUrl,
    });

    await newArt.save();

    // ✅ Log for debugging
    console.log("File saved at:", path.join(uploadDir, req.file.filename));
    console.log("Accessible URL:", imageUrl);

    res.status(201).json({ message: "Artwork stored successfully", data: newArt });
  } catch (error) {
    console.error("❌ Error saving art:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
