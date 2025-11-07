// src/models/contact.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); 

const Contact = sequelize.define('Contact', {
  id: {
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
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
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
  subject: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Subject cannot be empty.",
        },
      },
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Message cannot be empty.",
        },
      },
    },
}, {
  tableName: 'contact', 
  timestamps: true,       
});

module.exports = Contact;