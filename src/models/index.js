// src/models/index.js

const Admin = require('./admin');
const User = require('./user');
const UserCareerInfo = require('./userCareerInfo');
const FamilyInfo = require('./familyInfo');
const AstrologyInfo = require('./astrologyInfo');
const BasicPreference = require('./basicPreference');

// This single line registers all associations
require('./associations'); 

const models = {
  Admin,
  User,
  UserCareerInfo,
  FamilyInfo,
  AstrologyInfo,
  BasicPreference,
};

module.exports = {
  ...models,
  sequelize: User.sequelize,
  Sequelize: User.Sequelize,
};