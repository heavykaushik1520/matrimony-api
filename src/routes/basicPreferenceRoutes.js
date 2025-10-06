// src/routes/basicPreferenceRoutes.js

const express = require("express");
const router = express.Router();
const {
  createBasicPreference,
  updateBasicPreference,
  getBasicPreference,
} = require("../controllers/basicPreferenceController");
const { isUser } = require("../middleware/userAuthMiddleware");

// All routes require user authentication
router.post("/", isUser, createBasicPreference);
router.get("/", getBasicPreference);
router.put("/", isUser, updateBasicPreference);

module.exports = router;
