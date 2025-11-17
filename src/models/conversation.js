module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: { type: DataTypes.STRING, allowNull: true }, // optional for group chats
      isGroup: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "Conversations",
      timestamps: true,
    }
  );

  Conversation.associate = (models) => {
    Conversation.hasMany(models.Message, { foreignKey: "conversationId", onDelete: "CASCADE" });
    Conversation.hasMany(models.ConversationParticipant, { foreignKey: "conversationId", onDelete: "CASCADE" });
  };

  return Conversation;
};