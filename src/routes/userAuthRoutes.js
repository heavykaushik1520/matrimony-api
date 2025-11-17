// src/routes/userAuthRoutes.js

const express = require("express");
const router = express.Router();
const {
  userSignup,
  signinUser,
  signoutUser,
  getCurrentUser,
  getOppositeGenderUsers,
  refreshToken,
  forgotPassword,
  resetPassword,
  filterOppositeGenderUsers,
  getUserByPersonalId,
  getUserById,
  updateUser,
  filterOppositeGenderUsersCard
} = require("../controllers/userAuthController");

const { isUser } = require("../middleware/userAuthMiddleware");
const uploadMiddleware = require("../middleware/upload.js");
const documentUpload = require("../middleware/documentUpload");

// <-- import membership middleware
const { requireActiveMembership } = require("../middleware/membershipMiddleware");

/**
 * Public (no membership required)
 */
router.post("/signup", uploadMiddleware, userSignup);
router.post("/signin", signinUser);
router.post("/signout", signoutUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/**
 * Authenticated routes (some require active paid membership)
 */
router.get("/me", isUser, getCurrentUser);

// Viewing profiles / lists — require authenticated + active membership
router.get("/users-opposite-gender", isUser, requireActiveMembership, getOppositeGenderUsers);
router.get("/users-opposite-gender/filter", isUser, requireActiveMembership, filterOppositeGenderUsers);
router.get("/users-opposite-gender-card/filter", isUser, requireActiveMembership, filterOppositeGenderUsersCard);

router.get("/user/:personalId", isUser, requireActiveMembership, getUserByPersonalId);
router.get("/user/id/:id", isUser, requireActiveMembership, getUserById);


router.put("/update", isUser, uploadMiddleware, updateUser);
router.post("/refresh-token", isUser, refreshToken);

module.exports = router;
