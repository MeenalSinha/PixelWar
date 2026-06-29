const { v4: uuid } = require("uuid");
const { GetCommand, PutCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { Keys } = require("../db/keys");

async function createAlliance(playerId, name) {
  const allianceId = uuid();
  const item = {
    ...Keys.alliance(allianceId),
    entityType: "ALLIANCE",
    allianceId,
    name,
    leaderId: playerId,
    memberIds: [playerId],
    resources: { wood: 0, stone: 0, iron: 0, gold: 0, food: 0, energy: 0 },
    power: 0,
    createdAt: Date.now(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item, ConditionExpression: "attribute_not_exists(PK)" }));
  return item;
}

async function getAlliance(allianceId) {
  const result = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: Keys.alliance(allianceId) }));
  return result.Item || null;
}

async function listAlliances() {
  const result = await ddb.send(
    new ScanCommand({ TableName: TABLE_NAME, FilterExpression: "entityType = :t", ExpressionAttributeValues: { ":t": "ALLIANCE" } })
  );
  return (result.Items || []).sort((a, b) => b.power - a.power);
}

async function joinAlliance(allianceId, playerId) {
  const alliance = await getAlliance(allianceId);
  if (!alliance) throw Object.assign(new Error("Alliance not found"), { status: 404 });
  if (alliance.memberIds.includes(playerId)) throw Object.assign(new Error("Already a member"), { status: 400 });

  const memberIds = [...alliance.memberIds, playerId];
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.alliance(allianceId),
      UpdateExpression: "SET memberIds = :m",
      ExpressionAttributeValues: { ":m": memberIds },
    })
  );
  return { ...alliance, memberIds };
}

async function contributeResources(allianceId, type, amount) {
  const alliance = await getAlliance(allianceId);
  if (!alliance) throw Object.assign(new Error("Alliance not found"), { status: 404 });
  const resources = { ...alliance.resources, [type]: (alliance.resources[type] || 0) + amount };
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.alliance(allianceId),
      UpdateExpression: "SET resources = :r",
      ExpressionAttributeValues: { ":r": resources },
    })
  );
  return resources;
}

module.exports = { createAlliance, getAlliance, listAlliances, joinAlliance, contributeResources };
