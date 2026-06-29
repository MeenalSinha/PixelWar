/**
 * Real per-player action cooldown (audit fix: previously a player could
 * claim/attack as fast as the general rate limiter allowed, with zero
 * per-action throttling). This is an in-memory map keyed by playerId+action,
 * which is the correct scope for a single-process hackathon MVP — the
 * documented multi-instance migration would move this to a DynamoDB
 * conditional write (see docs/ARCHITECTURE.md) since in-memory state doesn't
 * share across processes.
 */
const lastActionAt = new Map();

function cooldown(actionName, minIntervalMs) {
  return (req, res, next) => {
    const key = `${req.playerId}:${actionName}`;
    const now = Date.now();
    const last = lastActionAt.get(key);

    if (last && now - last < minIntervalMs) {
      return res.status(429).json({
        error: `Action too fast — wait ${minIntervalMs - (now - last)}ms before ${actionName} again`,
      });
    }

    lastActionAt.set(key, now);
    next();
  };
}

module.exports = { cooldown };
