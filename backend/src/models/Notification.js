const { v4: uuid } = require("uuid");
const { PutCommand, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");

async function createNotification(playerId, { type, message }) {
  const id = uuid();
  const now = Date.now();
  const item = {
    PK: `PLAYER#${playerId}`,
    SK: `NOTIFICATION#${now}#${id}`,
    entityType: "NOTIFICATION",
    notificationId: id,
    playerId,
    type,
    message,
    read: false,
    timestamp: now,
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function getNotifications(playerId, limit = 30) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":sk": "NOTIFICATION#" },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return result.Items || [];
}

async function markRead(playerId, notificationId, sk) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PLAYER#${playerId}`, SK: sk },
      UpdateExpression: "SET #r = :true",
      ExpressionAttributeNames: { "#r": "read" },
      ExpressionAttributeValues: { ":true": true },
    })
  );
}

module.exports = { createNotification, getNotifications, markRead };
