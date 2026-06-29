const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { getTechTree, getMyResearch, startResearchHandler } = require("../controllers/researchController");

const router = express.Router();
router.get("/tree", getTechTree);
router.get("/me", requireAuth, getMyResearch);
router.post("/start", requireAuth, validate(schemas.startResearch), startResearchHandler);

module.exports = router;
