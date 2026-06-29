const { v4: uuid } = require("uuid");
const { PutCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");

const EVENT_TYPES = [
  { type: "meteor_strike", label: "Meteor Strike", effect: "damage" },
  { type: "flood", label: "Flood", effect: "damage" },
  { type: "earthquake", label: "Earthquake", effect: "damage" },
  { type: "wildfire", label: "Wildfire", effect: "damage" },
  { type: "volcano", label: "Volcanic Eruption", effect: "damage" },
  { type: "pandemic", label: "Pandemic", effect: "population_loss" },
  { type: "economic_boom", label: "Economic Boom", effect: "resource_gain" },
  { type: "solar_storm", label: "Solar Storm", effect: "energy_loss" },
];

/**
 * Real disaster tick: picks one random event, applies a real persisted
 * effect to a random sample of players' resources, and records the event.
 * Called on an interval from server.js (see GLOBAL_EVENT_TICK_MS).
 */
async function triggerRandomGlobalEvent() {
  const def = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const eventId = uuid();
  const now = Date.now();

  const affectedCount = await applyEffect(def);

  const item = {
    PK: `EVENT#${new Date(now).toISOString().slice(0, 10)}`,
    SK: `EVENT#${now}#${eventId}`,
    entityType: "EVENT",
    eventId,
    type: def.type,
    label: def.label,
    effect: def.effect,
    affectedCount,
    timestamp: now,
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function applyEffect(def) {
  const result = await ddb.send(
    new ScanCommand({ TableName: TABLE_NAME, FilterExpression: "entityType = :t", ExpressionAttributeValues: { ":t": "RESOURCE" } })
  );
  const resources = result.Items || [];
  // Affect a random ~20% sample of resource rows, not the whole table —
  // disasters/booms are localized, not universal.
  const sample = resources.filter(() => Math.random() < 0.2);

  for (const r of sample) {
    let delta = 0;
    if (def.effect === "damage" || def.effect === "population_loss") delta = -Math.floor(r.amount * 0.15);
    if (def.effect === "resource_gain") delta = Math.floor(r.amount * 0.2) + 50;
    if (def.effect === "energy_loss" && r.resourceType === "energy") delta = -Math.floor(r.amount * 0.3);
    if (delta === 0) continue;

    const newAmount = Math.max(0, r.amount + delta);
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: r.PK, SK: r.SK },
        UpdateExpression: "SET amount = :a",
        ExpressionAttributeValues: { ":a": newAmount },
      })
    );
  }
  return sample.length;
}

module.exports = { triggerRandomGlobalEvent, EVENT_TYPES };
