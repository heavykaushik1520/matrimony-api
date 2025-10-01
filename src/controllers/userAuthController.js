// src/controllers/userAuthController.js

const {
  User,
  AstrologyInfo,
  FamilyInfo,
  UserCareerInfo,
} = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");



async function generateUniquePersonalId() {
  const prefix = "HRDSPSH-";
  let uniqueId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    uniqueId = prefix + randomNumber;

    const existingUser = await User.findOne({
      where: { personalId: uniqueId },
    });
    if (!existingUser) {
      exists = false;
    }
  }
  return uniqueId;
}

// POST - sign up
async function userSignup(req, res) {
  const {
    password,
    firstname,
    lastname,
    gender,
    religion,
    caste,
    subCaste,
    community,
    dateOfBirth,
    timeOfBirth,
    phone,
    email,
    knownLanguages,
    diet,
    birthLocation,
    maritalStatus,
    height,
    weight,
    bloodGroup,
    physicalDisability,
    skinTone,
    hobbies,
    termsAccepted,
    astrologyInfo,
    familyInfo,
    userCareerInfo,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const profilePhotoFiles = req.files?.profilePhotos || [];
    const idProofFile = req.files?.idProof ? req.files.idProof[0] : null;

    const profilePhotoUrls = profilePhotoFiles.map(
      (file) => `http://localhost:3000/uploads/images/${file.filename}`
    );

    const idProofPath = idProofFile
      ? `http://localhost:3000/uploads/documents/${idProofFile.filename}`
      : null;

    if (!idProofPath) {
      return res.status(400).json({ error: "ID Proof is required" });
    }

    const hobbyArray = hobbies ? hobbies.split(",").map((h) => h.trim()) : [];

    const personalId = await generateUniquePersonalId();

    const newUser = await User.create(
      {
        personalId,
        password,
        firstname,
        lastname,
        gender,
        religion,
        caste,
        subCaste,
        community,
        dateOfBirth,
        timeOfBirth,
        phone,
        email,
        knownLanguages,
        diet,
        birthLocation,
        maritalStatus,
        height,
        weight,
        bloodGroup,
        physicalDisability,
        skinTone,
        profilePhotos: profilePhotoUrls,
        hobbies: hobbyArray,
        idProof: idProofPath,
        termsAccepted,
      },
      { transaction: t }
    );

    const astrologyData = JSON.parse(astrologyInfo || "{}");
    const familyData = JSON.parse(familyInfo || "{}");
    const careerData = JSON.parse(userCareerInfo || "{}");

    await AstrologyInfo.create(
      { userId: newUser.id, ...astrologyData },
      { transaction: t }
    );
    await FamilyInfo.create(
      { userId: newUser.id, ...familyData },
      { transaction: t }
    );
    await UserCareerInfo.create(
      { userId: newUser.id, ...careerData },
      { transaction: t }
    );

    await t.commit();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User signed up successfully. Welcome to HridaySparshi!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstname: newUser.firstname,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Signup failed:", error);
    res.status(400).json({
      message: "Signup failed.",
      error: error.message,
    });
  }
}

// POST - Sign In
async function signinUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Sign in successful!", token });
  } catch (error) {
    console.error("Error signing in user:", error);
    res
      .status(500)
      .json({ message: "Failed to sign in.", error: error.message });
  }
}

// POST - Sign Out
async function signoutUser(req, res) {
  res.status(200).json({ message: "Sign out successful!" });
}

// GET - Me (Self Account)
async function getCurrentUser(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not identified." });
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ["password", "reset_token", "reset_token_expires"],
      },

      include: [
        { model: AstrologyInfo, as: "AstrologyInfo" },
        { model: FamilyInfo, as: "FamilyInfo" },
        { model: UserCareerInfo, as: "UserCareerInfo" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user.", error: error.message });
  }
}

// POST /refresh-token
async function refreshToken(req, res) {
  try {
    const payload = {
      userId: req.user.userId,
      role: req.user.role,
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1hr",
    });

    return res.status(200).json({ token: newToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ message: "Failed to refresh token." });
  }
}

