const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// ================= JWT AUTHENTICATION MIDDLEWARE =================

module.exports = (req, res, next) => {

  // Extract Authorization header from request
  const authHeader = req.headers.authorization;

  // Ensure token is provided
  if (!authHeader) {
    logger.warn("Authorization header missing");

    return res.status(401).json({
      message: "Token required"
    });
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(" ");

  // Validate header structure
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    logger.warn("Invalid authorization header format");

    return res.status(401).json({
      message: "Invalid token format"
    });
  }

  // Extract token from header
  const token = parts[1];

  try {

    // Ensure JWT secret is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request for downstream use
    req.user = decoded;

    // Proceed to next middleware/controller
    next();

  } catch (error) {

    // Handle invalid or expired token
    logger.warn(`JWT verification failed: ${error.message}`);

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }

};