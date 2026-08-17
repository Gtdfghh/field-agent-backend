const express = require("express");
const router = express.Router();

const { loginUser, setPassword, forgotPassword,resetPassword } = require("../controllers/authController");

// ================= AUTH ROUTES =================

// ✅ Login
router.post("/login", loginUser);

// ✅ NEW → Set Password (IMPORTANT)
router.post("/set-password", setPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;