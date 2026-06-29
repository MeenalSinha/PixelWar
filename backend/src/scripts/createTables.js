/**
 * Creates the single PixelWarTable with two GSIs against DynamoDB Local
 * (or real AWS, if endpoint is removed from env). Idempotent: skips if
 * the table already exists.
 */
require("dotenv").config();
const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "local",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

const TABLE_NAME = process.env.TABLE_NAME || "PixelWarTable";

async function main() {
  const { TableNames } = await client.send(new ListTablesCommand({}));
  if (TableNames.includes(TABLE_NAME)) {
    console.log(`Table ${TABLE_NAME} already exists. Skipping.`);
    return;
  }

  const params = {
    TableName: TABLE_NAME,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" },
      { AttributeName: "GSI2PK", AttributeType: "S" },
      { AttributeName: "GSI2SK", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" },
      { AttributeName: "SK", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1-PlayerIndex",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "GSI2-TerritoryIndex",
        KeySchema: [
          { AttributeName: "GSI2PK", KeyType: "HASH" },
          { AttributeName: "GSI2SK", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  };

  await client.send(new CreateTableCommand(params));
  console.log(`Created table ${TABLE_NAME} with GSI1-PlayerIndex and GSI2-TerritoryIndex.`);
}

main().catch((err) => {
  console.error("Failed to create table:", err);
  process.exit(1);
});
