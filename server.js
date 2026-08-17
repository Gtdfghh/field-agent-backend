require("dotenv").config(); // Load environment variables

const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const agentRoutes = require("./routes/agentRoutes");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const logger = require("./utils/logger");
const cors = require("cors");

const app = express();

// ================= DATABASE CONNECTION =================
connectDB();

// ================= MIDDLEWARE =================

// Parse incoming JSON requests

app.use(cors());
app.use(express.json());

// ================= ROUTES =================

// Agent-related routes
app.use("/api/agents", agentRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);

// Document submission routes
app.use("/api/submissions", documentRoutes);

// ================= 404 HANDLER =================

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================= GLOBAL ERROR HANDLER =================

// Centralized error handling middleware
app.use(errorHandler);

// ================= SERVER START =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});


module.exports = app;


