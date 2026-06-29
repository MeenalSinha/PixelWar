process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

async function registerPlayer(suffix) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: `fighter${suffix}`, email: `fighter-${suffix}-${Date.now()}@pixelwar.dev`, password: "testpass123" });
  return res.body.token;
}

describe("Combat", () => {
  it("rejects attacking an unclaimed pixel", async () => {
    const token = await registerPlayer("a");
    const res = await request(app)
      .post("/api/war/attack")
      .set("Authorization", `Bearer ${token}`)
      .send({ x: 8500, y: 8500 }); // unlikely to be claimed by another test
    expect(res.status).toBe(400);
  });

  it("rejects attacking your own pixel", async () => {
    const token = await registerPlayer("b");
    const x = 8600 + Math.floor(Math.random() * 50);
    const y = 1;

    await request(app).post("/api/world/pixel/claim").set("Authorization", `Bearer ${token}`).send({ x, y, color: "#C0392B" });

    const res = await request(app).post("/api/war/attack").set("Authorization", `Bearer ${token}`).send({ x, y });
    expect(res.status).toBe(400);
  });

  it("lets one player damage another player's pixel and spends energy", async () => {
    const attackerToken = await registerPlayer("c");
    const defenderToken = await registerPlayer("d");
    const x = 8700 + Math.floor(Math.random() * 50);
    const y = 1;

    await request(app).post("/api/world/pixel/claim").set("Authorization", `Bearer ${defenderToken}`).send({ x, y, color: "#2F6FA8" });

    const res = await request(app).post("/api/war/attack").set("Authorization", `Bearer ${attackerToken}`).send({ x, y });
    expect(res.status).toBe(200);
    expect(res.body.damage).toBeGreaterThan(0);
    expect(res.body.energySpent).toBe(15);
  });

  it("enforces the attack cooldown", async () => {
    const attackerToken = await registerPlayer("e");
    const defenderToken = await registerPlayer("f");
    const x = 8800 + Math.floor(Math.random() * 50);
    const y = 1;

    await request(app).post("/api/world/pixel/claim").set("Authorization", `Bearer ${defenderToken}`).send({ x, y, color: "#2F6FA8" });

    const first = await request(app).post("/api/war/attack").set("Authorization", `Bearer ${attackerToken}`).send({ x, y });
    expect(first.status).toBe(200);

    const second = await request(app).post("/api/war/attack").set("Authorization", `Bearer ${attackerToken}`).send({ x, y });
    expect(second.status).toBe(429); // attack cooldown is 3000ms per gameConfig.js
  });
});
