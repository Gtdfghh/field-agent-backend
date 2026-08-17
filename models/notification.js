const mongoose = require("mongoose");

// ================= NOTIFICATION SCHEMA =================

const notificationSchema = new mongoose.Schema({

  // Reference to agent receiving the notification
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
    index: true // Optimizes fetching notifications for an agent
  },

  // Type of notification event
  type: {
    type: String,
    enum: ["WELCOME", "APPROVED", "REJECTED","SUBMITTED","SUSPENDED"],
    required: true
  },

  // Notification message content
  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Timestamp when notification was sent
  sentAt: {
    type: Date,
    default: Date.now
  },

  // Delivery status of notification
  status: {
    type: String,
    enum: ["SENT", "FAILED"],
    default: "SENT"
  }

}, { timestamps: true }); // Adds createdAt & updatedAt

module.exports = mongoose.model("Notification", notificationSchema);