const { QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { getRegisteredPlayerIds } = require("../models/Player");

/**
 * Runs every RESOURCE_TICK_MS.
 *
 * Audit fix: this previously did a full-table Scan filtered to entityType
 * RESOURCE, which degrades badly as the table fills with pixels/chat/events
 * (the dominant item types at scale). It now does one Get against a player
 * registry, then one targeted Query per player (PK=PLAYER#id, SK begins_with
 * RESOURCE#) — cost scales with player count, not total table size.
 *
 * Remaining honest limitation: this is still O(players) sequential Query
 * calls inside a single Node process. At real scale (the brief's "millions
 * of players") this tick would be sharded across multiple EventBridge-
 * scheduled Lambda invocations, each handling a slice of player IDs — see
 * docs/ARCHITECTURE.md. That migration is not done here; this fix makes the
 * *current* implementation honestly scale with the right variable, it does
 * not make it infinitely scalable.
 */
async function runResourceTick(intervalMs) {
  const playerIds = await getRegisteredPlayerIds();
  const updates = [];

  await Promise.all(
    playerIds.map(async (playerId) => {
      const result = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":sk": "RESOURCE#" },
        })
      );

      for (const item of result.Items || []) {
        const gain = Math.round((item.ratePerHour / 3600000) * intervalMs);
        if (gain <= 0) continue;
        const newAmount = item.amount + gain;

        await ddb.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK },
            UpdateExpression: "SET amount = :a, updatedAt = :u",
            ExpressionAttributeValues: { ":a": newAmount, ":u": Date.now() },
          })
        );

        updates.push({ playerId: item.playerId, resourceType: item.resourceType, amount: newAmount, gain });
      }
    })
  );

  return updates;
}

module.exports = { runResourceTick };
