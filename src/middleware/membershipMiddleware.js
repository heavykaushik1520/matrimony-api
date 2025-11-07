const { User } = require("../models");

/**
 * Middleware to check if user has active membership
 */
async function requireActiveMembership(req, res, next) {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "membership_status",
        "membership_expiry_date",
        "razorpay_subscription_id",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if membership is active
    const isMembershipActive = checkMembershipActive(user);

    if (!isMembershipActive) {
      return res.status(403).json({
        message: "You need to purchase an active membership to access this feature.",
        membership_status: user.membership_status,
        membership_expiry_date: user.membership_expiry_date,
      });
    }

    next();
  } catch (error) {
    console.error("Error checking membership:", error);
    res.status(500).json({
      message: "Failed to verify membership status.",
      error: error.message,
    });
  }
}

/**
 * Middleware to check if user has active subscription (to view profiles)
 */
async function requireActiveSubscription(req, res, next) {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "membership_status",
        "membership_expiry_date",
        "razorpay_subscription_id",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if membership is active
    const isMembershipActive = checkMembershipActive(user);

    if (!isMembershipActive) {
      return res.status(403).json({
        message: "You need to purchase an active membership first.",
      });
    }

    // Check if subscription is active
    if (!user.razorpay_subscription_id) {
      return res.status(403).json({
        message: "You need to purchase an active subscription to view profiles.",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({
      message: "Failed to verify subscription status.",
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
  requireActiveMembership,
  requireActiveSubscription,
  checkMembershipActive,
};

