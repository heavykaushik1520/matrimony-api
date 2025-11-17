const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UserCareerInfo = sequelize.define(
  "UserCareerInfo",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    education: {
      // type: DataTypes.ENUM(
      //   "10th",
      //   "12th",
      //   "Diploma",
      //   "Graduation",
      //   "Post-Graduation"
      // ),
      type: DataTypes.ENUM(
        "10th", 
        "12th",
        "Diploma",
        "Polytechnic",
        "Engineering Diploma",
        "ITI",
        "B.E / B.Tech",
        "B.Sc",
        "B.Com",
        "B.A",
        "BBA",
        "BCA",
        "B.Arch",
        "B.Pharm",
        "B.Ed",
        "LLB",
        "BSW",
        "BFA",
        "BHM",
        "BMS",
        "Post-Graduation",
        "MBA / PGDM",
        "M.Com",
        "M.Sc",
        "M.A",
        "M.Tech / M.E",
        "MCA",
        "MS (Engineering / Science)",
        "LLM",
        "M.Arch",
        "M.Pharm",
        "M.Ed",
        "PG Diploma",
        "Ph.D",
        "M.Phil",
        "Doctorate",
        "MBBS",
        "BDS",
        "MDS",
        "BAMS",
        "BHMS",
        "BUMS",
        "MD / MS (Medical)",
        "Nursing (B.Sc / M.Sc)",
        "Physiotherapy (BPT / MPT)",
        "Pharm.D",
        "CA",
        "CS",
        "CMA / ICWA",
        "Professional (Other)",
        "Graduation",
        "Post-Graduation"
      ),
      allowNull: false,
     
    },
    jobSector: {
      type: DataTypes.ENUM("Private", "Government", "Freelance", "Business"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Private", "Government", "Freelance", "Business"]],
          msg: "Job sector must be 'Private', 'Government', 'Freelance', or 'Business'.",
        },
      },
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Job title cannot be empty.",
        },
      },
    },
    jobLocation: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Job location cannot be empty.",
        },
      },
    },
    jobDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Job description cannot be empty.",
        },
      },
    },
    annualSalary: {
      type: DataTypes.ENUM(
        "Below 1 lac",
        "1 - 3 lac",
        "3 - 5 lac",
        "5 - 7.5 lac",
        "7.5 - 10 lac",
        "Above 10 lac"
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [
            [
              "Below 1 lac",
              "1 - 3 lac",
              "3 - 5 lac",
              "5 - 7.5 lac",
              "7.5 - 10 lac",
              "Above 10 lac",
            ],
          ],
          msg: "Invalid salary range provided.",
        },
      },
    },
  },
  {
    tableName: "userCareerInfo",
    timestamps: true,
  }
);

module.exports = UserCareerInfo;
