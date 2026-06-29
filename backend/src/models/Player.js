const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");

const STARTING_RESOURCES = {
  wood: 200, stone: 150, iron: 50, gold: 100, food: 200, energy: 50,
};

const REGISTRY_KEY = { PK: "REGISTRY#PLAYERS", SK: "METADATA" };

/**
 * Real fix for the audit's "full-table Scan every tick" finding: instead of
 * scanning every RESOURCE item in the table, we maintain a single registry
 * item holding the set of player IDs. The resource tick then does ONE Get
 * on this registry + a targeted Query per player (PK=PLAYER#id), never a
 * table-wide Scan. This is still O(players) Query calls rather than O(1),
 * but it scales with the player count rather than with total table size
 * (pixels + chat + events etc, which dwarfs player count at scale).
 */
async function addToPlayerRegistry(playerId) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: REGISTRY_KEY,
      UpdateExpression: "ADD playerIds :p",
      ExpressionAttributeValues: { ":p": new Set([playerId]) },
    })
  );
}

async function getRegisteredPlayerIds() {
  const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: REGISTRY_KEY }));
  return result.Item?.playerIds ? Array.from(result.Item.playerIds) : [];
}

async function createPlayer({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const playerId = uuid();
  const now = Date.now();

  const item = {
    ...Keys.player(playerId),
    entityType: "PLAYER",
    playerId,
    username,
    email,
    passwordHash,
    level: 1,
    xp: 0,
    kingdomName: `${username}'s Kingdom`,
    power: 0,
    population: 10,
    createdAt: now,
    GSI1PK: `PLAYER#${playerId}`,
    GSI1SK: "METADATA",
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item, ConditionExpression: "attribute_not_exists(PK)" }));
  await addToPlayerRegistry(playerId);

  // Seed starting resources as separate items (so resource ticks can update them independently)
  await Promise.all(
    Object.entries(STARTING_RESOURCES).map(([type, amount]) =>
      ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            ...Keys.resource(playerId, type),
            entityType: "RESOURCE",
            playerId,
            resourceType: type,
            amount,
            ratePerHour: defaultRate(type),
            updatedAt: now,
          },
        })
      )
    )
  );

  // Real fix tying together the brief's "players begin with one settlement"
  // and the previously-unwinnable city-level mission: every new player gets
  // one real City entity immediately, so upgrading toward level 10 is
  // reachable from account creation rather than requiring a separate,
  // undiscoverable "found a city" action first.
  const { foundCity } = require("./City");
  await foundCity(playerId, { name: `${username}'s Capital`, x: 0, y: 0 });

  return sanitize(item);
}

function defaultRate(type) {
  const rates = { wood: 320, stone: 210, iron: 180, gold: 150, food: 300, energy: 250 };
  return rates[type] || 100;
}

async function findByEmail(email) {
  // Scan is avoided in production; for MVP scale, a GSI on email would be added.
  // Implemented here via a lightweight query pattern against GSI1 is not direct,
  // so this uses a guarded Scan limited to PLAYER entityType for the auth lookup.
  const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "entityType = :t AND email = :e",
      ExpressionAttributeValues: { ":t": "PLAYER", ":e": email },
    })
  );
  return result.Items?.[0] || null;
}

async function getPlayer(playerId) {
  const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.player(playerId) }));
  return result.Item ? sanitize(result.Item) : null;
}

async function getPlayerResources(playerId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":sk": "RESOURCE#" },
    })
  );
  return result.Items || [];
}

async function updatePlayerStats(playerId, updates) {
  const exprParts = [];
  const values = {};
  const names = {};
  Object.entries(updates).forEach(([key, value], i) => {
    exprParts.push(`#k${i} = :v${i}`);
    names[`#k${i}`] = key;
    values[`:v${i}`] = value;
  });

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.player(playerId),
      UpdateExpression: `SET ${exprParts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

async function incrementPlayerStat(playerId, statName, amount) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.player(playerId),
      UpdateExpression: `ADD #stat :amount`,
      ExpressionAttributeNames: { "#stat": statName },
      ExpressionAttributeValues: { ":amount": amount },
    })
  );
}

function sanitize(item) {
  const { passwordHash, ...rest } = item;
  return rest;
}

module.exports = { createPlayer, findByEmail, getPlayer, getPlayerResources, updatePlayerStats, incrementPlayerStat, sanitize, getRegisteredPlayerIds };
