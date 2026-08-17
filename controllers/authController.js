const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const crypto = require("crypto");
const Agent = require("../models/agent");


// ================= USER LOGIN =================


exports.loginUser = async (req, res, next) => {
  try {

    let { email, password } = req.body;

    // Validate required credentials
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Normalize email to ensure consistent lookup
    email = email.trim().toLowerCase();

    logger.info(`Login attempt for email: ${email}`);

     // Fetch user by email
    const user = await User.findOne({ email });
    // Prevent login if user does not exist
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
     


 

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // Reject if password is incorrect
    if (!isMatch) {
      logger.warn(`Login failed - incorrect password for: ${email}`);
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // Ensure JWT secret is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Generate authentication token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // ================= GET DISPLAY NAME =================
let displayName = "";

//  Only for AGENT
if (user.role === "AGENT") {
  const agent = await Agent.findOne({ userId: user._id });
  displayName = agent ? agent.displayName : "";
}

// ================= RESPONSE =================
res.status(200).json({
  token,
  user: {
    id: user._id,
    email: user.email,
    role: user.role,
    displayName
  }
});

  

  } catch (error) {

    logger.error(`Login error: ${error.message}`);
    next(error);

  }
};

//  SEND LINK WHEN ADMIN APPROVES
exports.generateSetPasswordLink = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  return token;
};

//  SET PASSWORD API
exports.setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    //  Find user using token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired link" 
      });
    }


    // =========================
    //  HASH NEW PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
  

    await user.save();

    res.json({ message: "Password set successfully" });

  } catch (err) {
    res.status(500).json({ 
      message: "Error setting password" 
    });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const link = `http://127.0.0.1:5500/pages/reset-password.html?token=${token}`;

    const sendEmail = require("../utils/emailService");

    await sendEmail(
      user.email,
      "Reset Password",
      `Click here:\n${link}\n\nExpires in 15 minutes`
    );

    res.json({ message: "Reset link sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 🔍 Step 1: Find user by token
    const user = await User.findOne({ resetToken: token });

    console.log("Token from frontend:", token);
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({
        message: "Invalid link"
      });
    }

    // ⏱️ Step 2: Check expiry
    console.log("Expiry:", user.resetTokenExpiry);
    console.log("Current time:", new Date());

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "Link expired"
      });
    }

    // 🔐 Step 3: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
  

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error resetting password"
    });
  }
};