# Architecture

## Event flow (implemented in this MVP)

Player clicks a pixel (frontend Canvas)
  -> POST /api/world/pixel/claim (Express, JWT-protected)
  -> Pixel.claimPixel() optimistic-locked write to DynamoDB
  -> territoryService.recalcTerritoryForPixel() flood-fill merge within chunk
  -> ws/server.broadcast({ type: "PIXEL_CLAIMED", pixel }) to every connected client
  -> Frontend useRealtime() hook updates the canvas for ALL connected players instantly

Resource generation
  -> setInterval in server.js every RESOURCE_TICK_MS
  -> resourceTickService.runResourceTick() applies ratePerHour pro-rated to elapsed time
  -> broadcast({ type: "RESOURCE_TICK", updates })

AI civilizations
  -> setInterval every AI_TICK_MS
  -> aiCivService.runAiTick() — real per-personality decision logic, persisted to DynamoDB
  -> broadcast({ type: "AI_ACTION", ... })

## Why DynamoDB (single table design)

See `docs/DATABASE.md` for the full key schema. Short version: pixels are
chunked into 32x32 regions so loading a viewport is a single Query
(`PK = PIXEL#<chunkId>`), not a scan of a billion-row table. Player-owned
entities (pixels, cities) are discoverable via GSI1 without a second table.
Territory recalculation uses GSI2 to find every pixel in a territory.

## Production deployment path (NOT deployed in this MVP — documented honestly)

This repo runs Express + DynamoDB Local + a Node WebSocket server for local
development and demos. The intended production architecture, matching the
original brief, is:

- Frontend: Vercel (Next.js 15, Edge + ISR for the marketing pages)
- API: AWS Lambda behind API Gateway (HTTP API), same controller logic,
  wrapped with a Lambda handler adapter (e.g. `@vendia/serverless-express`)
- Realtime: API Gateway WebSocket API (replacing the raw `ws` server) with
  connection IDs stored in DynamoDB so Lambda can push to connected clients
- DynamoDB: real on-demand table with the schema in this repo, no code change
  needed beyond removing the `endpoint` override
- Background ticks: EventBridge Scheduler invoking the tick Lambdas instead
  of `setInterval` (setInterval does not survive across Lambda invocations)
- Assets/CDN: S3 + CloudFront for sprites and static world chunk snapshots

None of this AWS infrastructure is provisioned by this zip — there is no
Terraform/CDK included yet. That is the single biggest gap between "what's
in this repo" and "what's in the original brief," and it's called out here
rather than left implicit.

## Honest feature status

See `docs/FEATURE_AUDIT.md`.
