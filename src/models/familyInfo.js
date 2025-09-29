const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const FamilyInfo = sequelize.define(
  "FamilyInfo",
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

    fatherName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    motherName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    liveWithFamily: {
      type : DataTypes.ENUM("Yes", "No"),
      allowNull: false,
    },
    brothersCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    sistersCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
    },

    relativesSurname: {
      type: DataTypes.JSON,
      allowNull: true,
     
    },
  },
  {
    tableName: "familyInfo",
    timestamps: true,
  }
);

module.exports = FamilyInfo;
