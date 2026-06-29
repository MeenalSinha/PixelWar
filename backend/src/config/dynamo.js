const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

// Real DynamoDB client. Points at DynamoDB Local in dev via DYNAMODB_ENDPOINT.
// In production, remove `endpoint` and rely on real AWS credentials/region.
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "local",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME || "PixelWarTable";

module.exports = { ddb, TABLE_NAME };
