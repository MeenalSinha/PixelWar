const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { activate } = require("../controllers/demoController");

const router = express.Router();
router.post("/activate", requireAuth, activate);

module.exports = router;
