process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

async function registerPlayer(suffix) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: `ally${suffix}`, email: `ally-${suffix}-${Date.now()}@pixelwar.dev`, password: "testpass123" });
  return res.body.token;
}

describe("Alliances", () => {
  it("rejects creating an alliance with too short a name", async () => {
    const token = await registerPlayer("a");
    const res = await request(app).post("/api/alliances").set("Authorization", `Bearer ${token}`).send({ name: "ab" });
    expect(res.status).toBe(400);
  });

  it("creates an alliance and another player can join it", async () => {
    const founderToken = await registerPlayer("b");
    const joinerToken = await registerPlayer("c");

    const createRes = await request(app)
      .post("/api/alliances")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ name: `Test Alliance ${Date.now()}` });
    expect(createRes.status).toBe(201);
    expect(createRes.body.memberIds).toHaveLength(1);

    const joinRes = await request(app)
      .post(`/api/alliances/${createRes.body.allianceId}/join`)
      .set("Authorization", `Bearer ${joinerToken}`);
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.memberIds).toHaveLength(2);
  });

  it("rejects joining the same alliance twice", async () => {
    const founderToken = await registerPlayer("d");
    const joinerToken = await registerPlayer("e");

    const createRes = await request(app)
      .post("/api/alliances")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ name: `Double Join ${Date.now()}` });

    await request(app).post(`/api/alliances/${createRes.body.allianceId}/join`).set("Authorization", `Bearer ${joinerToken}`);
    const second = await request(app).post(`/api/alliances/${createRes.body.allianceId}/join`).set("Authorization", `Bearer ${joinerToken}`);
    expect(second.status).toBe(400);
  });
});

describe("Missions", () => {
  it("auto-creates the standard mission set for a new player", async () => {
    const token = await registerPlayer("f");
    const res = await request(app).get("/api/missions/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.find((m) => m.missionId === "capture_500_pixels")).toBeDefined();
  });

  it("increments capture_500_pixels progress after a real pixel claim", async () => {
    const token = await registerPlayer("g");
    const x = 9000 + Math.floor(Math.random() * 50);

    await request(app).post("/api/world/pixel/claim").set("Authorization", `Bearer ${token}`).send({ x, y: 1, color: "#1F7A3F" });

    const res = await request(app).get("/api/missions/me").set("Authorization", `Bearer ${token}`);
    const mission = res.body.find((m) => m.missionId === "capture_500_pixels");
    expect(mission.progress).toBeGreaterThanOrEqual(1);
  });
});
