/**
 * Single Table Design key builders for PixelWarTable.
 *
 * PK / SK pattern (see docs/DATABASE.md for full entity-relationship rationale):
 *
 *   PLAYER       PK=PLAYER#<playerId>          SK=METADATA
 *   PIXEL        PK=PIXEL#<chunkId>            SK=PIXEL#<x>#<y>
 *   CITY         PK=PLAYER#<playerId>          SK=CITY#<cityId>
 *   CIVILIZATION PK=CIV#<civId>                SK=METADATA
 *   ALLIANCE     PK=ALLIANCE#<allianceId>      SK=METADATA
 *   RESOURCE     PK=PLAYER#<playerId>          SK=RESOURCE#<resourceType>
 *   RESEARCH     PK=PLAYER#<playerId>          SK=RESEARCH#<techId>
 *   MISSION      PK=PLAYER#<playerId>          SK=MISSION#<missionId>
 *   EVENT        PK=EVENT#<date>               SK=EVENT#<timestamp>#<eventId>
 *   LEADERBOARD  PK=LEADERBOARD#<boardType>    SK=SCORE#<paddedScore>#<playerId>
 *   TERRITORY    PK=TERRITORY#<territoryId>    SK=METADATA
 *   WORLD        PK=WORLD#GLOBAL               SK=STATS
 *
 * Chunking: the world is divided into 32x32 pixel chunks so a single
 * Query on a chunk's PK returns every pixel in that viewport region
 * without a full table scan. chunkId = `${Math.floor(x/32)}_${Math.floor(y/32)}`.
 *
 * GSI1 (PlayerIndex): GSI1PK=PLAYER#<playerId>, GSI1SK=<entityType>#<id>
 *   -> lets us fetch "everything owned by a player" (pixels, cities) cheaply.
 *
 * GSI2 (TerritoryIndex): GSI2PK=TERRITORY#<territoryId>, GSI2SK=PIXEL#<x>#<y>
 *   -> lets territory recalculation pull all pixels in a territory.
 */

const CHUNK_SIZE = 32;

function chunkId(x, y) {
  return `${Math.floor(x / CHUNK_SIZE)}_${Math.floor(y / CHUNK_SIZE)}`;
}

const Keys = {
  player: (playerId) => ({ PK: `PLAYER#${playerId}`, SK: "METADATA" }),

  pixel: (x, y) => ({
    PK: `PIXEL#${chunkId(x, y)}`,
    SK: `PIXEL#${String(x).padStart(5, "0")}#${String(y).padStart(5, "0")}`,
  }),

  pixelChunkPK: (x, y) => `PIXEL#${chunkId(x, y)}`,

  city: (playerId, cityId) => ({ PK: `PLAYER#${playerId}`, SK: `CITY#${cityId}` }),

  civilization: (civId) => ({ PK: `CIV#${civId}`, SK: "METADATA" }),

  alliance: (allianceId) => ({ PK: `ALLIANCE#${allianceId}`, SK: "METADATA" }),

  resource: (playerId, type) => ({ PK: `PLAYER#${playerId}`, SK: `RESOURCE#${type}` }),

  research: (playerId, techId) => ({ PK: `PLAYER#${playerId}`, SK: `RESEARCH#${techId}` }),

  mission: (playerId, missionId) => ({ PK: `PLAYER#${playerId}`, SK: `MISSION#${missionId}` }),

  event: (eventId, timestamp = Date.now()) => {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    return { PK: `EVENT#${date}`, SK: `EVENT#${timestamp}#${eventId}` };
  },

  leaderboardEntry: (boardType, score, playerId) => ({
    PK: `LEADERBOARD#${boardType}`,
    // pad + invert so DynamoDB's ascending sort gives us descending rank
    SK: `SCORE#${String(9999999999 - score).padStart(10, "0")}#${playerId}`,
  }),

  territory: (territoryId) => ({ PK: `TERRITORY#${territoryId}`, SK: "METADATA" }),

  world: () => ({ PK: "WORLD#GLOBAL", SK: "STATS" }),
};

module.exports = { Keys, chunkId, CHUNK_SIZE };
