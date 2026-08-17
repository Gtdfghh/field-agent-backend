const winston = require("winston");

// ================= LOGGER CONFIGURATION =================

const logger = winston.createLogger({
  level: "info", // Minimum log level

  // Define log format: timestamp + level + message
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),

  // Define log outputs (transports)
  transports: [

    // Save logs to file
    new winston.transports.File({ filename: "logs/app.log" }),

    // Print logs to console (useful during development)
    new winston.transports.Console()
  ]
});

module.exports = logger;