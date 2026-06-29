const { v4: uuid } = require("uuid");
const { PutCommand, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys, chunkId } = require("../db/keys");
const { getPixel } = require("./Pixel");
const { COMBAT } = require("../config/gameConfig");
const { assertNotSelf } = require("../utils/authorization");

/**
 * Real combat resolution with a real resource cost (audit fix: combat was
 * previously free and risk-free for the attacker). Walls absorb 50% of
 * incoming damage. If health reaches 0, ownership clears so the attacker —
 * or anyone — can claim it on a subsequent placement.
 */
async function attackPixel({ x, y, attackerId }) {
  const pixel = await getPixel(x, y);
  if (!pixel.owner) throw httpError(400, "Pixel is unclaimed — nothing to attack");
  assertNotSelf(pixel.owner, attackerId, "attack your own pixel");

  // Real resource cost: attacking spends energy, so it's a decision with
  // stakes rather than a free action.
  const energyKey = Keys.resource(attackerId, "energy");
  const energyItem = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: energyKey }));
  const energy = energyItem.Item?.amount || 0;
  if (energy < COMBAT.ATTACK_ENERGY_COST) {
    throw httpError(400, `Not enough energy to attack (need ${COMBAT.ATTACK_ENERGY_COST}, have ${energy})`);
  }
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: energyKey,
      UpdateExpression: "SET amount = amount - :c",
      ExpressionAttributeValues: { ":c": COMBAT.ATTACK_ENERGY_COST },
    })
  );

  const baseDamage = Math.floor(Math.random() * COMBAT.MAX_BONUS_DAMAGE) + COMBAT.MIN_DAMAGE;
  const damage = pixel.building === "Wall" ? Math.floor(baseDamage * COMBAT.WALL_MITIGATION) : baseDamage;
  const newHealth = Math.max(0, (pixel.health ?? 100) - damage);
  const captured = newHealth === 0;

  const cId = chunkId(x, y);
  const sk = `PIXEL#${String(x).padStart(5, "0")}#${String(y).padStart(5, "0")}`;

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PIXEL#${cId}`, SK: sk },
      UpdateExpression: captured
        ? "SET health = :h, #o = :nullOwner, version = version + :one"
        : "SET health = :h, version = version + :one",
      ExpressionAttributeNames: captured ? { "#o": "owner" } : undefined,
      ExpressionAttributeValues: captured
        ? { ":h": newHealth, ":nullOwner": null, ":one": 1 }
        : { ":h": newHealth, ":one": 1 },
    })
  );

  const battleId = uuid();
  const battleRecord = {
    PK: `BATTLE#${cId}`,
    SK: `BATTLE#${Date.now()}#${battleId}`,
    entityType: "WAR",
    battleId,
    attackerId,
    defenderId: pixel.owner,
    x, y, damage, newHealth, captured,
    energySpent: COMBAT.ATTACK_ENERGY_COST,
    timestamp: Date.now(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: battleRecord }));

  return { ...battleRecord };
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

module.exports = { attackPixel };
