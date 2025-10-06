const { BasicPreference } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

async function createBasicPreference(req, res) {
  const {
    preferredAge,
    preferredHeight,
    preferredWeight,
    preferredMaritalStatus,
    preferredMotherToungue,
    preferredEatingHabits,
    preferredDrinkingHabits,
    preferredSmokingHabits,
    preferredReligion,
    preferredCaste,
    preferredSubCaste,
    preferredRas,
    preferredGan,
    preferredMangal,
    preferredNaadi,
    preferredCharan,
    preferredNakshatra,
    preferredGotra,
    preferredEducation,
    preferredJobSector,
    preferredJobLocation,
    preferredAnnualSalary,
    expectations,
  } = req.body;

  const userId = req.user.userId;

  const t = await sequelize.transaction();

  try {
    // Check if user already has preferences
    const existingPreference = await BasicPreference.findOne({
      where: { userId },
      transaction: t
    });

    if (existingPreference) {
      await t.rollback();
      return res.status(400).json({
        message: "Basic preferences already exist for this user. Use update instead.",
      });
    }

    const newBasicPreference = await BasicPreference.create(
      {
        userId,
        preferredAge,
        preferredHeight,
        preferredWeight,
        preferredMaritalStatus,
        preferredMotherToungue,
        preferredEatingHabits,
        preferredDrinkingHabits,
        preferredSmokingHabits,
        preferredReligion,
        preferredCaste,
        preferredSubCaste,
        preferredRas,
        preferredGan,
        preferredMangal,
        preferredNaadi,
        preferredCharan,
        preferredNakshatra,
        preferredGotra,
        preferredEducation,
        preferredJobSector,
        preferredJobLocation,
        preferredAnnualSalary,
        expectations,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "Besic Preference Created Successfully.",
      basicPreference: {
        id: newBasicPreference.id,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({
      message: "Failed",
      error: error.message,
    });
  }
}

async function updateBasicPreference(req, res) {
  const userId = req.user.userId;
  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      message: "Update failed.",
      error: "No fields provided for update.",
    });
  }

  const t = await sequelize.transaction();

  try {
    const preference = await BasicPreference.findOne({
      where: { userId },
      transaction: t
    });

    if (!preference) {
      await t.rollback();
      return res.status(404).json({
        message: "Update failed.",
        error: `Basic Preference record not found for this user.`,
      });
    }

    await preference.update(updateFields, { transaction: t });
    await t.commit();

    res.status(200).json({
      message: "Basic Preference Updated Successfully.",
      basicPreference: {
        id: preference.id,
        userId: preference.userId,
      },
    });
  } catch (error) {
    await t.rollback();

    const errorMessage =
      error.name === "SequelizeValidationError"
        ? error.errors.map((err) => err.message).join(", ")
        : error.message;

    res.status(400).json({
      message: "Update failed.",
      error: errorMessage,
    });
  }
}

async function getBasicPreference(req, res) {
  try {
    const userId = req.user.userId;

    const preference = await BasicPreference.findOne({
      where: { userId },
    });

    if (!preference) {
      return res.status(404).json({
        message: "Basic preferences not found for this user.",
      });
    }

    res.status(200).json({
      message: "Basic preferences retrieved successfully.",
      basicPreference: preference,
    });
  } catch (error) {
    console.error("Error fetching basic preferences:", error);
    res.status(500).json({
      message: "Failed to fetch basic preferences.",
      error: error.message,
    });
  }
}

module.exports = {
  createBasicPreference,
  updateBasicPreference,
  getBasicPreference,
};
