const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AstrologyInfo = sequelize.define(
  "AstrologyInfo",
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
    ras: {
      type: DataTypes.ENUM(
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces"
      ),
      allowNull: false,
    },

    gan: {
      type: DataTypes.ENUM("Deva", "Manushya", "Rakshasa"),
      allowNull: false,
    },

    mangal: {
      type: DataTypes.ENUM("Yes", "No", "Partial"),
      allowNull: false,
    },

    nadis: {
      type: DataTypes.ENUM("Aadi", "Madhya", "Antya"),
      allowNull: false,
    },

    charan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nakshatra: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gotra: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "astrologyInfo",
    timestamps: true,
  }
);

module.exports = AstrologyInfo;
