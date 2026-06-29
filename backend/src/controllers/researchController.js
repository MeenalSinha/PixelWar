const { getPlayerResearch, startResearch, TECH_TREE } = require("../models/Research");

async function getTechTree(req, res) {
  res.json(TECH_TREE.map(({ id, name, durationMs, unlocks }) => ({ id, name, durationMs, unlocks })));
}

async function getMyResearch(req, res) {
  res.json(await getPlayerResearch(req.playerId));
}

async function startResearchHandler(req, res) {
  try {
    const item = await startResearch(req.playerId, req.body.techId);
    res.status(201).json(item);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getTechTree, getMyResearch, startResearchHandler };
