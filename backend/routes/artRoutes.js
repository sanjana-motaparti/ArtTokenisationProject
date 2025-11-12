import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Artwork from "../models/artModels.js";

const router = express.Router();

/* ---------------------------------------
 ✅ Multer Storage Configuration
---------------------------------------- */
const uploadDir = "uploads";

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Add timestamp to filename to avoid collisions
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ---------------------------------------
 ✅ CREATE ART TOKEN
---------------------------------------- */
router.post("/create", upload.array("images", 10), async (req, res) => {
  try {
    const { userEmail, title, medium, fabric, dimensions, description } = req.body;

    // Validate required fields
    if (!userEmail || !title || !medium || !fabric || !dimensions || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Process uploaded files
    const imageFiles = req.files?.map((file) => file.filename) || [];

    // Create new artwork entry
    const newArtwork = new Artwork({
      userEmail,
      title,
      medium,
      fabric,
      dimensions,
      description,
      images: imageFiles,
    });

    await newArtwork.save();

    res.json({
      success: true,
      message: "✅ Artwork token created successfully",
      artwork: newArtwork,
    });
  } catch (error) {
    console.error("❌ Error creating token:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating artwork token",
      error: error.message,
    });
  }
});

/* ---------------------------------------
 ✅ GET ALL ARTWORKS
---------------------------------------- */
router.get("/all", async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: artworks.length,
      artworks,
    });
  } catch (error) {
    console.error("❌ Error fetching artworks:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching artworks",
      error: error.message,
    });
  }
});

/* ---------------------------------------
 ✅ GET ARTWORKS BY USER EMAIL
---------------------------------------- */
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const userArtworks = await Artwork.find({ userEmail: email });

    res.json({
      success: true,
      count: userArtworks.length,
      artworks: userArtworks,
    });
  } catch (error) {
    console.error("❌ Error fetching user's artworks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user's artworks",
      error: error.message,
    });
  }
});

export default router;
