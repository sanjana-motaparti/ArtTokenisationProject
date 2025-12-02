// test.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Artwork from "./models/artModels.js"; // adjust path if needed

dotenv.config(); // <-- important

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

const testArtwork = new Artwork({
  userEmail: "test@example.com",
  title: "Test Painting",
  medium: "Oil",
  fabric: "Canvas",
  dimensions: "24 x 36 inches",
  description: "This is a test painting",
  image: "uploads/test.png",
  desoPublicKey: "BC1YTESTPUBLICKEY",
  desoPostHash: "TEMP_HASH_123456",
});

testArtwork.save()
  .then(() => {
    console.log("✅ Test artwork saved!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  });
