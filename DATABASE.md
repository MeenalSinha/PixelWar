# DynamoDB Single-Table Design

PixelWar leverages AWS DynamoDB using a highly optimized **Single-Table Design**. 

This approach minimizes read latency and maximizes query efficiency by grouping related entities together and strictly defining access patterns, satisfying the strict requirements of a high-performance hackathon architecture.

## Table: `PixelWar_Entities`

We store all game entities (Players, Pixels, Civilizations, Alliances) in a single table, `PixelWar_Entities`.

### Key Schema

* **Partition Key (PK):** String (Identifies the entity or collection boundary)
* **Sort Key (SK):** String (Identifies the specific item or sub-entity)

### Entities & Keys

#### 1. Players
* **PK:** `PLAYER#{playerId}`
* **SK:** `PROFILE`
* **Attributes:** `username`, `passwordHash`, `resources`, `score`, `level`
* **Access Pattern:** Get player profile on login or dashboard load.

#### 2. Pixels (The World Canvas)
Instead of storing millions of individual pixels as separate top-level partition keys (which would make rendering the map extremely slow due to full-table scans), we partition pixels by **Chunks**.

* **PK:** `PIXEL#{chunkX}_{chunkY}`
* **SK:** `COORD#{x}_{y}`
* **Attributes:** `owner` (playerId or civId), `color`, `biome`, `health`, `version` (Optimistic locking), `GSI1PK`, `GSI1SK`
* **Access Pattern:** Render a chunk on the client by querying all pixels where `PK = PIXEL#{chunkX}_{chunkY}` in a single, fast read operation.

#### 3. Civilizations (AI)
* **PK:** `CIVILIZATION#{civId}`
* **SK:** `PROFILE`
* **Attributes:** `name`, `personality`, `memory`, `power`, `originX`, `originY`
* **Access Pattern:** AI loop scans for all civilizations to calculate tick actions.

### Global Secondary Indexes (GSIs)

To support complex queries without full table scans, we employ GSIs.

#### GSI1 (The Player-Pixel Index)
**Goal:** Answer the question "What land does Player X own?" without scanning every chunk in the world.

* **GSI1PK:** `PLAYER#{playerId}`
* **GSI1SK:** `PIXEL#{x}#{y}`
* **Projection:** ALL
* **Access Pattern:** By querying `GSI1PK = PLAYER#{playerId}`, we instantly retrieve all pixels claimed by a specific player, enabling rapid score calculations, resource generation metrics, and territory visualization.

## Concurrency Control

Because thousands of players may attempt to claim or attack the same pixel simultaneously, DynamoDB's eventual consistency is a risk. We resolve this using **Optimistic Locking**:
Every pixel write includes a `ConditionExpression: "version = :expectedVersion"`. If the version in the database doesn't match the client's expected version, the transaction fails with a `409 Conflict`, guaranteeing mathematical consistency on the world map.
