/**
 * Centralized gameplay constants. Audit fix: damage values, cooldowns, and
 * costs were previously inline magic numbers scattered across models —
 * consolidating them here makes balance tuning a one-file change instead of
 * a grep-and-hope exercise.
 */
module.exports = {
  COMBAT: {
    MIN_DAMAGE: 20,
    MAX_BONUS_DAMAGE: 30,
    WALL_MITIGATION: 0.5,
    ATTACK_ENERGY_COST: 15,
    ATTACK_COOLDOWN_MS: 3000,
  },
  CLAIM: {
    COOLDOWN_MS: 300,
  },
  RESOURCE: {
    STARTING: { wood: 200, stone: 150, iron: 50, gold: 100, food: 200, energy: 50 },
    DEFAULT_RATES: { wood: 320, stone: 210, iron: 180, gold: 150, food: 300, energy: 250 },
  },
};
