const logger = require("../utils/logger");

module.exports = (req, res, next) => {

  console.log("🔍 VALIDATION DEBUG FILES:", req.files);

  // ✅ Check files exist
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      message: "At least one file is required"
    });
  }

  const allowedDocs = ["license", "aadhaar", "photo"];

  for (let docType of allowedDocs) {

    if (req.files[docType]) {

      const file = req.files[docType][0];

      console.log(`📄 Checking ${docType}:`, file.originalname);

      // Validate size
      if (typeof file.size !== "number") {
        return res.status(400).json({
          message: `Invalid file size for ${docType}`
        });
      }

      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          message: `${docType.toUpperCase()} exceeds 5MB`
        });
      }
    }
  }

  next();
};