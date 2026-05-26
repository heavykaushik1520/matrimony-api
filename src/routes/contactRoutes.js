const express = require("express");
const router = express.Router();
const { submitContactForm  } = require("../controllers/contactController");

const { isAdmin } = require("../middleware/authMiddleware");

router.post("/send-message", submitContactForm );

module.exports = router;
