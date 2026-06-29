const { postMessage, getRecentMessages } = require("../models/Chat");
const { broadcast } = require("../ws/server");

async function getMessages(req, res) {
  const { scope = "global", allianceId } = req.query;
  res.json(await getRecentMessages({ scope, allianceId }));
}

async function postMessageHandler(req, res) {
  try {
    const { scope, allianceId, text, username } = req.body;
    const message = await postMessage({ playerId: req.playerId, username, scope, allianceId, text });
    broadcast({ type: "CHAT_MESSAGE", message });
    res.status(201).json(message);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getMessages, postMessageHandler };
