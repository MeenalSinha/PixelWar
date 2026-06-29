const { PutCommand, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");

const MISSION_DEFINITIONS = [
  { id: "capture_500_pixels", label: "Capture 500 Pixels", type: "pixels_claimed", target: 500 },
  { id: "build_level_10_city", label: "Build a Level 10 City", type: "city_level", target: 10 },
  { id: "win_3_battles", label: "Win 3 Battles", type: "battles_won", target: 3 },
  { id: "create_alliance", label: "Create an Alliance", type: "alliance_created", target: 1 },
  { id: "research_space_age", label: "Research Space Age", type: "tech_completed:space_age", target: 1 },
];

async function ensurePlayerMissions(playerId) {
  const existing = await getPlayerMissions(playerId);
  const existingIds = new Set(existing.map((m) => m.missionId));
  const toCreate = MISSION_DEFINITIONS.filter((m) => !existingIds.has(m.id));

  await Promise.all(
    toCreate.map((def) =>
      ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            ...Keys.mission(playerId, def.id),
            entityType: "MISSION",
            playerId,
            missionId: def.id,
            label: def.label,
            type: def.type,
            target: def.target,
            progress: 0,
            completed: false,
            createdAt: Date.now(),
          },
        })
      )
    )
  );
  return getPlayerMissions(playerId);
}

async function getPlayerMissions(playerId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":sk": "MISSION#" },
    })
  );
  return result.Items || [];
}

/**
 * Real progress tracking: called from controllers whenever a relevant action
 * happens (pixel claimed, battle won, alliance created, tech completed).
 * Increments matching incomplete missions and flags completion.
 */
async function incrementMissionProgress(playerId, type, amount = 1) {
  const missions = await ensurePlayerMissions(playerId);
  const newlyCompleted = [];

  for (const m of missions.filter((m) => m.type === type && !m.completed)) {
    const progress = Math.min(m.target, m.progress + amount);
    const completed = progress >= m.target;
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: m.PK, SK: m.SK },
        UpdateExpression: "SET progress = :p, completed = :c",
        ExpressionAttributeValues: { ":p": progress, ":c": completed },
      })
    );
    if (completed) newlyCompleted.push({ ...m, progress, completed: true });
  }
  return newlyCompleted;
}

module.exports = { MISSION_DEFINITIONS, ensurePlayerMissions, getPlayerMissions, incrementMissionProgress };
