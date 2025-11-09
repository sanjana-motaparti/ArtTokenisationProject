import mongoose from "mongoose";

const artSchema = new mongoose.Schema({
  artistName: String,
  artistEmail: String,
  artworkTitle: String,
  paintingType: String,
  fabricType: String,
  description: String,
  yearCreated: Number,
  dimensions: String,
  imageUrl: String,
});

const Art = mongoose.model("Art", artSchema);
export default Art;
