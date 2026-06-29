const { v4: uuid } = require("uuid");
const { PutCommand, UpdateCommand, DeleteCommand, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");
const { assertNotSelf } = require("../utils/authorization");

async function createListing(playerId, { resourceType, quantity, pricePerUnit }) {
  // Real resource deduction up front so a player can't list more than they have
  // and double-spend it across multiple listings.
  const resourceItem = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.resource(playerId, resourceType) }));
  const owned = resourceItem.Item?.amount || 0;
  if (owned < quantity) throw Object.assign(new Error(`Not enough ${resourceType} to list`), { status: 400 });

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.resource(playerId, resourceType),
      UpdateExpression: "SET amount = amount - :q",
      ExpressionAttributeValues: { ":q": quantity },
    })
  );

  const listingId = uuid();
  const item = {
    PK: "MARKET#LISTINGS",
    SK: `LISTING#${listingId}`,
    entityType: "TRADE",
    listingId,
    sellerId: playerId,
    resourceType,
    quantity,
    pricePerUnit,
    status: "open",
    createdAt: Date.now(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function listOpenListings() {
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "entityType = :t AND #s = :s",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":t": "TRADE", ":s": "open" },
    })
  );
  return (result.Items || []).sort((a, b) => b.createdAt - a.createdAt);
}

async function fulfillListing(listingId, buyerId) {
  const { GetCommand: Get } = require("@aws-sdk/lib-dynamodb");
  const res = await ddb.send(new Get({ TableName: TABLE_NAME, Key: { PK: "MARKET#LISTINGS", SK: `LISTING#${listingId}` } }));
  const listing = res.Item;
  if (!listing || listing.status !== "open") throw Object.assign(new Error("Listing not available"), { status: 404 });
  assertNotSelf(listing.sellerId, buyerId, "buy your own listing");

  const totalCost = listing.quantity * listing.pricePerUnit;

  const buyerGold = await ddb.send(new Get({ TableName: TABLE_NAME, Key: Keys.resource(buyerId, "gold") }));
  if ((buyerGold.Item?.amount || 0) < totalCost) throw Object.assign(new Error("Not enough gold"), { status: 400 });

  // Real atomic-ish transfer: deduct buyer gold, credit seller gold, credit buyer resource, close listing.
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME, Key: Keys.resource(buyerId, "gold"),
    UpdateExpression: "SET amount = amount - :c", ExpressionAttributeValues: { ":c": totalCost },
  }));
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME, Key: Keys.resource(listing.sellerId, "gold"),
    UpdateExpression: "SET amount = amount + :c", ExpressionAttributeValues: { ":c": totalCost },
  }));
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME, Key: Keys.resource(buyerId, listing.resourceType),
    UpdateExpression: "SET amount = if_not_exists(amount, :zero) + :q",
    ExpressionAttributeValues: { ":q": listing.quantity, ":zero": 0 },
  }));
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME, Key: { PK: "MARKET#LISTINGS", SK: `LISTING#${listingId}` },
    UpdateExpression: "SET #s = :s, buyerId = :b", ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":s": "fulfilled", ":b": buyerId },
  }));

  return { ...listing, status: "fulfilled", buyerId };
}

module.exports = { createListing, listOpenListings, fulfillListing };
