const { User } = require("../models");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

/**
 * Create Razorpay Order for Membership (Rs. 499 for 1 year)
 */
async function createMembershipOrder(req, res) {
  try {
    const userId = req.user.userId;

    // Check if user already has active membership
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.membership_status === "active") {
      return res.status(400).json({
        message: "You already have an active membership.",
      });
    }

    // Create Razorpay order
    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, "");
    const baseReceipt = `mem_${cleanUserId}_${Date.now()}`;
    const receipt = baseReceipt.slice(0, 40); // Razorpay requires receipt length <= 40
    const options = {
      amount: 49900, // Rs. 499 in paise
      currency: "INR",
      receipt,
      notes: {
        type: "membership",
        user_id: String(userId),
        duration: "1_year",
      },
    };

    const order = await razorpay.orders.create(options);

    // Store the order in database temporarily or return it
    res.status(200).json({
      message: "Membership order created successfully.",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error creating membership order:", error);
    
    // Enhanced error logging for Razorpay errors
    if (error.error) {
      console.error("Razorpay Error Details:", {
        statusCode: error.statusCode,
        error: error.error,
        description: error.error.description,
        code: error.error.code,
      });
    }
    
    // Check if it's an authentication error
    if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR')) {
      console.error("Razorpay Authentication Failed!");
      console.error("Please verify that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correctly set in your environment variables.");
      console.error("Current RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : "NOT SET");
      console.error("Current RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET (hidden)" : "NOT SET");
      
      return res.status(500).json({
        message: "Failed to create membership order.",
        error: "Razorpay authentication failed. Please check server configuration.",
        details: error.error ? {
          description: error.error.description,
          code: error.error.code,
        } : error.message,
      });
    }
    
    res.status(500).json({
      message: "Failed to create membership order.",
      error: error.error ? error.error.description : error.message,
      details: error.error ? error.error : undefined,
    });
  }
}

/**
 * Create Razorpay Order for Subscription (Rs. 99 for 2 days)
 */
async function createSubscriptionOrder(req, res) {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if user has active membership
    if (user.membership_status !== "active") {
      return res.status(403).json({
        message: "You need to purchase membership first.",
      });
    }

    // Check if subscription is already active
    if (user.membership_status === "active" && user.razorpay_subscription_id) {
      return res.status(400).json({
        message: "You already have an active subscription.",
      });
    }

    // Create Razorpay order
    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, "");
    const baseReceipt = `sub_${cleanUserId}_${Date.now()}`;
    const receipt = baseReceipt.slice(0, 40); // Razorpay requires receipt length <= 40
    const options = {
      amount: 9900, // Rs. 99 in paise
      currency: "INR",
      receipt,
      notes: {
        type: "subscription",
        user_id: String(userId),
        duration: "2_days",
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      message: "Subscription order created successfully.",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error creating subscription order:", error);
    
    // Enhanced error logging for Razorpay errors
    if (error.error) {
      console.error("Razorpay Error Details:", {
        statusCode: error.statusCode,
        error: error.error,
        description: error.error.description,
        code: error.error.code,
      });
    }
    
    // Check if it's an authentication error
    if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR')) {
      console.error("Razorpay Authentication Failed!");
      console.error("Please verify that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correctly set in your environment variables.");
      console.error("Current RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : "NOT SET");
      console.error("Current RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET (hidden)" : "NOT SET");
      
      return res.status(500).json({
        message: "Failed to create subscription order.",
        error: "Razorpay authentication failed. Please check server configuration.",
        details: error.error ? {
          description: error.error.description,
          code: error.error.code,
        } : error.message,
      });
    }
    
    res.status(500).json({
      message: "Failed to create subscription order.",
      error: error.error ? error.error.description : error.message,
      details: error.error ? error.error : undefined,
    });
  }
}

/**
 * Verify Payment for Membership
 */
async function verifyMembershipPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const userId = req.user.userId;

  try {
    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature." });
    }

    // Get user and update membership
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user's membership status
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now

    user.membership_status = "active";
    user.membership_expiry_date = expiryDate;
    user.membership_plan_name = "Annual Membership";
    user.razorpay_customer_id = razorpay_payment_id;

    await user.save();

    res.status(200).json({
      message: "Membership activated successfully.",
      membership: {
        status: user.membership_status,
        expiry_date: user.membership_expiry_date,
        plan_name: user.membership_plan_name,
      },
    });
  } catch (error) {
    console.error("Error verifying membership payment:", error);
    res.status(500).json({
      message: "Failed to verify membership payment.",
      error: error.message,
    });
  }
}

/**
 * Verify Payment for Subscription
 */
async function verifySubscriptionPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const userId = req.user.userId;

  try {
    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature." });
    }

    // Get user and update subscription
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check membership is active
    if (user.membership_status !== "active") {
      return res.status(403).json({
        message: "You need an active membership to subscribe.",
      });
    }

    // Update user's subscription
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 2); // 2 days from now

    user.razorpay_subscription_id = razorpay_payment_id;

    await user.save();

    res.status(200).json({
      message: "Subscription activated successfully.",
      subscription: {
        status: "active",
        expires_in: "2 days",
        payment_id: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Error verifying subscription payment:", error);
    res.status(500).json({
      message: "Failed to verify subscription payment.",
      error: error.message,
    });
  }
}

/**
 * Get User's Membership Status
 */
async function getMembershipStatus(req, res) {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "membership_status",
        "membership_expiry_date",
        "membership_plan_name",
        "razorpay_subscription_id",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMembershipActive = checkMembershipActive(user);
    const hasActiveSubscription = !!user.razorpay_subscription_id;

    res.status(200).json({
      membership_status: user.membership_status,
      membership_expiry_date: user.membership_expiry_date,
      membership_plan_name: user.membership_plan_name,
      is_membership_active: isMembershipActive,
      has_active_subscription: hasActiveSubscription,
      can_view_profiles: isMembershipActive && hasActiveSubscription,
    });
  } catch (error) {
    console.error("Error fetching membership status:", error);
    res.status(500).json({
      message: "Failed to fetch membership status.",
      error: error.message,
    });
  }
}

/**
 * Helper function to check if membership is active
 */
function checkMembershipActive(user) {
  if (!user.membership_expiry_date) return false;

  const now = new Date();
  const expiryDate = new Date(user.membership_expiry_date);

  return expiryDate > now && user.membership_status === "active";
}

module.exports = {
  createMembershipOrder,
  createSubscriptionOrder,
  verifyMembershipPayment,
  verifySubscriptionPayment,
  getMembershipStatus,
  checkMembershipActive,
};

