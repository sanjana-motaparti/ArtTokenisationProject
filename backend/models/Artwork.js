import express from "express";
import multer from "multer";
import Artwork from "../models/artwork.js";
import Deso from "deso-protocol";

const router = express.Router();
const deso = new Deso();

/* Multer config */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* Create Token Route */
router.post("/create-token", upload.single("image"), async (req, res) => {
  try {
    const {
      userEmail,
      desoPublicKey,
      title,
      medium,
      fabric,
      dimensions,
      description,
    } = req.body;

    if (!req.file) {
      return res.json({ success: false, message: "No image uploaded!" });
    }

    console.log("Uploading image to DeSo...");

    /* -------------------------------
       1️⃣ Upload image to DeSo Media Layer
    --------------------------------- */
    const imageUpload = await deso.media.uploadImage(
      {
        UserPublicKeyBase58Check: desoPublicKey,
      },
      req.file.buffer
    );

    const imageURL = imageUpload.ImageURL;
    console.log("DeSo Image URL:", imageURL);

    /* -------------------------------
       2️⃣ Create metadata for NFT
    --------------------------------- */
    const metadata = {
      title,
      medium,
      fabric,
      dimensions,
      description,
      imageURL,
    };

    const postBody = JSON.stringify(metadata, null, 2);

    console.log("Creating metadata post on DeSo...");

    const postResponse = await deso.posts.submitPost({
      UpdaterPublicKeyBase58Check: desoPublicKey,
      BodyObj: { Body: postBody, ImageURLs: [imageURL] },
    });

    const postHashHex = postResponse.PostHashHex;

    console.log("Metadata Post Created:", postHashHex);

    /* -------------------------------
       3️⃣ Mint NFT from this post
    --------------------------------- */
    console.log("Minting NFT...");

    const nftResponse = await deso.nft.createNft({
      UpdaterPublicKeyBase58Check: desoPublicKey,
      PostHashHex: postHashHex,
      NumCopies: 1,
      NFTRoyaltyToCreatorBasisPoints: 100,
      NFTRoyaltyToUnlockableBasisPoints: 0,
    });

    console.log("NFT Minted:", nftResponse);

    /* -------------------------------
       4️⃣ Save to MongoDB
    --------------------------------- */
    const newArtwork = new Artwork({
      userEmail,
      title,
      medium,
      fabric,
      dimensions,
      description,
      images: [imageURL],
    });

    await newArtwork.save();

    /* -------------------------------
       5️⃣ Send Response
    --------------------------------- */
    res.json({
      success: true,
      message: "Token created successfully!",
      hash: postHashHex,
      imageURL,
    });

  } catch (err) {
    console.error("Error creating token:", err);
    res.json({ success: false, message: "Server Error", error: err });
  }
});

export default router;
