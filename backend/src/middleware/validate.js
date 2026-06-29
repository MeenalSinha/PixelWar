const { z } = require("zod");

/**
 * Generic validation middleware. Replaces the audit finding that
 * market/war/alliance controllers trusted req.body directly (e.g. a
 * negative pricePerUnit or non-numeric quantity could previously reach
 * DynamoDB unchecked). Every mutating route now validates through this.
 */
function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
  };
}

const schemas = {
  claimPixel: z.object({
    x: z.number().int().min(0).max(8191),
    y: z.number().int().min(0).max(8191),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex value like #F4C430"),
    expectedVersion: z.number().int().min(0).optional(),
  }),

  attackPixel: z.object({
    x: z.number().int().min(0).max(8191),
    y: z.number().int().min(0).max(8191),
  }),

  startResearch: z.object({
    techId: z.string().min(1).max(64),
  }),

  createAlliance: z.object({
    name: z.string().min(3).max(40),
  }),

  contributeResources: z.object({
    resourceType: z.enum(["wood", "stone", "iron", "gold", "food", "energy"]),
    amount: z.number().positive().max(1_000_000),
  }),

  createListing: z.object({
    resourceType: z.enum(["wood", "stone", "iron", "gold", "food", "energy"]),
    quantity: z.number().int().positive().max(1_000_000),
    pricePerUnit: z.number().positive().max(100_000),
  }),

  chatMessage: z.object({
    scope: z.enum(["global", "alliance"]),
    allianceId: z.string().optional(),
    text: z.string().min(1).max(500),
    username: z.string().min(1).max(40),
  }),

  foundCity: z.object({
    name: z.string().min(2).max(30).optional(),
    x: z.number().int().min(0).max(8191),
    y: z.number().int().min(0).max(8191),
  }),
};

module.exports = { validate, schemas };
