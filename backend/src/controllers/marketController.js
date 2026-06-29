const { createListing, listOpenListings, fulfillListing } = require("../models/Trade");
const { createNotification } = require("../models/Notification");
const { broadcast } = require("../ws/server");

async function getListings(req, res) {
  res.json(await listOpenListings());
}

async function createListingHandler(req, res) {
  try {
    const { resourceType, quantity, pricePerUnit } = req.body;
    if (!resourceType || !quantity || !pricePerUnit) {
      return res.status(400).json({ error: "resourceType, quantity, and pricePerUnit are required" });
    }
    const listing = await createListing(req.playerId, { resourceType, quantity, pricePerUnit });
    broadcast({ type: "LISTING_CREATED", listing });
    res.status(201).json(listing);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function fulfillListingHandler(req, res) {
  try {
    const result = await fulfillListing(req.params.listingId, req.playerId);
    await createNotification(result.sellerId, {
      type: "trade_accepted",
      message: `Your listing for ${result.quantity} ${result.resourceType} was purchased`,
    });
    broadcast({ type: "LISTING_FULFILLED", listing: result });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getListings, createListingHandler, fulfillListingHandler };
