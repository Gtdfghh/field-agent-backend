const { body, validationResult } = require("express-validator");

// ================= AGENT REGISTRATION VALIDATION =================

const validateAgent = [

  // Validate email: required + proper format
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  // Validate display name: required field
  body("displayName")
    .notEmpty().withMessage("Display name is required"),
    body("phoneNumber")
  .matches(/^[0-9]{10}$/)
  .withMessage("Phone number must be 10 digits"),

body("dateOfBirth")
  .notEmpty()
  .withMessage("Date of birth is required"),

  // Validate primary ZIP: required + must be 6-digit numeric code
  body("primaryZip")
    .notEmpty().withMessage("Primary ZIP is required")
    .matches(/^[0-9]{6}$/)
    .withMessage("Primary ZIP must be a valid 6 digit code"),

  // Validate coverage radius: required + numeric + greater than 0
  body("coverageRadiusKm")
    .notEmpty().withMessage("Coverage radius is required")
    .isNumeric().withMessage("Coverage radius must be a number")
    .custom(value => {
      if (value <= 0) {
        throw new Error("Coverage radius must be greater than 0");
      }
      return true;
    }),

  // Handle validation result and return first error (if any)
  (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg
      });
    }

    // Proceed if validation passes
    next();
  }

];

module.exports = validateAgent;

