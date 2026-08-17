const logger = require("../utils/logger");

// ================= GLOBAL ERROR HANDLER =================

const errorHandler = (err, req, res, next) => {

  // Log error message for debugging/monitoring
  logger.error(err.message);

  // Handle invalid JSON payload (malformed request body)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON format"
    });
  }

  // Handle Mongoose validation errors (schema validation failure)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }

  // Handle MongoDB duplicate key error (e.g., unique fields like email)
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate field value"
    });
  }

  // Handle file size limit error from multer
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File size exceeds 5MB limit"
    });
  }

  // Handle custom file type validation errors
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      message: err.message
    });
  }

  // Fallback: unhandled server error
  res.status(500).json({
    message: "Network Error"
  });
};

module.exports = errorHandler;