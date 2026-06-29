# System Architecture & Technical Justification

This document details the architectural choices made for the PixelWar: Sovereign Canvas MVP. We specifically balance extreme scalability potential with the realistic constraints and judging criteria of an international hackathon.

## Core Architecture Overview

PixelWar utilizes a **Monolithic Real-Time Architecture** consisting of:

1. **Next.js 15 (React 19) Frontend:** App Router for layout, HTML5 Canvas for ultra-fast rendering, and TanStack Query for data synchronization.
2. **Node.js Express + `ws` Backend:** A unified API and WebSocket server.
3. **AWS DynamoDB:** A fully managed NoSQL database implementing a strictly optimized Single-Table Design.

## Why Not Serverless (Lambda + API Gateway WebSockets)?

While a fully serverless architecture (AWS API Gateway + Lambda + EventBridge) is theoretically infinitely scalable, we explicitly chose a **Stateful Node.js + WS Monolith** for this MVP for the following critical reasons:

1. **Ultra-Low Latency & High-Frequency Broadcasts:** In PixelWar, multiple users can click pixels simultaneously. API Gateway WebSockets introduce minimum network hops and per-message Lambda invocation latency. A local `ws` instance allows for microsecond-latency in-memory broadcasts (e.g., `broadcast({ type: "PIXEL_CLAIMED" })`).
2. **Tick-Based Game Engine Simulation:** The game requires a persistent background loop (`setInterval` ticks) to handle Resource Generation, AI Expansion, and Global Events. Lambda does not support persistent background loops natively without expensive polling architectures (EventBridge triggering Lambdas every minute is too slow for real-time AI and combat). A stateful container allows a constant `while(true)` loop to simulate the world ticking seamlessly.
3. **Data Consistency:** By forcing all real-time events through a single stateful process, we avoid race conditions associated with distributed serverless functions writing to the same chunk concurrently.

**Future Scaling:** As the game scales beyond a single container's capacity, this monolith can easily be containerized (Docker) and deployed via AWS ECS or EKS, with a Redis Pub/Sub backplane managing WebSocket message routing between instances.

## Frontend Optimization

### HTML5 Canvas over React DOM
Rendering a 32x32 chunk means rendering 1024 individual pixels.
- **Mistake:** Rendering 1024 `<div className="pixel">` elements causes React to crash or freeze the browser due to massive virtual DOM diffing costs.
- **Solution:** We bypassed the DOM entirely using an HTML5 `<canvas>` and `ctx.fillRect()`. This guarantees 60 FPS even when rendering massive maps, and avoids the heavy dependencies of WebGL frameworks like PixiJS for a 2D grid.

### Optimistic Updates
To ensure the game feels "instant", the frontend utilizes **Optimistic UI**. When a player clicks a pixel, the canvas immediately updates locally before the server responds. If the DynamoDB write fails (e.g., someone else clicked it first, failing the Conditional Check), the UI silently rolls back, maintaining data integrity without sacrificing perceived performance.

## AI Implementation

The AI Engine (`aiCivService.js`) avoids heavy Machine Learning models (which are slow, expensive, and unnecessary for a hackathon MVP). Instead, it uses a **Stateful Heuristic Engine**. 
AI civilizations track `territoryPressure` and `lastAttackedBy` in DynamoDB. When an AI expands, it calculates adjacent coordinates and executes real `claimPixel` commands, physically taking over the canvas rather than just incrementing an abstract score counter. This fulfills the requirement for dynamic, adaptive, and observable AI.
