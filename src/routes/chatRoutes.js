const express = require("express");
const router = express.Router();
const { getConversations, getMessages, createConversation, sendMessageRest } = require("../controllers/chatController");
const { isUser } = require("../middleware/userAuthMiddleware");

router.get("/conversations", isUser, getConversations);
router.post("/conversations", isUser, createConversation);
router.get("/conversations/:conversationId/messages", isUser, getMessages);
router.post("/conversations/:conversationId/messages", isUser, sendMessageRest); // REST fallback to send
module.exports = router;