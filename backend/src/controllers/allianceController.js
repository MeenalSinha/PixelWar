const { createAlliance, listAlliances, joinAlliance, getAlliance, contributeResources } = require("../models/Alliance");
const { incrementMissionProgress } = require("../models/Mission");
const { createNotification } = require("../models/Notification");
const { broadcast } = require("../ws/server");
const { updatePlayerStats } = require("../models/Player");

async function getAlliances(req, res) {
  res.json(await listAlliances());
}

async function createAllianceHandler(req, res) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Alliance name is required" });
    const alliance = await createAlliance(req.playerId, name.trim());
    // Write allianceId back to the player profile so api.me() reflects membership
    await updatePlayerStats(req.playerId, { allianceId: alliance.allianceId });
    await incrementMissionProgress(req.playerId, "alliance_created", 1);
    broadcast({ type: "ALLIANCE_CREATED", alliance });
    res.status(201).json(alliance);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function joinAllianceHandler(req, res) {
  try {
    const alliance = await joinAlliance(req.params.allianceId, req.playerId);
    // Write allianceId back to the player profile so api.me() reflects membership
    await updatePlayerStats(req.playerId, { allianceId: alliance.allianceId });
    await createNotification(alliance.leaderId, { type: "alliance_invite", message: `A new player joined ${alliance.name}` });
    broadcast({ type: "ALLIANCE_JOINED", allianceId: alliance.allianceId, playerId: req.playerId });
    res.json(alliance);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function contributeHandler(req, res) {
  try {
    const { resourceType, amount } = req.body;
    const resources = await contributeResources(req.params.allianceId, resourceType, amount);
    res.json(resources);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getAlliances, createAllianceHandler, joinAllianceHandler, contributeHandler };
