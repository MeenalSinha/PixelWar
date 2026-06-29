process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_do_not_use_in_prod";

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

async function registerPlayer(suffix) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: `trader${suffix}`, email: `trader-${suffix}-${Date.now()}@pixelwar.dev`, password: "testpass123" });
  return res.body.token;
}

describe("Marketplace", () => {
  it("lists open listings without auth", async () => {
    const res = await request(app).get("/api/market");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rejects listing more than you own", async () => {
    const token = await registerPlayer("a");
    // New players start with 200 wood (see Player.js STARTING_RESOURCES) — ask for more than that.
    const res = await request(app)
      .post("/api/market")
      .set("Authorization", `Bearer ${token}`)
      .send({ resourceType: "wood", quantity: 999999, pricePerUnit: 1 });
    expect(res.status).toBe(400);
  });

  it("rejects a negative price", async () => {
    const token = await registerPlayer("b");
    const res = await request(app)
      .post("/api/market")
      .set("Authorization", `Bearer ${token}`)
      .send({ resourceType: "wood", quantity: 10, pricePerUnit: -5 });
    expect(res.status).toBe(400); // caught by zod .positive()
  });

  it("creates a listing and another player can buy it", async () => {
    const sellerToken = await registerPlayer("c");
    const buyerToken = await registerPlayer("d");

    const listingRes = await request(app)
      .post("/api/market")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ resourceType: "wood", quantity: 10, pricePerUnit: 2 });
    expect(listingRes.status).toBe(201);

    const buyRes = await request(app)
      .post(`/api/market/${listingRes.body.listingId}/buy`)
      .set("Authorization", `Bearer ${buyerToken}`);
    expect(buyRes.status).toBe(200);
    expect(buyRes.body.status).toBe("fulfilled");
  });

  it("rejects buying your own listing", async () => {
    const token = await registerPlayer("e");
    const listingRes = await request(app)
      .post("/api/market")
      .set("Authorization", `Bearer ${token}`)
      .send({ resourceType: "wood", quantity: 5, pricePerUnit: 1 });

    const res = await request(app).post(`/api/market/${listingRes.body.listingId}/buy`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
