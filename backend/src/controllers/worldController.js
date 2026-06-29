const { getPixel, getChunk, claimPixel, ConflictError } = require("../models/Pixel");
const { recalcTerritoryForPixel } = require("../services/territoryService");
const { incrementMissionProgress } = require("../models/Mission");
const { incrementPlayerStat } = require("../models/Player");
const { broadcast } = require("../ws/server");

async function getChunkHandler(req, res) {
  const cx = parseInt(req.params.chunkX, 10);
  const cy = parseInt(req.params.chunkY, 10);
  const pixels = await getChunk(cx, cy);
  res.json({ chunkX: cx, chunkY: cy, pixels });
}

async function getPixelHandler(req, res) {
  const x = parseInt(req.params.x, 10);
  const y = parseInt(req.params.y, 10);
  const pixel = await getPixel(x, y);
  res.json(pixel);
}

async function claimPixelHandler(req, res) {
  const { x, y, color, expectedVersion } = req.body;
  if (typeof x !== "number" || typeof y !== "number" || !color) {
    return res.status(400).json({ error: "x, y, and color are required" });
  }

  try {
    const pixel = await claimPixel({ x, y, playerId: req.playerId, color, expectedVersion });
    const territoryId = await recalcTerritoryForPixel(x, y, req.playerId);
    await incrementMissionProgress(req.playerId, "pixels_claimed", 1);
    await incrementPlayerStat(req.playerId, "territory", 1);

    const updated = { ...pixel, territoryId };
    broadcast({ type: "PIXEL_CLAIMED", pixel: updated });

    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof ConflictError) return res.status(409).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Failed to claim pixel" });
  }
}

module.exports = { getChunkHandler, getPixelHandler, claimPixelHandler };
