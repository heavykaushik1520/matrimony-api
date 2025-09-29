// src/models/admin.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); 

const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,
      isValidEmail(value) {
        if (!/^([a-zA-Z0-9_\.-]+)@([a-zA-Z0-9\.-]+)\.([a-zA-Z]{2,6})$/.test(value)) {
          throw new Error("Invalid email format.");
        }
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isNumeric: true,
      len: [10, 10],
      isValidPhone(value) {
        if (value && !/^\d{10}$/.test(value)) {
          throw new Error("Phone number must be exactly 10 digits and numeric.");
        }
      },
    },
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin'
  }
}, {
  tableName: 'admins', 
  timestamps: true,       
});

module.exports = Admin;