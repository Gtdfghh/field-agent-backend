const mongoose = require("mongoose");

// ================= DOCUMENT SUBMISSION SCHEMA =================

const documentSubmissionSchema = new mongoose.Schema({

  // Reference to agent who owns this submission
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
    index: true // Improves query performance for agent-based lookups
  },

  // Current status of submission workflow
  status: {
    type: String,
    enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED","SUSPENDED"],
    default: "DRAFT"
  },

  // Timestamp when submission was finalized by agent
  submittedAt: Date,

  // Timestamp when admin reviewed the submission
  reviewedAt: Date,

  // Reference to admin user who reviewed the submission
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Optional comments provided during review
  reviewComments: {
    type: String,
    maxlength: 500
  }

}, { timestamps: true }); // Adds createdAt & updatedAt automatically

module.exports = mongoose.model("DocumentSubmission", documentSubmissionSchema);