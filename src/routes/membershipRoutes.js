// src/routes/membershipRoutes.js

const express = require("express");
const router = express.Router();
const {
  createMembershipOrder,
  createSubscriptionOrder,
  verifyMembershipPayment,
  verifySubscriptionPayment,
  getMembershipStatus,
} = require("../controllers/membershipController");
const { isUser } = require("../middleware/userAuthMiddleware");

/**
 * Membership Routes
 */
router.post("/order/membership", isUser, createMembershipOrder);
router.post("/verify/membership", isUser, verifyMembershipPayment);

/**
 * Subscription Routes
 */
router.post("/order/subscription", isUser, createSubscriptionOrder);
router.post("/verify/subscription", isUser, verifySubscriptionPayment);

/**
 * Get Membership Status
 */
router.get("/status", isUser, getMembershipStatus);

module.exports = router;

