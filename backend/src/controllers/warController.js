const { attackPixel } = require("../models/War");
const { incrementMissionProgress } = require("../models/Mission");
const { createNotification } = require("../models/Notification");
const { getCivilization } = require("../models/Civilization");
const { recordAttackOnCivilization } = require("../services/aiCivService");
const { broadcast } = require("../ws/server");

async function attackHandler(req, res) {
  try {
    const { x, y } = req.body;

    const battle = await attackPixel({ x, y, attackerId: req.playerId });

    // Real fix: AI civilizations now own actual pixels (see Civilization.js),
    // so combat against them is reachable in normal gameplay, not just Demo
    // Mode. If the defender is a civId, feed the AI's real memory system
    // instead of (or in addition to) the player-notification path.
    const defenderCiv = await getCivilization(battle.defenderId);
    if (defenderCiv) {
      await recordAttackOnCivilization(defenderCiv.civId, req.playerId, defenderCiv);
      broadcast({ type: "AI_CIV_ATTACKED", civId: defenderCiv.civId, name: defenderCiv.name, x, y, damage: battle.damage });
    } else {
      await createNotification(battle.defenderId, {
        type: "territory_attacked",
        message: battle.captured
          ? `Your territory at (${x}, ${y}) was captured!`
          : `Your territory at (${x}, ${y}) is under attack`,
      });
    }

    if (battle.captured) {
      await incrementMissionProgress(req.playerId, "battles_won", 1);
    }

    broadcast({ type: "PIXEL_ATTACKED", battle });
    res.status(200).json(battle);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { attackHandler };