// forgot password - (need to check)
async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    user.reset_token = token;
    user.reset_token_expires = expires;
    await user.save();

    const resetLink = `http://localhost:5173/sotrue/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Sunkots Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
}

// reset password - (need to check)
async function resetPassword(req, res) {
  if (!req.body || !req.body.token || !req.body.newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }
  const { token, newPassword } = req.body;

  console.log("resetPassword req.body:", req.body);

  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.password = newPassword;
    user.reset_token = null;
    user.reset_token_expires = null;

    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
}

// get list pagination 1 - 10 data
async function getOppositeGenderUsers(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;

    const currentUserId = req.user.userId;
    const currentUser = await User.findByPk(currentUserId, {
      attributes: ["gender"],
    });

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found." });
    }

    const oppositeGender = currentUser.gender === "Male" ? "Female" : "Male";

    const { count, rows } = await User.findAndCountAll({
      where: {
        id: {
          [Op.ne]: currentUserId,
        },
        gender: oppositeGender,
      },
      attributes: {
        exclude: ["idProof","password", "reset_token", "reset_token_expires","termsAccepted","membership_status","membership_expiry_date","membership_plan_name","razorpay_customer_id","razorpay_subscription_id"],
      },
      include: [
        { model: AstrologyInfo },
        { model: FamilyInfo },
        { model: UserCareerInfo },
      ],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      totalItems: count,
      totalPages,
      currentPage: page,
      users: rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users.", error: error.message });
  }
}

//filter pagination 1 - 10 data
async function filterOppositeGenderUsers(req, res) {
    const currentUserId = req.user.userId; 

    const { 
        religion, caste, community, maritalStatus, skinTone,
        ras, gan, mangal,
        education, jobSector, jobLocation, annualSalary,
        limit = 10, page = 1 
    } = req.query;

    try {
        const currentUser = await User.findByPk(currentUserId, { attributes: ["gender"] });

        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found." });
        }

        const oppositeGender = currentUser.gender === "Male" ? "Female" : "Male";

        const userWhere = {};
        const astrologyWhere = {};
        const careerWhere = {};

        userWhere.id = { [Op.ne]: currentUserId };
        userWhere.gender = oppositeGender;

        if (religion) userWhere.religion = { [Op.like]: religion };
        if (caste) userWhere.caste = { [Op.like]: caste };
        if (community) userWhere.community = { [Op.like]: community };
        if (maritalStatus) userWhere.maritalStatus = { [Op.like]: maritalStatus };
        if (skinTone) userWhere.skinTone = { [Op.like]: skinTone };

        if (ras) astrologyWhere.ras = { [Op.like]: ras };
        if (gan) astrologyWhere.gan = { [Op.like]: gan };
        if (mangal) astrologyWhere.mangal = { [Op.like]: mangal };

        if (education) careerWhere.education = { [Op.like]: education };
        if (jobSector) careerWhere.jobSector = { [Op.like]: jobSector };
        if (jobLocation) careerWhere.jobLocation = { [Op.like]: jobLocation };
        if (annualSalary) careerWhere.annualSalary = { [Op.gte]: annualSalary }; 
        
        const offset = (page - 1) * limit;

        const results = await User.findAndCountAll({
            where: userWhere, 
            limit: parseInt(limit),
            offset: parseInt(offset),
            
            attributes: {
                exclude: ["idProof","password", "reset_token", "reset_token_expires","termsAccepted","membership_status","membership_expiry_date","membership_plan_name","razorpay_customer_id","razorpay_subscription_id"],
            },
            
            include: [
                {
                    model: AstrologyInfo,
                    required: Object.keys(astrologyWhere).length > 0,
                    where: astrologyWhere
                },
                {
                    model: UserCareerInfo,
                    required: Object.keys(careerWhere).length > 0,
                    where: careerWhere
                },
                { model: FamilyInfo } 
            ]
        });

        res.status(200).json({
            message: "Filtered opposite-gender results retrieved successfully.",
            totalItems: results.count,
            totalPages: Math.ceil(results.count / limit),
            currentPage: parseInt(page),
            users: results.rows
        });

    } catch (error) {
        console.error("Error fetching filtered users:", error);
        res.status(500).json({
            message: "Failed to fetch filtered users.",
            error: error.message,
        });
    }
}

//GET - on the basis of personalId
async function getUserByPersonalId(req , res) {
  try 
  {
    const { personalId} = req.params;
    if(!personalId){
      return res.status(400).json({
        success : "false",
        message:"Personal Id Required."});
    }

    const user = await user.findOne({
      where : {personalId},
      attributes: {
        exclude: [
          "idProof",
          "password",
          "reset_token",
          "reset_token_expires",
          "termsAccepted",
          "membership_status",
          "membership_expiry_date",
          "membership_plan_name",
          "razorpay_customer_id",
          "razorpay_subscription_id",
        ],
      },

      include: [
        { model: AstrologyInfo },
        { model: FamilyInfo },
        { model: UserCareerInfo },
      ],
      limit,
      offset,
    })

  } catch (error){

    console.error("Error fetching user:", err);

    if (err.name === "SequelizeValidationError" || err.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: err.message,
      });
    }

     res
      .status(500)
      .json({ message: "Failed to fetch user.", error: error.message });
  }
}

module.exports = {
  userSignup,
  signinUser,
  signoutUser,
  getCurrentUser,
  getOppositeGenderUsers,
  refreshToken,
  forgotPassword,
  resetPassword,
  filterOppositeGenderUsers,
  getUserByPersonalId
};
