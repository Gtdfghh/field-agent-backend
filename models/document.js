const mongoose = require("mongoose");

// ================= DOCUMENT SCHEMA =================

const documentSchema = new mongoose.Schema({

  // Reference to submission this document belongs to
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DocumentSubmission",
    required: true
  },
 docType: {
    type: String,
    enum: ["LICENSE", "AADHAAR", "PHOTO"], 
    required: true
  },
    

  // Stored file name (S3 object name)
  fileName: {
    type: String,
    required: true
  },

  // Original file name uploaded by user
  originalFileName: {
    type: String,
    required: true
  },

  // S3 object URL (the bucket should remain private)
  fileUrl: {
    type: String,
    required: true
  },

  // S3 object key used to generate secure temporary download URLs
  s3Key: {
    type: String,
    required: true
  },

  // MIME type of file (e.g., pdf, jpeg)
  contentType: {
    type: String,
    required: true
  },

  // File size in bytes (used for validation/audit)
  fileSizeBytes: {
    type: Number,
    required: true
  },

  // Timestamp of upload
  uploadedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Document", documentSchema);