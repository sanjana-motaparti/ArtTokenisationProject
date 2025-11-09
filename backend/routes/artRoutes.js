import express from "express";
import multer from "multer";
import Art from "../models/artModels.js"; // ✅ make sure this path matches exactly

const router = express.Router();

// File upload config (Multer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/art/create
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

    const newArt = new Art({
      artistName,
      artistEmail,
      artworkTitle,
      paintingType,
      fabricType,
      description,
      yearCreated,
      dimensions,
      image: req.file ? req.file.buffer.toString("base64") : null,
    });

    await newArt.save();

    res.status(201).json({ message: "Artwork stored successfully", data: newArt });
  } catch (error) {
    console.error("❌ Error saving art:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
