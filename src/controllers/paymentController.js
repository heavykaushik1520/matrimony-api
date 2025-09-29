const Razorpay = require("razorpay");
require("dotenv").config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const toPaise = (rupees) => rupees * 100;

async function createYearlyMembershipPlan() {
  const planData = {
    period: "yearly",
    interval: 1,
    item: {
      name: "Premium Matrimony Membership (1 Year)",
      amount: toPaise(499), // 49900 paise
      currency: "INR",
      description: "Full profile access and chat for 1 year.",
    },
    notes: {
      membership_type: "yearly_premium",
    },
  };

  try {
    const plan = await razorpayInstance.plans.create(planData);
    console.log("1-Year Plan Created:", plan.id);
    return plan.id;
  } catch (error) {
    console.error("Error creating 1-Year Plan:", error);
  }
}

async function create48HourViewingPlan() {
  const planData = {
    period: "daily",
    interval: 2,
    item: {
      name: "Profile viewing access for 48 hrs",
      amount: toPaise(99),
      currency: "INR",
      description: "View unlimited profiles for 48 hrs",
    },
    notes: {
      access_type: "48_hour_viewing",
    },
  };

  try {
    const plan = await razorpayInstance.plans.create(planData);
    console.log("48-Hour Plan Created:", plan.id);
    return plan.id;
  } catch (error) {
    console.error("Error creating 48-Hour Plan:", error);
  }
}

async function createSubscriptionForUser(planId, userId) {
  const subscriptionData = {
    plan_id: planId,
    total_count: 1,
    customer_notify: 1,
    notes: {
      user_id: userId,
      type: planId === process.env.YEARLY_PLAN_ID ? 'yearly_membership' : '48hr_viewing',
    },
  };

  try {
    const subscription = await razorpayInstance.subscriptions.create(subscriptionData);
    console.log(`Subscription Created for User ${userId}: ${subscription.id}`);
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);

    let errorMessage = 'An unknown error occurred while creating the subscription.';
    let errorCode = 'UNKNOWN_ERROR';
    let httpStatus = 500;

    if (error.error && error.error.code) {
      errorCode = error.error.code;
      errorMessage = error.error.description;
      httpStatus = error.statusCode || 400; 
    } else if (error.message) {
      errorMessage = error.message;
      httpStatus = 503;
    }

    return {
      success: false,
      status: httpStatus,
      code: errorCode,
      message: errorMessage,
    };
  }
}