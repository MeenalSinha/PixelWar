process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

async function registerPlayer(suffix) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: `scholar${suffix}`, email: `scholar-${suffix}-${Date.now()}@pixelwar.dev`, password: "testpass123" });
  return res.body.token;
}

describe("Research / tech tree", () => {
  it("returns the tech tree without auth", async () => {
    const res = await request(app).get("/api/research/tree");
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe("stone_age");
  });

  it("starts the first age successfully", async () => {
    const token = await registerPlayer("a");
    const res = await request(app).post("/api/research/start").set("Authorization", `Bearer ${token}`).send({ techId: "stone_age" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("in_progress");
  });

  it("rejects skipping ahead in the tech tree", async () => {
    const token = await registerPlayer("b");
    const res = await request(app).post("/api/research/start").set("Authorization", `Bearer ${token}`).send({ techId: "iron_age" });
    expect(res.status).toBe(400);
  });

  it("rejects starting a second research while one is in progress", async () => {
    const token = await registerPlayer("c");
    await request(app).post("/api/research/start").set("Authorization", `Bearer ${token}`).send({ techId: "stone_age" });
    const res = await request(app).post("/api/research/start").set("Authorization", `Bearer ${token}`).send({ techId: "bronze_age" });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown tech id", async () => {
    const token = await registerPlayer("d");
    const res = await request(app).post("/api/research/start").set("Authorization", `Bearer ${token}`).send({ techId: "atlantis_age" });
    expect(res.status).toBe(404);
  });
});
