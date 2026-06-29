const { activateDemoMode } = require("../models/DemoMode");
const { broadcast } = require("../ws/server");

async function activate(req, res) {
  try {
    const result = await activateDemoMode(req.playerId);
    broadcast({ type: "DEMO_MODE_ACTIVATED", playerId: req.playerId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { activate };
