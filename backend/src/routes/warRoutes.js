const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { cooldown } = require("../middleware/cooldown");
const { COMBAT } = require("../config/gameConfig");
const { attackHandler } = require("../controllers/warController");

const router = express.Router();
router.post(
  "/attack",
  requireAuth,
  validate(schemas.attackPixel),
  cooldown("attack", COMBAT.ATTACK_COOLDOWN_MS),
  attackHandler
);

module.exports = router;
