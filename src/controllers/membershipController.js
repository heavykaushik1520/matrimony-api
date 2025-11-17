// src/controllers/membershipController.js
const { User } = require("../models");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");


async function createOrderForPlan(req, res) {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { plan } = req.body;
    if (!plan || !["silver", "gold"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan. Use 'silver' or 'gold'." });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const plans = {
      silver: { name: "Silver", amountPaise: 999 * 100, months: 1 },
      gold: { name: "Gold", amountPaise: 1999 * 100, months: 3 },
    };
    const chosen = plans[plan];

    // Create short receipt for Razorpay (<=40 chars)
    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, "");
    const receipt = `plan_${plan}_${cleanUserId}_${Date.now()}`.slice(0, 40);

    const options = {
      amount: chosen.amountPaise,
      currency: "INR",
      receipt,
      notes: {
        type: "subscription_plan",
        plan: chosen.name,
        months: String(chosen.months),
        user_id: String(userId),
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      message: `${chosen.name} order created.`,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      plan: chosen.name,
      months: chosen.months,
    });
  } catch (error) {
    console.error("Error creating plan order:", error);
    const errMsg = error && error.error && (error.error.description || error.error.reason) || error.message;
    return res.status(500).json({
      message: "Failed to create plan order.",
      error: errMsg,
    });
  }
}


async function verifyPlanPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields." });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature." });
    }

    // Try fetch order to get notes (plan/months) — fallback to 1 month if not available
    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (e) {
      console.warn("Could not fetch order from Razorpay:", e && e.message);
    }

    let months = 1;
    let planName = "Silver";
    if (order && order.notes) {
      months = parseInt(order.notes.months || "1", 10) || 1;
      planName = order.notes.plan || planName;
    }

    // Update user membership expiry (extend if still active)
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const now = new Date();
    const currentExpiry = user.membership_expiry_date ? new Date(user.membership_expiry_date) : null;
    const startDate = currentExpiry && currentExpiry > now ? currentExpiry : now;

    const expiry = new Date(startDate);
    expiry.setMonth(expiry.getMonth() + months);

    user.membership_status = "active";
    user.membership_expiry_date = expiry;
    user.membership_plan_name = planName;
    // Save razorpay payment id for traceability (you used razorpay_subscription_id earlier; keep compatibility)
    user.razorpay_subscription_id = razorpay_payment_id;

    await user.save();

    return res.status(200).json({
      message: "Subscription activated successfully.",
      membership: {
        status: user.membership_status,
        expiry_date: user.membership_expiry_date,
        plan_name: user.membership_plan_name,
      },
    });
  } catch (error) {
    console.error("Error verifying plan payment:", error);
    const errMsg = error && error.error && (error.error.description || error.error.reason) || error.message;
    return res.status(500).json({
      message: "Failed to verify payment.",
      error: errMsg,
    });
  }
}

async function getMembershipStatus(req, res) {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findByPk(userId, {
      attributes: ["id", "membership_status", "membership_expiry_date", "membership_plan_name", "razorpay_subscription_id"],
    });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMembershipActive = checkMembershipActive(user);
    res.status(200).json({
      membership_status: user.membership_status,
      membership_expiry_date: user.membership_expiry_date,
      membership_plan_name: user.membership_plan_name,
      is_membership_active: isMembershipActive,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch membership status.", error: err.message });
  }
}


function checkMembershipActive(user) {
  if (!user || !user.membership_expiry_date) return false;
  const now = new Date();
  const expiryDate = new Date(user.membership_expiry_date);
  return expiryDate > now && user.membership_status === "active";
}

module.exports = {
  createOrderForPlan,
  verifyPlanPayment,
  getMembershipStatus,
  checkMembershipActive,
};
