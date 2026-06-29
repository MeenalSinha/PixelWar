const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { getListings, createListingHandler, fulfillListingHandler } = require("../controllers/marketController");

const router = express.Router();
router.get("/", getListings);
router.post("/", requireAuth, validate(schemas.createListing), createListingHandler);
router.post("/:listingId/buy", requireAuth, fulfillListingHandler);

module.exports = router;
