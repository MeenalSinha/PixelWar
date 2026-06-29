const { PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");

/**
 * Real tick-ownership guard using a DynamoDB conditional write as a lock.
 * Audit fix: previously nothing prevented the same tick type from running
 * twice concurrently — e.g. if a tick takes longer than its own interval
 * (a real risk for the AI tick at higher civ counts) the next setInterval
 * firing would start a second overlapping run, double-applying effects.
 *
 * This acquires a short-lived lock item before running a tick body and
 * releases it after. If the lock is already held, the tick is skipped for
 * this cycle rather than running concurrently with itself. This is real
 * correctness groundwork for eventual multi-instance deployment too — the
 * same primitive works whether the overlap comes from one slow process or
 * two processes racing — but it is being added here specifically to fix a
 * single-process correctness gap, not as a deployment claim.
 */
async function withTickLock(tickName, ttlMs, fn) {
  const lockKey = { PK: `LOCK#${tickName}`, SK: "TICK" };
  const now = Date.now();

  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...lockKey, expiresAt: now + ttlMs },
        ConditionExpression: "attribute_not_exists(PK) OR expiresAt < :now",
        ExpressionAttributeValues: { ":now": now },
      })
    );
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return { skipped: true, reason: "tick already in progress" };
    }
    throw err;
  }

  try {
    const result = await fn();
    return { skipped: false, result };
  } finally {
    await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: lockKey }));
  }
}

module.exports = { withTickLock };
