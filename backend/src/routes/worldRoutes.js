const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { cooldown } = require("../middleware/cooldown");
const { CLAIM } = require("../config/gameConfig");
const { getChunkHandler, getPixelHandler, claimPixelHandler } = require("../controllers/worldController");

const router = express.Router();
router.get("/chunk/:chunkX/:chunkY", getChunkHandler);
router.get("/pixel/:x/:y", getPixelHandler);
router.post(
  "/pixel/claim",
  requireAuth,
  validate(schemas.claimPixel),
  cooldown("claim", CLAIM.COOLDOWN_MS),
  claimPixelHandler
);

module.exports = router;
