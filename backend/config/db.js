const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({
  path: [
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../../.env"),
  ],
});

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        "MONGO_URI is not set. Add it to backend/.env or the project-root .env file."
      );
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;