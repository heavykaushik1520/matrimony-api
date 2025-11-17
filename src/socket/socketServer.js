// ...existing code...
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { Message, Conversation, ConversationParticipant, User } = require("../models");

function initSocketServer(appServer) {
  // if you already have http server: pass it in; otherwise create from express app
  const io = new Server(appServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // map userId -> socketId(s)
  const online = new Map();

  io.use(async (socket, next) => {
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
    // store socket
    const set = online.get(userId) || new Set();
    set.add(socket.id);
    online.set(userId, set);

    socket.on("join_conversation", async ({ conversationId }) => {
      // optionally verify participant
      const part = await ConversationParticipant.findOne({ where: { conversationId, userId }});
      if (!part) return socket.emit("error", { message: "Not a participant" });
      socket.join(conversationId);
    });

    socket.on("send_message", async (payload, ack) => {
      // payload: { conversationId, content, contentType }
      try {
        const { conversationId, content, contentType = "text" } = payload;
        // basic validation & participant check
        const isPart = await ConversationParticipant.findOne({ where: { conversationId, userId }});
        if (!isPart) return ack && ack({ success: false, message: "Forbidden" });

        // create message in DB
        const msg = await Message.create({
          conversationId,
          senderId: userId,
          content,
          contentType,
        });

        // emit to room (all participants who are joined)
        io.to(conversationId).emit("message:new", msg);

        // also emit to individual online sockets of participants not in room
        const participants = await ConversationParticipant.findAll({ where: { conversationId }});
        for (const p of participants) {
          const uid = p.userId;
          if (uid === userId) continue;
          const sockets = online.get(uid);
          if (sockets && sockets.size) {
            for (const sid of sockets) io.to(sid).emit("message:new", msg);
          }
        }

        // ack sender with saved message
        ack && ack({ success: true, message: msg });

      } catch (err) {
        console.error("send_message error", err);
        ack && ack({ success: false, message: "Failed to send" });
      }
    });

    socket.on("message:read", async ({ messageId }) => {
      // mark read
      await Message.update({ read: true }, { where: { id: messageId }});
      // broadcast read receipt
      io.emit("message:read", { messageId, readerId: userId });
    });

    socket.on("disconnect", () => {
      const set = online.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) online.delete(userId);
      }
    });
  });

  return io;
}

module.exports = { initSocketServer };