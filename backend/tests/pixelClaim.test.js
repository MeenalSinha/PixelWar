process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

async function registerPlayer(suffix) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: `claimer${suffix}`, email: `claimer-${suffix}-${Date.now()}@pixelwar.dev`, password: "testpass123" });
  return res.body.token;
}

describe("Pixel claiming", () => {
  it("claims an unowned pixel", async () => {
    const token = await registerPlayer("a");
    // Use a high coordinate range per test run to avoid collisions with other test runs.
    const x = 7000 + Math.floor(Math.random() * 100);
    const y = 7000 + Math.floor(Math.random() * 100);

    const res = await request(app)
      .post("/api/world/pixel/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ x, y, color: "#F4C430" });

    expect(res.status).toBe(200);
    expect(res.body.owner).toBeDefined();
    expect(res.body.color).toBe("#F4C430");
  });

  it("rejects invalid color format", async () => {
    const token = await registerPlayer("b");
    const res = await request(app)
      .post("/api/world/pixel/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ x: 10, y: 10, color: "red" }); // not a hex value — should fail validation
    expect(res.status).toBe(400);
  });

  it("rejects out-of-bounds coordinates", async () => {
    const token = await registerPlayer("c");
    const res = await request(app)
      .post("/api/world/pixel/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ x: -1, y: 999999, color: "#F4C430" });
    expect(res.status).toBe(400);
  });

  it("enforces the per-player claim cooldown", async () => {
    const token = await registerPlayer("d");
    const baseX = 7200 + Math.floor(Math.random() * 50);

    const first = await request(app)
      .post("/api/world/pixel/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ x: baseX, y: 1, color: "#F4C430" });
    expect(first.status).toBe(200);

    // Immediately try again — should be rejected by the cooldown middleware
    // (claim cooldown is 300ms per gameConfig.js).
    const second = await request(app)
      .post("/api/world/pixel/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ x: baseX, y: 2, color: "#F4C430" });
    expect(second.status).toBe(429);
  });
});
