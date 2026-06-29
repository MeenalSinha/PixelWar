const { GetCommand, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");

// Real tech tree: ordered ages, each with a duration and the buildings it unlocks.
// Order matters - players must complete age N before starting age N+1.
const TECH_TREE = [
  { id: "stone_age", name: "Stone Age", durationMs: 30000, unlocks: ["House", "Farm"] },
  { id: "bronze_age", name: "Bronze Age", durationMs: 60000, unlocks: ["Mine", "Wall"] },
  { id: "iron_age", name: "Iron Age", durationMs: 90000, unlocks: ["Watchtower", "Castle"] },
  { id: "industrial_age", name: "Industrial Age", durationMs: 120000, unlocks: ["Factory", "Power Plant"] },
  { id: "modern_age", name: "Modern Age", durationMs: 150000, unlocks: ["Laboratory", "Hospital", "Marketplace"] },
  { id: "digital_age", name: "Digital Age", durationMs: 180000, unlocks: ["Airport", "Military Base"] },
  { id: "space_age", name: "Space Age", durationMs: 240000, unlocks: ["Space Port"] },
];

function techIndex(techId) {
  return TECH_TREE.findIndex((t) => t.id === techId);
}

async function getPlayerResearch(playerId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":sk": "RESEARCH#" },
    })
  );
  return result.Items || [];
}

async function startResearch(playerId, techId) {
  const idx = techIndex(techId);
  if (idx === -1) throw new GameError(404, "Unknown technology");

  const existing = await getPlayerResearch(playerId);
  const completed = new Set(existing.filter((r) => r.status === "completed").map((r) => r.techId));
  const inProgress = existing.find((r) => r.status === "in_progress");

  if (inProgress) throw new GameError(400, "Another research is already in progress");
  if (idx > 0 && !completed.has(TECH_TREE[idx - 1].id)) {
    throw new GameError(400, `Must complete ${TECH_TREE[idx - 1].name} first`);
  }
  if (completed.has(techId)) throw new GameError(400, "Already researched");

  const tech = TECH_TREE[idx];
  const now = Date.now();
  const item = {
    ...Keys.research(playerId, techId),
    entityType: "RESEARCH",
    playerId,
    techId,
    name: tech.name,
    status: "in_progress",
    startedAt: now,
    completesAt: now + tech.durationMs,
    unlocks: tech.unlocks,
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

// Called by the research tick (server.js interval) — flips any research whose
// completesAt has passed into "completed" and returns the list of completions
// so callers can broadcast + fire notifications + unlock buildings.
async function processResearchCompletions() {
  const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "entityType = :t AND #s = :s AND completesAt <= :now",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":t": "RESEARCH", ":s": "in_progress", ":now": Date.now() },
    })
  );
  const completions = [];
  for (const item of result.Items || []) {
    await ddb.send(
      new PutCommand({ TableName: TABLE_NAME, Item: { ...item, status: "completed" } })
    );
    completions.push(item);
  }
  return completions;
}

class GameError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { TECH_TREE, getPlayerResearch, startResearch, processResearchCompletions, GameError };
