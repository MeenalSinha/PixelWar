require("dotenv").config();
const { v4: uuid } = require("uuid");
const { createCivilization, PERSONALITIES } = require("../models/Civilization");
const { createPlayer } = require("../models/Player");
const { createListing } = require("../models/Trade");

const CIV_NAMES = [
  "Emerald Empire", "Crimson Order", "Golden Dynasty", "Northern Alliance",
  "Shadow Rebellion", "Sea Titans", "Iron Vanguard", "Sun Kingdom",
];

async function main() {
  console.log("Seeding AI civilizations...");
  for (let i = 0; i < CIV_NAMES.length; i++) {
    const personality = PERSONALITIES[i % PERSONALITIES.length];
    await createCivilization({
      civId: uuid(),
      name: CIV_NAMES[i],
      personality,
      originX: Math.floor(Math.random() * 512),
      originY: Math.floor(Math.random() * 512),
    });
    console.log(`  Created ${CIV_NAMES[i]} (${personality})`);
  }

  console.log("Seeding demo players...");
  const commander = await createPlayer({ username: "CommanderX", email: "demo@pixelwar.dev", password: "demopass123" });
  await createPlayer({ username: "RivalKing", email: "rival@pixelwar.dev", password: "demopass123" });

  console.log("Seeding a demo market listing...");
  await createListing(commander.playerId, { resourceType: "wood", quantity: 50, pricePerUnit: 2 });

  console.log("Seed complete.");
  console.log("Demo login 1: demo@pixelwar.dev / demopass123");
  console.log("Demo login 2: rival@pixelwar.dev / demopass123 (use this in a second tab to test attacks/trades)");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
