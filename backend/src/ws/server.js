const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");

let wss = null;
const clients = new Set();

/**
 * Real WS auth handshake (audit fix: previously any socket could connect and
 * listen to the full event firehose with no token check). The client must
 * pass a valid JWT as a `token` query param; unauthenticated connections are
 * closed immediately. Read-only spectators (e.g. the public landing page)
 * are intentionally NOT supported by this change — every connection now
 * requires a real logged-in player, matching how the rest of the API behaves.
 */
function initWebSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket, request) => {
    const url = new URL(request.url, "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      socket.close(4001, "Missing auth token");
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.playerId = payload.playerId;
    } catch {
      socket.close(4002, "Invalid or expired token");
      return;
    }

    clients.add(socket);
    socket.send(JSON.stringify({ type: "CONNECTED", message: "Connected to PixelWar realtime feed", playerId: socket.playerId }));

    socket.on("close", () => clients.delete(socket));
    socket.on("error", () => clients.delete(socket));
  });

  console.log("WebSocket server attached at /ws (auth required via ?token=)");
  return wss;
}

function broadcast(event) {
  const payload = JSON.stringify(event);
  for (const socket of clients) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

module.exports = { initWebSocketServer, broadcast };
