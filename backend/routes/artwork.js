import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Artwork from "../models/artModels.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// POST route to save artwork
router.post("/create-token", upload.single("image"), async (req, res) => {
  try {
    const { userEmail, title, medium, fabric, dimensions, description, desoPublicKey } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const desoPostHash = "TEMP_HASH_" + Date.now(); // placeholder for DeSo hash

    const artwork = new Artwork({
      userEmail,
      title,
      medium,
      fabric,
      dimensions,
      description,
      image: imagePath,
      desoPublicKey,
      desoPostHash,
    });

    await artwork.save();

    res.json({ success: true, message: "Artwork saved!", hash: desoPostHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
