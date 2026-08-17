const mongoose = require("mongoose");

// ================= USER SCHEMA =================

const userSchema = new mongoose.Schema({

  // Unique email used for login
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },

  // Hashed password for authentication
  password: {
    type: String,
    required: true
  },

  // Role-based access control (ADMIN or AGENT)
  role: {
    type: String,
    enum: ["ADMIN", "AGENT"],
    default: "AGENT"
  },

  // Account status (used to enable/disable login)

  isSuspended: {
   type: Boolean,
   default: false
},
  resetToken: {
    type:String
  },
resetTokenExpiry:{
  
type: Date
},

},{ timestamps: true }); // Adds createdAt & updatedAt

module.exports = mongoose.model("User", userSchema);