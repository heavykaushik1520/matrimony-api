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
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const newBasicPreference = await BasicPreference.create(
      {
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
  const { id } = req.params;
  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      message: "Update failed.",
      error: "No fields provided for update.",
    });
  }

  const t = await sequelize.transaction();

  try {
    const preference = await BasicPreference.findByPk(id, { transaction: t });

    if (!preference) {
      await t.rollback();
      return res.status(404).json({
        message: "Update failed.",
        error: `Basic Preference record with ID ${id} not found.`,
      });
    }

    await preference.update(updateFields, { transaction: t });
    await t.commit();

    res.status(200).json({
      message: "Basic Preference Updated Successfully.",
      basicPreference: {
        id: preference.id,
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

module.exports = {
  createBasicPreference,
  updateBasicPreference,
};
