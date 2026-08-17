const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateDocument = require("../middleware/validateDocument");
const upload = require("../middleware/upload");

const {
  createSubmission,
  uploadDocument,
  submitDocuments,
  reviewDocuments,
  getAllSubmissions,
  getMySubmissions,
  getNotifications,
  deleteDocument

} = require("../controllers/documentController");

// ================= ROUTES =================

// Create submission
router.post("/", authMiddleware, createSubmission);

//  MULTIPLE FILE UPLOAD (FIXED)
router.post(
  "/:id/documents",
  authMiddleware,
   

  (req, res, next) => {
    console.log("🚀 ROUTE HIT: Upload Documents");
    next();
  },

  upload.fields([
    { name: "license", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "photo", maxCount: 1 }
  ]),

  (req, res, next) => {
    console.log("📦 AFTER MULTER:", req.files);
    next();
  },

  validateDocument,
  uploadDocument
);
// Delete document
router.delete(
  "/:submissionId/documents/:documentId",
  authMiddleware,
  deleteDocument
);

// Submit
router.post("/:id/submit", authMiddleware, submitDocuments);

// Review
router.patch("/:id/review", authMiddleware, reviewDocuments);

// Fetch
router.get("/", authMiddleware, getAllSubmissions);
router.get("/my", authMiddleware, getMySubmissions);
router.get("/notifications", authMiddleware, getNotifications);

module.exports = router;