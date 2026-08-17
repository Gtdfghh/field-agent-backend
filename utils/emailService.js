const nodemailer = require("nodemailer");

// ================= EMAIL SERVICE =================

// Configure email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Sender email (from env)
    pass: process.env.EMAIL_PASS  // App password (secure, not hardcoded)
  }
});

// Utility function to send emails
const sendEmail = async (to, subject, text) => {

  // Send email with basic text content
  await transporter.sendMail({
    from: process.env.EMAIL_USER, // Sender address
    to,                           // Recipient email
    subject,                      // Email subject
    text                          // Email body (plain text)
  });
};

module.exports = sendEmail;