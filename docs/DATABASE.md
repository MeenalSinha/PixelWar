# Database — Single Table Design

Table: `PixelWarTable` (see `backend/src/scripts/createTables.js` for the real
CreateTable call — PAY_PER_REQUEST billing, two GSIs).

| Entity | PK | SK |
|---|---|---|
| Player | `PLAYER#<id>` | `METADATA` |
| Pixel | `PIXEL#<chunkId>` | `PIXEL#<x>#<y>` |
| City | `PLAYER#<id>` | `CITY#<cityId>` |
| Civilization (AI) | `CIV#<id>` | `METADATA` |
| Alliance | `ALLIANCE#<id>` | `METADATA` |
| Resource | `PLAYER#<id>` | `RESOURCE#<type>` |
| Research | `PLAYER#<id>` | `RESEARCH#<techId>` |
| Mission | `PLAYER#<id>` | `MISSION#<missionId>` |
| Event | `EVENT#<date>` | `EVENT#<ts>#<id>` |
| Leaderboard entry | `LEADERBOARD#<board>` | `SCORE#<paddedInvertedScore>#<playerId>` |
| Territory | `TERRITORY#<id>` | `METADATA` |
| World stats | `WORLD#GLOBAL` | `STATS` |

GSI1 (`GSI1-PlayerIndex`): `GSI1PK = PLAYER#<id>`, `GSI1SK = <entity>#<id>` —
fetch everything a player owns (pixels, cities) without scanning.

GSI2 (`GSI2-TerritoryIndex`): `GSI2PK = TERRITORY#<id>`, `GSI2SK = PIXEL#<x>#<y>` —
fetch every pixel belonging to a territory for border rendering/recalculation.

## Chunking

The world is split into 32x32 pixel chunks (`chunkId = floor(x/32)_floor(y/32)`).
Loading a viewport is one `Query` against `PIXEL#<chunkId>`, returning at most
1024 items — this is the core reason DynamoDB fits this workload: hot,
narrow, key-based access patterns instead of full scans, even at billions
of pixels.

## What is real vs. scanned (honesty note)

Pixel reads/writes and territory merges use real `Query`/`Get`/`Put` with
keys above — no scans. Two operations in this MVP currently use `Scan` and
are flagged as scale limitations rather than hidden:

- `Player.findByEmail` (auth lookup) — would need a `GSI-Email` in production
- `resourceTickService.runResourceTick` — scans all RESOURCE items every tick;
  production fix is per-player scheduled Lambda ticks (see ARCHITECTURE.md)
