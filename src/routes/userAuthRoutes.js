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
const { requireActiveSubscription } = require("../middleware/membershipMiddleware");
const uploadMiddleware = require("../middleware/upload.js"); 
const documentUpload = require("../middleware/documentUpload")

router.post("/signup", uploadMiddleware, userSignup);
//router.post('/signup', upload, userController.userSignup);
router.post("/signin", signinUser);
router.post("/signout", signoutUser);

router.get("/me", isUser, getCurrentUser);
router.get("/user/:personalId", isUser, getUserByPersonalId);
router.get("/user/id/:id", isUser , getUserById);

router.get("/users-opposite-gender", isUser, getOppositeGenderUsers);
router.get("/users-opposite-gender/filter", isUser, requireActiveSubscription, filterOppositeGenderUsers);
router.get("/users-opposite-gender-card/filter", isUser, filterOppositeGenderUsersCard);


router.put("/update", isUser, uploadMiddleware, updateUser);
router.post("/refresh-token", isUser, refreshToken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
