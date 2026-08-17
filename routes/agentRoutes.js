const express = require("express");
const router = express.Router();

const {
  registerAgent,
  activateAgent,
  getAgents,
  getAgentDashboard
} = require("../controllers/agentController");

const validateAgent = require("../middleware/validateAgent");
const authMiddleware = require("../middleware/authMiddleware");

// ================= AGENT ROUTES =================

// Register new agent (with validation middleware)
router.post("/register", validateAgent, registerAgent);

// Get logged-in agent dashboard (requires authentication)
router.get("/dashboard", authMiddleware, getAgentDashboard);

// Get all agents (admin only - role check inside controller)
router.get("/", authMiddleware, getAgents);

// Activate agent account (admin only)
router.patch("/:id/activate", authMiddleware, activateAgent);

module.exports = router;