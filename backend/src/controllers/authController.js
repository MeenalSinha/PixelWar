const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { createPlayer, findByEmail, sanitize } = require("../models/Player");
const { signToken } = require("../middleware/auth");

const registerSchema = z.object({
  username: z.string().min(3).max(24),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await findByEmail(parsed.data.email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const player = await createPlayer(parsed.data);
  const token = signToken(player.playerId);
  res.status(201).json({ token, player });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const player = await findByEmail(parsed.data.email);
  if (!player) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(parsed.data.password, player.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(player.playerId);
  res.json({ token, player: sanitize(player) });
}

module.exports = { register, login };
