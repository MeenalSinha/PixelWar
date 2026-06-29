require("dotenv").config();
const http = require("http");
const { createApp } = require("./app");
const { initWebSocketServer, broadcast } = require("./ws/server");
const { runResourceTick } = require("./services/resourceTickService");
const { runAiTick } = require("./services/aiCivService");
const { withTickLock } = require("./services/tickLockService");
const { processResearchCompletions } = require("./models/Research");
const { incrementMissionProgress } = require("./models/Mission");
const { createNotification } = require("./models/Notification");
const { triggerRandomGlobalEvent } = require("./models/GlobalEvent");

const app = createApp();
const server = http.createServer(app);
initWebSocketServer(server);

// Tick intervals — longer in dev to avoid DynamoDB Local lock contention.
// Production env would use shorter intervals (set via .env).
const RESOURCE_TICK_MS = parseInt(process.env.RESOURCE_TICK_MS || "30000", 10);
const AI_TICK_MS = parseInt(process.env.AI_TICK_MS || "45000", 10);
const RESEARCH_TICK_MS = parseInt(process.env.RESEARCH_TICK_MS || "15000", 10);
const GLOBAL_EVENT_TICK_MS = parseInt(process.env.GLOBAL_EVENT_TICK_MS || "120000", 10);

// Every tick now runs inside withTickLock(): a real DynamoDB conditional-write
// lock that skips a tick cycle rather than letting it overlap with a still-
// running previous cycle. This fixes a genuine single-process correctness
// gap (a slow tick body overlapping the next interval firing), independent
// of whether this process ever runs more than one instance.

setInterval(async () => {
  try {
    const { skipped, result } = await withTickLock("RESOURCE_TICK", RESOURCE_TICK_MS - 500, () => runResourceTick(RESOURCE_TICK_MS));
    if (!skipped && result?.length) broadcast({ type: "RESOURCE_TICK", updates: result });
  } catch (err) {
    console.error("Resource tick failed:", err.message);
  }
}, RESOURCE_TICK_MS);

setInterval(async () => {
  try {
    await withTickLock("AI_TICK", AI_TICK_MS - 500, () => runAiTick(broadcast));
  } catch (err) {
    console.error("AI tick failed:", err.message);
  }
}, AI_TICK_MS);

setInterval(async () => {
  try {
    const { skipped, result } = await withTickLock("RESEARCH_TICK", RESEARCH_TICK_MS - 500, () => processResearchCompletions());
    if (!skipped) {
      for (const tech of result || []) {
        await incrementMissionProgress(tech.playerId, `tech_completed:${tech.techId}`, 1);
        await createNotification(tech.playerId, {
          type: "research_completed",
          message: `Research complete: ${tech.name}. Unlocked: ${tech.unlocks.join(", ")}`,
        });
        broadcast({ type: "RESEARCH_COMPLETED", playerId: tech.playerId, techId: tech.techId, name: tech.name, unlocks: tech.unlocks });
      }
    }
  } catch (err) {
    console.error("Research tick failed:", err.message);
  }
}, RESEARCH_TICK_MS);

setInterval(async () => {
  try {
    const { skipped, result } = await withTickLock("GLOBAL_EVENT_TICK", GLOBAL_EVENT_TICK_MS - 1000, () => triggerRandomGlobalEvent());
    if (!skipped) broadcast({ type: "GLOBAL_EVENT", event: result });
  } catch (err) {
    console.error("Global event tick failed:", err.message);
  }
}, GLOBAL_EVENT_TICK_MS);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`PixelWar backend listening on port ${PORT}`);
  console.log(`WebSocket feed available at ws://localhost:${PORT}/ws (auth required via ?token=)`);
});
