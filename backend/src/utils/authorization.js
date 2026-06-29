/**
 * Centralized ownership/authorization helpers. Audit fix: ownership checks
 * were previously inline and inconsistent (e.g. War.js compares pixel.owner
 * === attackerId directly inside the model; other places didn't check at
 * all). This doesn't change every call site in one pass, but it gives
 * future controllers one shared, tested place to express "does this player
 * own this thing" instead of re-deriving the comparison each time.
 */
function assertOwnsResource(resourceOwnerId, requestingPlayerId, label = "resource") {
  if (resourceOwnerId !== requestingPlayerId) {
    throw Object.assign(new Error(`You do not own this ${label}`), { status: 403 });
  }
}

function assertNotSelf(targetId, requestingPlayerId, action = "do this to yourself") {
  if (targetId === requestingPlayerId) {
    throw Object.assign(new Error(`You cannot ${action}`), { status: 400 });
  }
}

module.exports = { assertOwnsResource, assertNotSelf };
