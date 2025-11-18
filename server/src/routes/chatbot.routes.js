const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chatbot.controller");

/**
 * @route POST /api/chat
 * @desc Send a message to the chatbot
 * @access Public
 */
router.post("/", sendMessage);

module.exports = router;
