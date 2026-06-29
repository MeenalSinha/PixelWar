const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getMyNotifications, markReadHandler } = require("../controllers/notificationController");

const router = express.Router();
router.get("/me", requireAuth, getMyNotifications);
router.post("/:notificationId/read", requireAuth, markReadHandler);

module.exports = router;
