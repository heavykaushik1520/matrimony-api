const User = require("./user");
const UserCareerInfo = require("./userCareerInfo");
const FamilyInfo = require("./familyInfo");
const AstrologyInfo = require("./astrologyInfo");
const Connection = require("./connection");

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


//
User.hasMany(Connection , {
  foreignKey: 'senderId',
  as : 'SentConnections',
  onDelete : 'CASCADE'
})

User.hasMany(Connection, {
  foreignKey: 'receiverId',
  as: 'ReceivedConnections', 
  onDelete: 'CASCADE'
});

Connection.belongsTo(User , {
  foreignKey: 'senderId',
  as: 'Sender'
})

Connection.belongsTo(User,{
  foreignKey: 'receiverId',
  as: 'Receiver'
})