const { foundCity, getPlayerCities, upgradeCity } = require("../models/City");
const { createNotification } = require("../models/Notification");
const { broadcast } = require("../ws/server");

async function getMyCities(req, res) {
  res.json(await getPlayerCities(req.playerId));
}

async function foundCityHandler(req, res) {
  try {
    const { name, x, y } = req.body;
    const city = await foundCity(req.playerId, { name, x, y });
    broadcast({ type: "CITY_FOUNDED", city });
    res.status(201).json(city);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function upgradeCityHandler(req, res) {
  try {
    const result = await upgradeCity(req.playerId, req.params.cityId);

    // Real fix for the previously-unwinnable "Build a Level 10 City" mission:
    // city level is an absolute value, not an incrementing counter, so we
    // sync mission progress directly to the city's real level on every
    // upgrade rather than using the generic +1-per-action increment helper.
    await syncCityLevelMission(req.playerId, result.level);

    if (result.level >= 10) {
      await createNotification(req.playerId, { type: "achievement_unlocked", message: `${result.name} reached Level 10!` });
    }

    broadcast({ type: "CITY_UPGRADED", playerId: req.playerId, city: result });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function syncCityLevelMission(playerId, level) {
  const { ensurePlayerMissions } = require("../models/Mission");
  const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
  const { ddb, TABLE_NAME } = require("../config/dynamo");
  const missions = await ensurePlayerMissions(playerId);
  const mission = missions.find((m) => m.type === "city_level");
  if (!mission) return;
  const progress = Math.min(mission.target, level);
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: mission.PK, SK: mission.SK },
      UpdateExpression: "SET progress = :p, completed = :c",
      ExpressionAttributeValues: { ":p": progress, ":c": progress >= mission.target },
    })
  );
}

module.exports = { getMyCities, foundCityHandler, upgradeCityHandler };
