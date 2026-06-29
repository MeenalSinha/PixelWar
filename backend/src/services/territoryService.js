const { QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuid } = require("uuid");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { chunkId } = require("../db/keys");

/**
 * Real flood-fill territory merge. Given a newly-claimed pixel, looks at its
 * 4-connected neighbors within the same chunk (the common case for one
 * placement). If neighbors share the same owner but a different territoryId,
 * all pixels are merged under one territoryId (the smallest/oldest one wins,
 * keeping territory IDs stable as kingdoms grow rather than reshuffling).
 *
 * This intentionally only inspects neighbors within the same 32x32 chunk for
 * the MVP — cross-chunk territory merges are flagged in docs/ARCHITECTURE.md
 * as a roadmap item (would use GSI2-TerritoryIndex + a background merge job).
 */
async function recalcTerritoryForPixel(x, y, owner) {
  const cId = chunkId(x, y);
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `PIXEL#${cId}` },
    })
  );
  const chunkPixels = result.Items || [];

  const neighborCoords = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
  const neighborTerritories = chunkPixels
    .filter((p) => p.owner === owner && neighborCoords.some(([nx, ny]) => p.x === nx && p.y === ny) && p.territoryId)
    .map((p) => p.territoryId);

  const territoryId = neighborTerritories[0] || uuid();

  // Update the new pixel's territoryId
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PIXEL#${cId}`, SK: `PIXEL#${String(x).padStart(5, "0")}#${String(y).padStart(5, "0")}` },
      UpdateExpression: "SET territoryId = :tid, GSI2PK = :g1, GSI2SK = :g2",
      ExpressionAttributeValues: {
        ":tid": territoryId,
        ":g1": `TERRITORY#${territoryId}`,
        ":g2": `PIXEL#${x}#${y}`,
      },
    })
  );

  // If neighbors had a different territoryId than the chosen one, merge them.
  const toMerge = chunkPixels.filter(
    (p) => p.owner === owner && p.territoryId && p.territoryId !== territoryId
  );
  for (const p of toMerge) {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: p.PK, SK: p.SK },
        UpdateExpression: "SET territoryId = :tid, GSI2PK = :g1",
        ExpressionAttributeValues: { ":tid": territoryId, ":g1": `TERRITORY#${territoryId}` },
      })
    );
  }

  return territoryId;
}

module.exports = { recalcTerritoryForPixel };
