// src/models/index.js

const Admin = require('./admin');
const User = require('./user');
const UserCareerInfo = require('./userCareerInfo');
const FamilyInfo = require('./familyInfo');
const AstrologyInfo = require('./astrologyInfo');

// This single line registers all associations
require('./associations'); 

const models = {
  Admin,
  User,
  UserCareerInfo,
  FamilyInfo,
  AstrologyInfo,
};

module.exports = {
  ...models,
  sequelize: User.sequelize,
  Sequelize: User.Sequelize,
};