import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useQueryClient } from "@tanstack/react-query";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

export function useRealtime(onMessage?: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(3000);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const updateResourcesFromTick = useGameStore((s) => s.updateResourcesFromTick);
  const addNotification = useGameStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  useEffect(() => {
    unmounted.current = false;

    function connect() {
      const token = localStorage.getItem("pixelwar_token");
      if (!token || unmounted.current) return;

      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (onMessageRef.current) onMessageRef.current(msg);

          if (msg.type === "RESOURCE_TICK") {
            updateResourcesFromTick(msg.updates);
          } else if (msg.type === "RESEARCH_COMPLETED") {
            addNotification({
              id: Date.now().toString(),
              type: "research_completed",
              message: `Research complete: ${msg.name}`,
              createdAt: new Date().toISOString(),
            });
            queryClient.invalidateQueries({ queryKey: ["myResearch"] });
            queryClient.invalidateQueries({ queryKey: ["techTree"] });
          } else if (msg.type === "GLOBAL_EVENT") {
            addNotification({
              id: Date.now().toString(),
              type: "global_event",
              message: `GLOBAL EVENT: ${msg.event.label}`,
              createdAt: new Date().toISOString(),
            });
            queryClient.invalidateQueries({ queryKey: ["globalEvent"] });
          }
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      ws.onopen = () => {
        reconnectDelay.current = 3000; // reset backoff on successful connection
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        const delay = reconnectDelay.current;
        reconnectDelay.current = Math.min(delay * 2, 30000); // exponential backoff, max 30s
        reconnectTimer.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close(); // triggers onclose which schedules reconnect
      };
    }

    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return wsRef;
}
