const User = require("./user");
const UserCareerInfo = require("./userCareerInfo");
const FamilyInfo = require("./familyInfo");
const AstrologyInfo = require("./astrologyInfo");

//one-to-one relationship career info
User.hasOne(UserCareerInfo, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

UserCareerInfo.belongsTo(User, {
  foreignKey: "userId",
});

//one-to-one relationship astrology info
User.hasOne(AstrologyInfo, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

AstrologyInfo.belongsTo(User , {
  foreignKey : "userId" ,
})

//one-to-one relationship family info
User.hasOne(FamilyInfo, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

FamilyInfo.belongsTo(User, {
  foreignKey: "userId",
});
