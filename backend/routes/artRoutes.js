import express from "express";
import multer from "multer";
import Artwork from "../models/artModels.js";

const router = express.Router();

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");   // make sure folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ CREATE ART TOKEN
router.post("/create", upload.array("images", 10), async (req, res) => {
  try {
    const { userEmail, title, medium, fabric, dimensions, description } = req.body;

    if (!userEmail || !title || !medium || !fabric || !dimensions || !description) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // store uploaded files
    const imageFiles = req.files?.map(file => file.filename) || [];

    const newArtwork = new Artwork({
      userEmail,
      title,
      medium,
      fabric,
      dimensions,
      description,
      images: imageFiles
    });

    await newArtwork.save();

    return res.json({
      success: true,
      message: "Artwork token created successfully",
      data: newArtwork
    });

  } catch (err) {
    console.error("❌ Error creating token:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err
    });
  }
});

export default router;
