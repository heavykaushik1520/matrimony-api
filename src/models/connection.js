// src/models/admin.js

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Connection = sequelize.define(
  "Connection",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    //sender user id
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // receiver user id
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    //status
    status: {
      type: DataTypes.ENUM("pending", "accepted"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "connections",
    timestamps: true,

     indexes: [
        {
            unique: true,
            fields: ['senderId', 'receiverId']
        }
    ]
  }
);

module.exports = Connection;
