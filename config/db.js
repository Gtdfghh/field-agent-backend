const mongoose = require("mongoose");
const logger = require("../utils/logger");

// ================= DATABASE CONNECTION =================

const connectDB = async () => {
  try {

    // Ensure MongoDB URI is provided
    if (!process.env.MONGO_URI) {
      logger.error("MongoDB connection failed: MONGO_URI is not defined");
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Log successful connection
    logger.info("MongoDB connected successfully");

  } catch (error) {

    // Log connection error and exit process
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;