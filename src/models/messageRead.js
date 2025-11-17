module.exports = (sequelize, DataTypes) => {
  const MessageRead = sequelize.define(
    "MessageRead",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      messageId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      readAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "MessageReads",
      timestamps: false,
      indexes: [{ fields: ["messageId"] }, { fields: ["userId"] }],
    }
  );

  MessageRead.associate = (models) => {
    MessageRead.belongsTo(models.Message, { foreignKey: "messageId" });
    MessageRead.belongsTo(models.User, { foreignKey: "userId" });
  };

  return MessageRead;
};
