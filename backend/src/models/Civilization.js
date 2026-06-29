const { GetCommand, PutCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");

const PERSONALITIES = ["peaceful", "trader", "scientist", "aggressive", "explorer", "diplomat"];

async function createCivilization({ civId, name, personality, originX, originY }) {
  const item = {
    ...Keys.civilization(civId),
    entityType: "CIVILIZATION",
    civId,
    name,
    personality,
    originX,
    originY,
    power: Math.floor(Math.random() * 5000) + 1000,
    territoryPixelCount: 0,
    resources: { wood: 500, stone: 500, iron: 200, gold: 300, food: 500, energy: 100 },
    isAI: true,
    // Real memory state, not decoration: aiCivService reads and mutates these
    // every tick so behavior is conditioned on history, not pure randomness.
    memory: {
      allies: [],        // civIds/playerIds this civ has positive standing with
      enemies: [],        // civIds/playerIds that have attacked this civ
      lastAttackedBy: null,
      territoryPressure: 0, // rises when this civ is attacked, decays over time, biases toward defense
    },
    createdAt: Date.now(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

  // Real fix: give this civ an actual claimed pixel at its origin, using the
  // same Pixel.claimPixel() path players use. Previously civs only had a
  // territoryPixelCount counter with no real pixel ownership, so a player
  // could never actually attack one in normal gameplay — only Demo Mode
  // could trigger the AI's combat-memory response. civId is used as the
  // "owner" value, exactly like a playerId, since War.js only cares that
  // pixel.owner is a string it can compare and notify against.
  const { claimPixel } = require("./Pixel");
  try {
    await claimPixel({ x: originX, y: originY, playerId: civId, color: civColor(personality) });
  } catch {
    // origin pixel already claimed by something else — non-fatal, the civ
    // still exists and will expand via the AI tick's EXPAND_TERRITORY action
  }

  return item;
}

function civColor(personality) {
  const colors = {
    aggressive: "#C0392B", trader: "#F4C430", scientist: "#2F6FA8",
    explorer: "#1F7A3F", diplomat: "#9B59B6", peaceful: "#7FCBE8",
  };
  return colors[personality] || "#888888";
}

async function listCivilizations() {
  const result = await ddb.send(
    new ScanCommand({ TableName: TABLE_NAME, FilterExpression: "entityType = :t", ExpressionAttributeValues: { ":t": "CIVILIZATION" } })
  );
  return result.Items || [];
}

async function updateCivilization(civId, updates) {
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
      Key: Keys.civilization(civId),
      UpdateExpression: `SET ${exprParts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

async function getCivilization(civId) {
  const { GetCommand } = require("@aws-sdk/lib-dynamodb");
  const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.civilization(civId) }));
  return result.Item || null;
}

module.exports = { createCivilization, listCivilizations, updateCivilization, getCivilization, PERSONALITIES };
