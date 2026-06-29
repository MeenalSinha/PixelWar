const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getMyMissions } = require("../controllers/missionController");

const router = express.Router();
router.get("/me", requireAuth, getMyMissions);

module.exports = router;
