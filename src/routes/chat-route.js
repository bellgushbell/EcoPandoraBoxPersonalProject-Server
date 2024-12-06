const express = require("express");
const chatController = require("../controllers/chathistory-controller");

const router = express.Router();

// ดึง chatBoxId
router.get("/history/getchatBoxId", chatController.getChatBoxID);

// ดึงประวัติแชท
router.get("/history/:chatBoxId", chatController.getChatHistory);

module.exports = router;
