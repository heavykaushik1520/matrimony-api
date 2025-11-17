const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { Message, Conversation, ConversationParticipant, User } = require("../models");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // map userId -> socket ids (optional)
  const online = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { userId: payload.userId };
      return next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.userId;

    // join a personal room so server can target user's sockets easily
    socket.join(`user_${userId}`);

    // track sockets
    const s = online.get(userId) || new Set();
    s.add(socket.id);
    online.set(userId, s);

    socket.on("join_conversation", async ({ conversationId }, ack) => {
      try {
        const part = await ConversationParticipant.findOne({ where: { conversationId, userId } });
        if (!part) return ack && ack({ success: false, message: "Not a participant" });
        socket.join(conversationId);
        ack && ack({ success: true });
      } catch (err) {
        console.error("join_conversation error", err);
        ack && ack({ success: false, message: err.message });
      }
    });

    socket.on("send_message", async (payload, ack) => {
      // payload: { conversationId, content, contentType }
      try {
        const { conversationId, content, contentType = "text" } = payload;
        if (!content) return ack && ack({ success: false, message: "content required" });

        const part = await ConversationParticipant.findOne({ where: { conversationId, userId } });
        if (!part) return ack && ack({ success: false, message: "Forbidden" });

        const msg = await Message.create({
          conversationId,
          senderId: userId,
          content,
          contentType,
        });

        const sender = await User.findByPk(userId, { attributes: ["id", "firstname", "profilePhotos"] });
        const out = { ...msg.get({ plain: true }), sender };

        // emit to conversation room
        io.to(conversationId).emit("message:new", out);

        // emit to individual user's personal rooms (in case they are not in convo room)
        const participants = await ConversationParticipant.findAll({ where: { conversationId } });
        for (const p of participants) {
          if (p.userId === userId) continue;
          io.to(`user_${p.userId}`).emit("message:new", out);
        }

        ack && ack({ success: true, message: out });
      } catch (err) {
        console.error("send_message socket error", err);
        ack && ack({ success: false, message: "Failed to send" });
      }
    });

    socket.on("message:read", async ({ messageId }, ack) => {
      try {
        // create per-user read entry (optional)
        // await MessageRead.create({ messageId, userId });
        await Message.update({ read: true }, { where: { id: messageId } });
        io.emit("message:read", { messageId, readerId: userId });
        ack && ack({ success: true });
      } catch (err) {
        console.error("message:read error", err);
        ack && ack({ success: false });
      }
    });

    socket.on("disconnect", () => {
      const set = online.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) online.delete(userId);
      }
      socket.leave(`user_${userId}`);
    });
  });

  return io;
}

module.exports = { initSocketServer };