const { listCivilizations, updateCivilization } = require("../models/Civilization");

/**
 * Real per-tick AI behavior, now a lightweight state machine instead of pure
 * Math.random(). Each civilization conditions its decision on persisted
 * memory (territoryPressure, lastAttackedBy, enemies list), which is itself
 * mutated by real combat events via recordAttackOnCivilization(). This is
 * explicitly NOT machine learning — no model, no training, no generalization
 * across civs — but it is genuinely stateful, adaptive behavior: a civ under
 * sustained attack measurably shifts toward defensive/aggressive responses,
 * and that shift is driven by real history, not a fresh random roll each tick.
 */
async function runAiTick(broadcast) {
  const civs = await listCivilizations();

  for (const civ of civs) {
    const memory = civ.memory || { allies: [], enemies: [], lastAttackedBy: null, territoryPressure: 0 };
    const action = decideAction(civ, memory);
    const decayedPressure = Math.max(0, memory.territoryPressure - 5); // pressure decays each tick if not re-attacked

    await applyAction(civ, action, { ...memory, territoryPressure: decayedPressure }, broadcast);
    broadcast?.({
      type: "AI_ACTION",
      civId: civ.civId,
      name: civ.name,
      action: action.type,
      detail: action.detail,
      territoryPressure: decayedPressure,
    });
  }
}

/**
 * Called from the combat controller whenever an AI civilization's pixel is
 * attacked. This is the real link between player actions and AI memory:
 * combat doesn't just damage a pixel, it raises that civ's territoryPressure
 * and records the attacker as an enemy, which decideAction() below reads on
 * the next tick.
 */
async function recordAttackOnCivilization(civId, attackerId, civData) {
  const memory = civData.memory || { allies: [], enemies: [], lastAttackedBy: null, territoryPressure: 0 };
  const enemies = memory.enemies.includes(attackerId) ? memory.enemies : [...memory.enemies, attackerId].slice(-10);
  const updatedMemory = {
    ...memory,
    enemies,
    lastAttackedBy: attackerId,
    territoryPressure: Math.min(100, memory.territoryPressure + 30),
  };
  await updateCivilization(civId, { memory: updatedMemory });
  return updatedMemory;
}

function decideAction(civ, memory) {
  // Under high territory pressure, every personality leans defensive/retaliatory
  // regardless of its base disposition — this is the "adapts using state" requirement.
  if (memory.territoryPressure > 60 && memory.lastAttackedBy) {
    return Math.random() < 0.7
      ? { type: "RETALIATE", detail: `mobilized forces against a recent aggressor` }
      : { type: "FORTIFY", detail: "reinforced borders under pressure" };
  }

  const roll = Math.random();
  switch (civ.personality) {
    case "aggressive":
      return roll < 0.6
        ? { type: "EXPAND_TERRITORY", detail: "pushed borders outward" }
        : { type: "GAIN_POWER", detail: "trained troops" };
    case "trader":
      return roll < 0.7
        ? { type: "TRADE", detail: "executed a market trade" }
        : { type: "EXPAND_TERRITORY", detail: "founded a trade outpost" };
    case "scientist":
      return roll < 0.7
        ? { type: "RESEARCH", detail: "advanced research" }
        : { type: "GAIN_POWER", detail: "fortified labs" };
    case "explorer":
      return { type: "EXPAND_TERRITORY", detail: "scouted new land" };
    case "diplomat":
      return roll < 0.5 ? { type: "DIPLOMACY", detail: "proposed a treaty" } : { type: "TRADE", detail: "signed a trade deal" };
    default: // peaceful
      return roll < 0.6 ? { type: "GAIN_RESOURCES", detail: "focused on farming" } : { type: "RESEARCH", detail: "studied quietly" };
  }
}

async function applyAction(civ, action, memory, broadcast) {
  const updates = { memory };
  switch (action.type) {
    case "RETALIATE":
      updates.power = (civ.power || 0) + Math.floor(Math.random() * 150) + 100;
      break;
    case "FORTIFY":
      updates.power = (civ.power || 0) + Math.floor(Math.random() * 60) + 20;
      break;
    case "EXPAND_TERRITORY":
      const territoryGain = Math.floor(Math.random() * 5) + 1;
      updates.territoryPixelCount = (civ.territoryPixelCount || 0) + territoryGain;
      updates.power = (civ.power || 0) + Math.floor(Math.random() * 50);
      
      // Simulate real pixel expansion near the origin
      const { claimPixel } = require("../models/Pixel");
      for(let i=0; i<territoryGain; i++) {
        // Find a random pixel within a radius proportional to current territory size
        const radius = Math.max(2, Math.floor(Math.sqrt(updates.territoryPixelCount || 1)));
        const targetX = civ.originX + Math.floor(Math.random() * (radius * 2 + 1)) - radius;
        const targetY = civ.originY + Math.floor(Math.random() * (radius * 2 + 1)) - radius;
        
        try {
          const colors = {
            aggressive: "#C0392B", trader: "#F4C430", scientist: "#2F6FA8",
            explorer: "#1F7A3F", diplomat: "#9B59B6", peaceful: "#7FCBE8",
          };
          const color = colors[civ.personality] || "#888888";
          const pixel = await claimPixel({ x: targetX, y: targetY, playerId: civ.civId, color });
          if (broadcast) broadcast({ type: "PIXEL_CLAIMED", pixel });
        } catch (err) {
          // Ignore conflict errors if pixel is already owned
        }
      }
      break;
    case "GAIN_POWER":
      updates.power = (civ.power || 0) + Math.floor(Math.random() * 200) + 50;
      break;
    case "GAIN_RESOURCES":
    case "TRADE":
      updates.resources = mutateResources(civ.resources);
      break;
    case "RESEARCH":
      updates.power = (civ.power || 0) + Math.floor(Math.random() * 30);
      break;
    case "DIPLOMACY":
      break;
  }
  await updateCivilization(civ.civId, updates);
}

function mutateResources(resources = {}) {
  const next = { ...resources };
  for (const key of Object.keys(next)) {
    next[key] = Math.max(0, next[key] + Math.floor(Math.random() * 100) - 30);
  }
  return next;
}

module.exports = { runAiTick, recordAttackOnCivilization };
