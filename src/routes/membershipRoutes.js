// src/routes/membershipRoutes.js
const express = require("express");
const router = express.Router();
const { createOrderForPlan, verifyPlanPayment, getMembershipStatus } = require("../controllers/membershipController");
const { isUser } = require("../middleware/userAuthMiddleware");

// Create order for Silver / Gold
router.post("/create-order", isUser, createOrderForPlan);

// Verify payment and activate plan
router.post("/verify", isUser, verifyPlanPayment);

// Get status
router.get("/status", isUser, getMembershipStatus);

module.exports = router;
