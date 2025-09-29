//routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { createRazorpayOrder , verifyPayment } = require("../controllers/paymentController");
const { isUser } = require('../middleware/userAuthMiddleware');


module.exports = router;
