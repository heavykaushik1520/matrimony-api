module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      conversationId: { type: DataTypes.UUID, allowNull: false },
      senderId: { type: DataTypes.UUID, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      contentType: { type: DataTypes.STRING, defaultValue: "text" }, // text, image, etc.
      delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
      // single-flag convenience; per-user read should use MessageRead model for accuracy
      read: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "Messages",
      timestamps: true,
      indexes: [{ fields: ["conversationId"] }, { fields: ["senderId"] }],
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: "conversationId" });
    Message.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
    Message.hasMany(models.MessageRead, { foreignKey: "messageId", onDelete: "CASCADE" });
  };

  return Message;
};