const { Conversation, ConversationParticipant, Message, User } = require("../models");
const { Op } = require("sequelize");

async function getConversations(req, res) {
  const userId = req.user.userId;
  const conversations = await Conversation.findAll({
    include: [
      { model: ConversationParticipant, where: { userId }, attributes: [] },
      { model: Message, limit: 1, order: [["createdAt", "DESC"]] }
    ],
    order: [[Message, "createdAt", "DESC"]],
  });
  return res.json({ success: true, conversations });
}

async function getMessages(req, res) {
  const { conversationId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 20;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // optional: check user is participant
  const isParticipant = await ConversationParticipant.findOne({ where: { conversationId, userId: req.user.userId } });
  if (!isParticipant) return res.status(403).json({ success: false, message: "Forbidden" });

  const { count, rows } = await Message.findAndCountAll({
    where: { conversationId },
    order: [["createdAt", "DESC"]],
    limit, offset,
    include: [{ model: User, as: "sender", attributes: ["id", "firstname", "profilePhotos"] }]
  });

  return res.json({ success: true, total: count, page, perPage: limit, messages: rows.reverse() });
}

// Create (or return existing) one-to-one conversation between two users
async function createConversation(req, res) {
  try {
    const userId = req.user.userId;
    const { otherUserId, isGroup = false, title } = req.body;
    if (!otherUserId && !isGroup) {
      return res.status(400).json({ success: false, message: "otherUserId is required for one-to-one conversation." });
    }

    if (!isGroup) {
      // find existing conversation with exactly these two participants (simple approach)
      const existing = await Conversation.findAll({
        where: { isGroup: false },
        include: [
          { model: ConversationParticipant, where: { userId }, attributes: [] },
          { model: ConversationParticipant, where: { userId: otherUserId }, attributes: [] },
        ],
        limit: 1,
      });
      if (existing && existing.length) return res.json({ success: true, conversation: existing[0] });
    }

    // create conversation
    const conv = await Conversation.create({ title: title || null, isGroup });

    // add participants
    const participants = isGroup
      ? (req.body.participantIds || []).map((uid) => ({ conversationId: conv.id, userId: uid }))
      : [
          { conversationId: conv.id, userId },
          { conversationId: conv.id, userId: otherUserId },
        ];

    await ConversationParticipant.bulkCreate(participants);

    const conversation = await Conversation.findByPk(conv.id, {
      include: [{ model: ConversationParticipant }],
    });

    return res.status(201).json({ success: true, conversation });
  } catch (err) {
    console.error("createConversation error", err);
    return res.status(500).json({ success: false, message: "Failed to create conversation.", error: err.message });
  }
}

// Send message via REST (fallback) - persist and emit using socket io stored on app
async function sendMessageRest(req, res) {
  try {
    const senderId = req.user.userId;
    const { conversationId } = req.params;
    const { content, contentType = "text" } = req.body;

    if (!content) return res.status(400).json({ success: false, message: "Message content required." });

    // verify participant
    const isParticipant = await ConversationParticipant.findOne({ where: { conversationId, userId: senderId } });
    if (!isParticipant) return res.status(403).json({ success: false, message: "Forbidden" });

    const msg = await Message.create({
      conversationId,
      senderId,
      content,
      contentType,
    });

    // include sender minimal info
    const sender = await User.findByPk(senderId, { attributes: ["id", "firstname", "profilePhotos"] });
    const payload = { ...msg.get({ plain: true }), sender };

    // emit via socket.io if available
    const io = req.app && req.app.get && req.app.get("io");
    if (io) {
      io.to(conversationId).emit("message:new", payload);

      // also emit direct to online sockets of participants (so they get if not joined)
      const participants = await ConversationParticipant.findAll({ where: { conversationId } });
      for (const p of participants) {
        if (p.userId === senderId) continue;
        const sockets = io.sockets.adapter.rooms.get(`user_${p.userId}`); // using user-specific room in socketServer
        if (sockets && sockets.size) {
          io.to(Array.from(sockets)).emit("message:new", payload);
        }
      }
    }

    return res.status(201).json({ success: true, message: msg });
  } catch (err) {
    console.error("sendMessageRest error", err);
    return res.status(500).json({ success: false, message: "Failed to send message.", error: err.message });
  }
}

module.exports = { getConversations, getMessages, createConversation, sendMessageRest };