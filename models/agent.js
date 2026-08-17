const mongoose = require("mongoose");

// ================= AGENT SCHEMA =================

const agentSchema = new mongoose.Schema({

  // Reference to User collection (created after activation)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // Unique email for agent (used for login/account creation)
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },

  // Agent display name (only alphabets allowed)
  displayName: {
    type: String,
    required: [true, "Display name is required"],
    validate: {
      validator: v => /^[A-Za-z\s]+$/.test(v),
      message: "Display name must contain only letters"
    }
  },
    phoneNumber: {
  type: String,
  required: true
},

dateOfBirth: {
  type: Date,
  required: true
},

  // Primary ZIP code for agent location
  primaryZip: {
    type: String,
    required: true
  },

  // Coverage radius in kilometers
  coverageRadiusKm: {
    type: Number,
    required: true
  },

  // Agent capability flags (used for filtering/eligibility)
  hasCamera: Boolean,
  hasVehicle: Boolean,
  hasGps: Boolean,
  hasHighSpeedInternet: Boolean,

  // Optional experience details provided by agent
  experienceNotes: String,

  // Current agent status in system workflow
  agentStatus: {
    type: String,
    enum: ["PENDING","ACTIVE" ,"APPROVED", "REJECTED", "SUSPENDED"],
    default: "PENDING"
  },
  reviewComment: {
    type: String,
    default: ""
  }
 

}, { timestamps: true }); // Automatically adds createdAt & updatedAt

module.exports = mongoose.model("Agent", agentSchema);