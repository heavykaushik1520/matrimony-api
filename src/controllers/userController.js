// src/controllers/userController.js
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Sequelize instance & models
const { sequelize } = require("../config/db"); // ensure your db.js exports sequelize
const { User, AstrologyInfo, FamilyInfo, UserCareerInfo } = require("../models");

//this one is for admin
async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
      include: [
        { model: AstrologyInfo },
        { model: FamilyInfo },
        { model: UserCareerInfo }
      ]
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }
    
    return res.status(200).json(users);

  } catch (error) {
    console.error("Error fetching all users for admin:", error);
    res.status(500).json({ message: "Failed to fetch users.", error: error.message });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Admin-only: Permanently delete a user by ID
 * (or soft delete if 'is_active' column exists)
 */
async function deleteUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (Object.prototype.hasOwnProperty.call(user.dataValues, "is_active")) {
      user.is_active = false;
      await user.save();
      return res.status(200).json({ message: "User deactivated successfully (soft delete)." });
    }

    await User.destroy({ where: { id } });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    return res.status(500).json({
      message: "Failed to delete user.",
      error: error.message,
    });
  }
}


async function getTotalUsersCount(req, res) {
  try {
    const { isActive, startDate, endDate } = req.query;
    const where = {};

    if (typeof isActive !== "undefined") {
      where.is_active = isActive === "true" || isActive === true;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const total = await User.count({ where });

    return res.status(200).json({ total });
  } catch (error) {
    console.error("Error in getTotalUsersCount:", error);
    return res.status(500).json({ message: "Failed to fetch total user count.", error: error.message });
  }
}

async function getUsersByGender(req, res) {
  try {
    const {
      gender,
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      order = "DESC",
      countOnly,
      startDate,
      endDate,
      isActive,
    } = req.query;

    // validate gender
    if (!gender || (gender !== "Male" && gender !== "Female")) {
      return res.status(400).json({ message: "Missing or invalid gender. Allowed values: 'Male' or 'Female'." });
    }

    const where = { gender };

    if (typeof isActive !== "undefined") {
      where.is_active = isActive === "true" || isActive === true;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [
        { firstname: like },
        { lastname: like },
        { email: like },
        { personalId: like }, // keep if present in your model
      ];
    }

    // if only count is required for this gender
    if (countOnly === "true" || countOnly === true) {
      const count = await User.count({ where });
      return res.status(200).json({ count });
    }

    const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);

    const { rows: users, count: totalCount } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password", "reset_token", "reset_token_expires"] },
      include: [
        { model: AstrologyInfo, required: false },
        { model: FamilyInfo, required: false },
        { model: UserCareerInfo, required: false },
      ],
      order: [[sortBy, order.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      limit: parseInt(limit, 10),
      offset,
      distinct: true,
    });

    return res.status(200).json({
      totalCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      users,
    });
  } catch (error) {
    console.error("Error in getUsersByGender:", error);
    return res.status(500).json({ message: "Failed to fetch users by gender.", error: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // fetch user by ID
    const user = await User.findOne({
      where: { id },
      attributes: {
        exclude: ["password", "reset_token", "reset_token_expires", "updatedAt"], // exclude sensitive fields
      },
      include: [
        { model: AstrologyInfo, required: false },
        { model: FamilyInfo, required: false },
        { model: UserCareerInfo, required: false },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({
      message: "Failed to fetch user by ID.",
      error: error.message,
    });
  }
}


async function getActiveMembers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      order = "DESC",
      countOnly,
    } = req.query;

    const now = new Date();

    const where = {
      membership_status: "active",
      membership_expiry_date: { [Op.gt]: now },
    };

    // Optional search across common columns
    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [
        { firstname: like },
        { lastname: like },
        { email: like },
        { personalId: like }, // if you have personalId
      ];
    }

    // If only count is requested
    if (countOnly === "true" || countOnly === true) {
      const count = await User.count({ where });
      return res.status(200).json({ count });
    }

    const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);

    const { rows: users, count: totalCount } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password", "reset_token", "reset_token_expires"] },
      include: [
        { model: AstrologyInfo, required: false },
        { model: FamilyInfo, required: false },
        { model: UserCareerInfo, required: false },
      ],
      order: [[sortBy, order.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      limit: parseInt(limit, 10),
      offset,
      distinct: true,
    });

    return res.status(200).json({
      totalCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      users,
    });
  } catch (error) {
    console.error("Error in getActiveMembers:", error);
    return res.status(500).json({ message: "Failed to fetch active members.", error: error.message });
  }
}

async function assignMembershipManualMinimal(req, res) {
  const adminId = req.user && req.user.userId;
  if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

  const userId = req.params.id;
  const { amount, plan, reference, note, months: manualMonths } = req.body;

  try {
    if (!amount && !plan) {
      return res.status(400).json({ message: "Provide either 'amount' (rupees) or 'plan'." });
    }

    const planMap = {
      silver: { name: 'Silver', amountRupees: 999, months: 1 },
      gold:   { name: 'Gold',   amountRupees: 1999, months: 3 },
    };

    let chosenPlan;
    if (plan) {
      const p = String(plan).toLowerCase();
      if (!planMap[p]) return res.status(400).json({ message: "Invalid plan. Allowed: silver, gold" });
      chosenPlan = planMap[p];
    } else {
      const provided = Number(amount);
      const found = Object.values(planMap).find(p => p.amountRupees === provided);
      if (!found) {
        return res.status(400).json({ message: "Amount must match plan (999 or 1999) or provide 'plan' explicitly." });
      }
      chosenPlan = found;
    }

    const months = manualMonths ? parseInt(manualMonths, 10) : chosenPlan.months;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Do update in a transaction to be safe
    const result = await sequelize.transaction(async (t) => {
      const now = new Date();
      const currentExpiry = user.membership_expiry_date ? new Date(user.membership_expiry_date) : null;
      const startDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;

      const newExpiry = new Date(startDate);
      newExpiry.setMonth(newExpiry.getMonth() + months);

      user.membership_status = 'active';
      user.membership_expiry_date = newExpiry;
      user.membership_plan_name = chosenPlan.name;
      // mark this as manual assignment so you know it wasn't Razorpay
      user.razorpay_subscription_id = `manual-${uuidv4()}`;

      await user.save({ transaction: t });

      return { user };
    });

    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

      const auditEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        adminId,
        userId,
        plan: chosenPlan.name,
        months,
        amount_rupees: amount ? Number(amount) : chosenPlan.amountRupees,
        reference: reference || null,
        note: note || null,
        manual_tag: result.user.razorpay_subscription_id,
      };

      const logLine = JSON.stringify(auditEntry) + '\n';
      const logPath = path.join(logsDir, 'manual_membership.log');
      fs.appendFile(logPath, logLine, (err) => {
        if (err) console.error('Failed to write membership audit log:', err);
      });
    } catch (logErr) {
      console.error('Audit logging failed:', logErr);
    }

    // Optionally notify user (email/SMS) here — call your existing notifier if any

    return res.status(200).json({
      message: 'Membership assigned (manual).',
      membership: {
        status: result.user.membership_status,
        expiry_date: result.user.membership_expiry_date,
        plan_name: result.user.membership_plan_name,
      },
    });
  } catch (error) {
    console.error('Error in assignMembershipManualMinimal:', error);
    return res.status(500).json({ message: 'Failed to assign membership.', error: error.message });
  }
}


module.exports = {
  getAllUsers,
  getTotalUsersCount,
  getUsersByGender,
  getUserById,
  deleteUserById,
  getActiveMembers,
  assignMembershipManualMinimal
};
