module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define(
    "ConversationParticipant",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      conversationId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      // optional role/metadata
      role: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "ConversationParticipants",
      timestamps: true,
      indexes: [{ fields: ["conversationId"] }, { fields: ["userId"] }],
    }
  );

  ConversationParticipant.associate = (models) => {
    ConversationParticipant.belongsTo(models.Conversation, { foreignKey: "conversationId" });
    ConversationParticipant.belongsTo(models.User, { foreignKey: "userId" });
  };

  return ConversationParticipant;
};