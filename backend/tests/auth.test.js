process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

describe("Auth", () => {
  const email = `test-${Date.now()}@pixelwar.dev`;

  it("registers a new player and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: `tester${Date.now()}`, email, password: "testpass123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.player.email).toBe(email);
    expect(res.body.player.passwordHash).toBeUndefined(); // never leak the hash
  });

  it("rejects registration with an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "bademail", email: "not-an-email", password: "testpass123" });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email registration", async () => {
    const dupEmail = `dup-${Date.now()}@pixelwar.dev`;
    await request(app).post("/api/auth/register").send({ username: "first", email: dupEmail, password: "testpass123" });
    const res = await request(app).post("/api/auth/register").send({ username: "second", email: dupEmail, password: "testpass123" });
    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials and rejects wrong password", async () => {
    const loginEmail = `login-${Date.now()}@pixelwar.dev`;
    await request(app).post("/api/auth/register").send({ username: "loginuser", email: loginEmail, password: "correctpass" });

    const good = await request(app).post("/api/auth/login").send({ email: loginEmail, password: "correctpass" });
    expect(good.status).toBe(200);
    expect(good.body.token).toBeDefined();

    const bad = await request(app).post("/api/auth/login").send({ email: loginEmail, password: "wrongpass" });
    expect(bad.status).toBe(401);
  });

  it("rejects protected routes with no token", async () => {
    const res = await request(app).get("/api/player/me");
    expect(res.status).toBe(401);
  });
});
