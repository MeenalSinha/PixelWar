const { getPlayer, getPlayerResources } = require("../models/Player");
const { getClient } = require("../config/dynamo");
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME || "PixelWarTable";

async function getMe(req, res) {
  const player = await getPlayer(req.playerId);
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(player);
}

async function getMyResources(req, res) {
  const resources = await getPlayerResources(req.playerId);
  res.json(resources);
}

async function getRankings(req, res) {
  try {
    const { getRegisteredPlayerIds, getPlayer } = require("../models/Player");
    const playerIds = await getRegisteredPlayerIds();
    
    // Fetch all players
    const players = await Promise.all(playerIds.map(id => getPlayer(id)));
    
    // Filter out nulls, sort by score descending
    const validPlayers = players.filter(Boolean);
    validPlayers.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    res.json(validPlayers.slice(0, 50));
  } catch (err) {
    console.error("Error fetching rankings:", err);
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
}

module.exports = { getMe, getMyResources, getRankings };
