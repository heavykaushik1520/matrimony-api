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
    preferredJobTitle,
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
        preferredJobTitle,
        preferredJobLocation,
        preferredAnnualSalary,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "Besic Preference Created Successfully.",
      basicPreference: {
        id: newBasicPreference.id
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

module.exports = {
  createBasicPreference,
};
