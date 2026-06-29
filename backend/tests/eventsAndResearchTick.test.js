process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");
const { triggerRandomGlobalEvent, EVENT_TYPES } = require("../src/models/GlobalEvent");
const { startResearch, processResearchCompletions } = require("../src/models/Research");

const app = createApp();

async function registerPlayer(suffix) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: `scientist${suffix}`, email: `scientist-${suffix}-${Date.now()}@pixelwar.dev`, password: "testpass123" });
  return res.body.player.playerId;
}

describe("Global events (real tick logic, not just the route)", () => {
  it("triggers a real event from the defined EVENT_TYPES list and persists it", async () => {
    const event = await triggerRandomGlobalEvent();
    expect(EVENT_TYPES.map((e) => e.type)).toContain(event.type);
    expect(typeof event.affectedCount).toBe("number");
    expect(event.timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe("Research completion tick (real tick logic, not just the route)", () => {
  it("does not mark research complete before its timer elapses", async () => {
    const playerId = await registerPlayer("a");
    await startResearch(playerId, "stone_age"); // durationMs is 30000 per Research.js — won't complete instantly

    const completions = await processResearchCompletions();
    const thisPlayersCompletion = completions.find((c) => c.playerId === playerId);
    expect(thisPlayersCompletion).toBeUndefined();
  });

  it("marks research complete once completesAt has passed", async () => {
    const playerId = await registerPlayer("b");
    const research = await startResearch(playerId, "stone_age");

    // Real test of the tick's time-comparison logic: directly manipulate
    // completesAt to simulate elapsed time rather than waiting 30 real
    // seconds, then verify the tick function actually flips status.
    const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
    const { ddb, TABLE_NAME } = require("../src/config/dynamo");
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: research.PK, SK: research.SK },
        UpdateExpression: "SET completesAt = :past",
        ExpressionAttributeValues: { ":past": Date.now() - 1000 },
      })
    );

    const completions = await processResearchCompletions();
    const thisPlayersCompletion = completions.find((c) => c.playerId === playerId);
    expect(thisPlayersCompletion).toBeDefined();
    expect(thisPlayersCompletion.status).toBe("completed");
  });
});
