const { v4: uuid } = require("uuid");
const { PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");

async function postMessage({ playerId, username, scope, allianceId, text }) {
  if (!text?.trim()) throw Object.assign(new Error("Message cannot be empty"), { status: 400 });
  const messageId = uuid();
  const now = Date.now();
  const channel = scope === "alliance" ? `CHAT#ALLIANCE#${allianceId}` : "CHAT#GLOBAL";

  const item = {
    PK: channel,
    SK: `MSG#${now}#${messageId}`,
    entityType: "CHAT",
    messageId,
    playerId,
    username,
    scope,
    allianceId: allianceId || null,
    text: text.slice(0, 500),
    timestamp: now,
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function getRecentMessages({ scope, allianceId, limit = 50 }) {
  const channel = scope === "alliance" ? `CHAT#ALLIANCE#${allianceId}` : "CHAT#GLOBAL";
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": channel },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items || []).reverse();
}

module.exports = { postMessage, getRecentMessages };
