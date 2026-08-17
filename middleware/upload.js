const multer = require("multer");

// Keep uploaded files in memory temporarily.
// The controller uploads the buffers directly to AWS S3.
const storage = multer.memoryStorage();

// ================= FILE TYPE VALIDATION =================
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX allowed"), false);
  }
};

// ================= MULTER CONFIGURATION =================
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
