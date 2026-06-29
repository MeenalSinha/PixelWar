const { ensurePlayerMissions } = require("../models/Mission");

async function getMyMissions(req, res) {
  const missions = await ensurePlayerMissions(req.playerId);
  res.json(missions);
}

module.exports = { getMyMissions };
