const { GetCommand, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys, chunkId } = require("../db/keys");

const BIOMES = ["forest", "desert", "ocean", "mountain", "snow", "swamp", "plains", "volcano", "river"];

function biomeForCoord(x, y, seed = 1337) {
  // Deterministic pseudo-biome so the same world looks the same across restarts.
  const h = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1;
  return BIOMES[Math.floor(h * BIOMES.length)];
}

async function getPixel(x, y) {
  const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.pixel(x, y) }));
  if (result.Item) return result.Item;
  // Lazily-generated unclaimed pixel (not persisted until first write)
  return {
    x, y, owner: null, color: null, biome: biomeForCoord(x, y),
    building: null, health: 100, version: 0, territoryId: null,
  };
}

async function getChunk(chunkX, chunkY) {
  const pk = `PIXEL#${chunkX}_${chunkY}`;
  const result = await ddb.send(
    new QueryCommand({ TableName: TABLE_NAME, KeyConditionExpression: "PK = :pk", ExpressionAttributeValues: { ":pk": pk } })
  );
  return result.Items || [];
}

async function claimPixel({ x, y, playerId, color, expectedVersion }) {
  const existing = await getPixel(x, y);
  const newVersion = (existing.version || 0) + 1;

  if (expectedVersion !== undefined && existing.version !== expectedVersion) {
    throw new ConflictError("Pixel was modified by another player. Refresh and retry.");
  }

  const item = {
    ...Keys.pixel(x, y),
    entityType: "PIXEL",
    x, y,
    owner: playerId,
    color,
    biome: existing.biome || biomeForCoord(x, y),
    building: existing.building || null,
    resource: existing.resource || null,
    health: 100,
    version: newVersion,
    territoryId: existing.territoryId || null,
    updatedAt: Date.now(),
    GSI1PK: `PLAYER#${playerId}`,
    GSI1SK: `PIXEL#${x}#${y}`,
  };

  // Optimistic locking: only write if version matches what we read (prevents lost updates
  // when two players claim the same pixel at the same instant).
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: existing.version
        ? "version = :expected"
        : "attribute_not_exists(PK)",
      ExpressionAttributeValues: existing.version ? { ":expected": existing.version } : undefined,
    })
  );

  return item;
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

module.exports = { getPixel, getChunk, claimPixel, biomeForCoord, BIOMES, ConflictError, chunkId };
