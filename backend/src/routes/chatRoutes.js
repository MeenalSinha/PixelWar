const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { getMessages, postMessageHandler } = require("../controllers/chatController");

const router = express.Router();
router.get("/", getMessages);
router.post("/", requireAuth, validate(schemas.chatMessage), postMessageHandler);

module.exports = router;
