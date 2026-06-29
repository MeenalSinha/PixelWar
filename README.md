<div align="center">
  <img src="./frontend/public/favicon.ico" alt="Logo" width="80" height="80">
  <h1 align="center">PixelWar: Sovereign Canvas</h1>
  <p align="center">
    A massively multiplayer, persistent, real-time civilization strategy game.
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
  </p>
</div>

## About The Project

Imagine Minecraft, Civilization, and Reddit's r/place combined into one persistent online world. PixelWar: Sovereign Canvas is a massively multiplayer real-time strategy game where millions of players share one living world. Every pixel is a piece of land that can be claimed, defended, and fought over in real-time.

### Key Features
* **Massively Multiplayer:** Thousands of concurrent players on a single shared canvas.
* **Real-time Synchronization:** Every pixel claimed or attacked broadcasts instantly via WebSockets to all connected clients.
* **Persistent World:** The canvas never resets. Civilizations rise, fall, and leave permanent marks.
* **Adaptive AI Civilizations:** Non-player civilizations have unique personalities (aggressive, scientific, diplomatic) and adapt dynamically to player actions based on stateful memory.
* **Resource Economy:** Claimed pixels generate resources over time, which are required for expansion, attacks, and research.

### Built With

* **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS, Framer Motion, HTML5 Canvas, TanStack Query.
* **Backend:** Node.js, Express, `ws` (WebSockets).
* **Database:** AWS DynamoDB (Single-Table Design).
* **Authentication:** JWT with bcrypt.

## Getting Started

### Prerequisites

* Node.js (v18+)
* AWS Account (or local DynamoDB instance)

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/your-username/pixelwar.git
   ```

2. **Backend Setup**
   ```sh
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=4000
   JWT_SECRET=super_secret_hackathon_key
   FRONTEND_ORIGIN=http://localhost:3000
   ```
   Set up DynamoDB tables and seed the world:
   ```sh
   npm run create-tables
   npm run seed
   ```
   Start the backend server:
   ```sh
   npm run dev
   ```

3. **Frontend Setup**
   ```sh
   cd frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
   ```
   Start the frontend:
   ```sh
   npm run dev
   ```

## Documentation

* [Architecture & Technical Justification](./ARCHITECTURE.md)
* [DynamoDB Single-Table Design](./DATABASE.md)

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
