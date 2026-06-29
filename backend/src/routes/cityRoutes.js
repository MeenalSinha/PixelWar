const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { getMyCities, foundCityHandler, upgradeCityHandler } = require("../controllers/cityController");

const router = express.Router();
router.get("/me", requireAuth, getMyCities);
router.post("/", requireAuth, validate(schemas.foundCity), foundCityHandler);
router.post("/:cityId/upgrade", requireAuth, upgradeCityHandler);

module.exports = router;
