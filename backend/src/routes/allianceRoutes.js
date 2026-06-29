const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const {
  getAlliances, createAllianceHandler, joinAllianceHandler, contributeHandler,
} = require("../controllers/allianceController");

const router = express.Router();
router.get("/", getAlliances);
router.post("/", requireAuth, validate(schemas.createAlliance), createAllianceHandler);
router.post("/:allianceId/join", requireAuth, joinAllianceHandler);
router.post("/:allianceId/contribute", requireAuth, validate(schemas.contributeResources), contributeHandler);

module.exports = router;
