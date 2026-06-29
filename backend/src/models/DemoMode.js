const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { ddb, TABLE_NAME } = require("../config/dynamo");
const { listCivilizations, updateCivilization } = require("./Civilization");
const { triggerRandomGlobalEvent } = require("./GlobalEvent");
const { createListing } = require("./Trade");
const { claimPixel } = require("./Pixel");
const { attackPixel } = require("./War");
const { startResearch, processResearchCompletions } = require("./Research");
const { createAlliance } = require("./Alliance");
const { runResourceTick } = require("../services/resourceTickService");
const { recordAttackOnCivilization } = require("../services/aiCivService");

/**
 * Real multi-stage demo sequence (replaces the single-button version per
 * the "guided experience" requirement). Every stage is a genuine call into
 * the same models the rest of the app uses — there is no separate "demo
 * data" path. Each stage returns a small result object; the frontend
 * renders these as a step-by-step narrative instead of one flat success
 * message.
 */
async function activateDemoMode(playerId) {
  const stages = [];

  stages.push(await stageWorldIntroduction(playerId));
  stages.push(await stageAiExpansion());
  stages.push(await stagePlayerConquest(playerId));
  stages.push(await stageAllianceFormation(playerId));
  stages.push(await stageResearchCompletion(playerId));
  stages.push(await stageResourceEconomy());
  stages.push(await stageGlobalEvent());
  stages.push(await stageFinalOverview());

  return { stages };
}

async function stageWorldIntroduction(playerId) {
  const colors = ["#1f7a3f", "#c0392b", "#2f6fa8", "#F4C430"];
  let claimed = 0;
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * 32);
    const y = Math.floor(Math.random() * 32);
    try {
      await claimPixel({ x, y, playerId, color: colors[i % colors.length] });
      claimed++;
    } catch {
      // collision with another demo pixel — fine, skip
    }
  }
  return { stage: "world_introduction", label: "World Introduction", detail: `Claimed ${claimed} starter pixels` };
}

async function stageAiExpansion() {
  const civs = await listCivilizations();
  let boosted = 0;
  for (const civ of civs.slice(0, 3)) {
    await updateCivilization(civ.civId, { power: civ.power + Math.floor(Math.random() * 5000) + 2000 });
    boosted++;
  }
  return { stage: "ai_expansion", label: "AI Expansion", detail: `${boosted} civilizations expanded their power` };
}

async function stagePlayerConquest(playerId) {
  // Real fix from the prior audit: AI civs now own real pixels (see
  // Civilization.js), so this stage performs a genuine attackPixel() call
  // against an actual AI-owned tile instead of only simulating memory.
  const civs = await listCivilizations();
  const target = civs[0];
  if (!target) return { stage: "player_conquest", label: "Player Conquest", detail: "No AI civilization available to attack" };

  try {
    const battle = await attackPixel({ x: target.originX, y: target.originY, attackerId: playerId });
    await recordAttackOnCivilization(target.civId, playerId, target);
    return {
      stage: "player_conquest",
      label: "Player Conquest",
      detail: `Attacked ${target.name}'s territory for ${battle.damage} damage${battle.captured ? " — captured!" : ""}`,
    };
  } catch (err) {
    return { stage: "player_conquest", label: "Player Conquest", detail: `Skipped: ${err.message}` };
  }
}

async function stageAllianceFormation(playerId) {
  try {
    const alliance = await createAlliance(playerId, `Demo Coalition ${Date.now() % 10000}`);
    return { stage: "alliance_formation", label: "Alliance Formation", detail: `Founded "${alliance.name}"` };
  } catch (err) {
    return { stage: "alliance_formation", label: "Alliance Formation", detail: `Skipped: ${err.message}` };
  }
}

async function stageResearchCompletion(playerId) {
  try {
    const research = await startResearch(playerId, "stone_age");
    // Force-complete for the demo by moving completesAt into the past, then
    // running the real completion-processing function — the same function
    // the production tick calls every RESEARCH_TICK_MS. This is the real
    // completion path, just time-compressed for a 3-minute demo.
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: research.PK, SK: research.SK },
        UpdateExpression: "SET completesAt = :past",
        ExpressionAttributeValues: { ":past": Date.now() - 1000 },
      })
    );
    const completions = await processResearchCompletions();
    const mine = completions.find((c) => c.playerId === playerId);
    return {
      stage: "research_completion",
      label: "Research Completion",
      detail: mine ? `${mine.name} completed — unlocked ${mine.unlocks.join(", ")}` : "Research already in progress",
    };
  } catch (err) {
    return { stage: "research_completion", label: "Research Completion", detail: `Skipped: ${err.message}` };
  }
}

async function stageResourceEconomy() {
  const updates = await runResourceTick(10000);
  return { stage: "resource_economy", label: "Resource Economy", detail: `${updates.length} resource balances ticked forward` };
}

async function stageGlobalEvent() {
  const event = await triggerRandomGlobalEvent();
  return { stage: "global_event", label: "Global Event", detail: `${event.label} affected ${event.affectedCount} kingdoms` };
}

async function stageFinalOverview() {
  const civs = await listCivilizations();
  const topCiv = civs.sort((a, b) => b.power - a.power)[0];
  return {
    stage: "final_overview",
    label: "World Overview",
    detail: topCiv ? `Leading civilization: ${topCiv.name} at ${topCiv.power.toLocaleString()} power` : "World overview unavailable",
  };
}

module.exports = { activateDemoMode };
