const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getMe, getMyResources, getRankings } = require("../controllers/playerController");
const { getCivilizations } = require("../controllers/civController");

const router = express.Router();
router.get("/me", requireAuth, getMe);
router.get("/me/resources", requireAuth, getMyResources);
router.get("/civilizations", getCivilizations);
router.get("/rankings", getRankings);

module.exports = router;
