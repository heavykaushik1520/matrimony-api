// src/middleware/membershipMiddleware.js
const { User } = require("../models");


async function requireActiveMembership(req, res, next) {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findByPk(userId, {
      attributes: ["id", "membership_status", "membership_expiry_date", "membership_plan_name"],
    });

    if (!user) return res.status(404).json({ message: "User not found." });

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


async function requireActiveSubscription(req, res, next) {
  // reuse membership check
  return requireActiveMembership(req, res, next);
}


function checkMembershipActive(user) {
  if (!user || !user.membership_expiry_date) return false;
  const now = new Date();
  const expiryDate = new Date(user.membership_expiry_date);
  return expiryDate > now && user.membership_status === "active";
}

module.exports = {
  requireActiveMembership,
  requireActiveSubscription,
  checkMembershipActive,
};
