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
  updateUser
} = require("../controllers/userAuthController");
const { isUser } = require("../middleware/userAuthMiddleware");
const uploadMiddleware = require("../middleware/upload.js"); 
const documentUpload = require("../middleware/documentUpload")

router.post("/signup", uploadMiddleware, userSignup);
//router.post('/signup', upload, userController.userSignup);
router.post("/signin", signinUser);
router.post("/signout", signoutUser);

router.get("/me", isUser, getCurrentUser);
router.get("/user/:personalId",isUser , getUserByPersonalId)
router.get("/users-opposite-gender", isUser , getOppositeGenderUsers);
router.get("/users-opposite-gender/filter", isUser, filterOppositeGenderUsers);

router.put("/update", isUser, uploadMiddleware, updateUser);
router.post("/refresh-token", isUser, refreshToken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
