const { getNotifications, markRead } = require("../models/Notification");

async function getMyNotifications(req, res) {
  res.json(await getNotifications(req.playerId));
}

async function markReadHandler(req, res) {
  await markRead(req.playerId, req.params.notificationId, req.body.sk);
  res.status(204).end();
}

module.exports = { getMyNotifications, markReadHandler };
