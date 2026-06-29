require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const worldRoutes = require("./routes/worldRoutes");
const playerRoutes = require("./routes/playerRoutes");
const researchRoutes = require("./routes/researchRoutes");
const missionRoutes = require("./routes/missionRoutes");
const allianceRoutes = require("./routes/allianceRoutes");
const marketRoutes = require("./routes/marketRoutes");
const warRoutes = require("./routes/warRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const demoRoutes = require("./routes/demoRoutes");
const cityRoutes = require("./routes/cityRoutes");

/**
 * Pure Express app, no listen(), no WebSocket attach, no setInterval ticks.
 * Split out specifically so integration tests (tests/*.test.js) can import
 * this with supertest and exercise real routes/middleware/DB calls without
 * spinning up background jobs or a live server process.
 */
function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
  app.use(express.json());

  if (process.env.NODE_ENV !== "test") {
    app.use("/api", rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));
    app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false }));
  }

  app.get("/health", (req, res) => res.json({ status: "ok", time: Date.now() }));

  app.use("/api/auth", authRoutes);
  app.use("/api/world", worldRoutes);
  app.use("/api/player", playerRoutes);
  app.use("/api/research", researchRoutes);
  app.use("/api/missions", missionRoutes);
  app.use("/api/alliances", allianceRoutes);
  app.use("/api/market", marketRoutes);
  app.use("/api/war", warRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/demo", demoRoutes);
  app.use("/api/cities", cityRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
