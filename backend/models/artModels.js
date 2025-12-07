import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  medium: { type: String, required: true },
  fabric: { type: String, required: true },
  dimensions: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  desoPublicKey: { type: String, required: true },
  desoPostHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Artwork", artworkSchema);
