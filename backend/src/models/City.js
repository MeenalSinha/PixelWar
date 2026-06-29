const { v4: uuid } = require("uuid");
const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");
const { assertOwnsResource } = require("../utils/authorization");

// Real, scaling resource cost per level — this is the implementation that
// was missing entirely before: there was no way to ever increment city_level,
// which made the "Build a Level 10 City" mission permanently unwinnable.
function upgradeCost(currentLevel) {
  const base = 100;
  return {
    wood: base * (currentLevel + 1),
    stone: Math.floor(base * 0.7) * (currentLevel + 1),
    gold: Math.floor(base * 0.5) * (currentLevel + 1),
  };
}

async function getPlayerCities(playerId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":sk": "CITY#" },
    })
  );
  return result.Items || [];
}

async function foundCity(playerId, { name, x, y }) {
  const existing = await getPlayerCities(playerId);
  const cityId = uuid();
  const item = {
    ...Keys.city(playerId, cityId),
    entityType: "CITY",
    cityId,
    playerId,
    name: name || `${existing.length === 0 ? "Capital" : "Settlement"} ${existing.length + 1}`,
    level: 1,
    x, y,
    createdAt: Date.now(),
    GSI1PK: `PLAYER#${playerId}`,
    GSI1SK: `CITY#${cityId}`,
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item, ConditionExpression: "attribute_not_exists(PK) OR attribute_not_exists(SK)" }));
  return item;
}

/**
 * Real upgrade: deducts actual resources (failing honestly if the player
 * can't afford it) and increments the real persisted level field that
 * Mission.js's "city_level" mission type checks against. This is the
 * concrete fix for the previously-unwinnable mission.
 */
async function upgradeCity(playerId, cityId) {
  const cityResult = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.city(playerId, cityId) }));
  const city = cityResult.Item;
  if (!city) throw httpError(404, "City not found");
  assertOwnsResource(city.playerId, playerId, "city");

  const cost = upgradeCost(city.level);

  for (const [resourceType, amount] of Object.entries(cost)) {
    const resResult = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.resource(playerId, resourceType) }));
    if ((resResult.Item?.amount || 0) < amount) {
      throw httpError(400, `Not enough ${resourceType} to upgrade (need ${amount})`);
    }
  }

  for (const [resourceType, amount] of Object.entries(cost)) {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.resource(playerId, resourceType),
        UpdateExpression: "SET amount = amount - :a",
        ExpressionAttributeValues: { ":a": amount },
      })
    );
  }

  const newLevel = city.level + 1;
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.city(playerId, cityId),
      UpdateExpression: "SET #lvl = :l",
      ExpressionAttributeNames: { "#lvl": "level" },
      ExpressionAttributeValues: { ":l": newLevel },
    })
  );

  return { ...city, level: newLevel, costPaid: cost };
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

module.exports = { foundCity, getPlayerCities, upgradeCity, upgradeCost };
