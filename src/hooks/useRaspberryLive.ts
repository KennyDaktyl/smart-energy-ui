import { useEffect, useRef } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8765";

interface HeartbeatData {
  uuid: string;
  status: string;
  timestamp?: string;
}

/**
 * Hook do subskrybowania heartbeatów Raspberry (stabilny, z reconnectem).
 */
export function useRaspberryLive(onUpdate: (data: HeartbeatData) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const lastSeenRef = useRef<Record<string, number>>({}); // ✅ trwały stan między renderami

  useEffect(() => {
    let reconnectTimeout: number;
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected for Raspberry heartbeats");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("📨 WS message:", msg);

          if (msg.type === "raspberry_heartbeat") {
            const { uuid, status, timestamp } = msg.data;

            // 🔹 aktualizacja czasu ostatniego heartbeat’a
            lastSeenRef.current[uuid] = Date.now();

            console.log(`💓 Heartbeat received from ${uuid}: ${status}`);
            onUpdate({ uuid, status, timestamp });
          }
        } catch (err) {
          console.error("❌ WebSocket parse error (raspberry):", err, event.data);
        }
      };

      ws.onclose = () => {
        console.warn("🔌 WebSocket closed, reconnecting in 5s...");
        reconnectTimeout = window.setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error("⚠️ WebSocket error:", err);
        ws.close();
      };
    };

    connect();

    // 🔹 watchdog – oznacza offline po 60 s bez heartbeat’a
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [uuid, ts] of Object.entries(lastSeenRef.current)) {
        if (now - ts > 60000) {
          console.warn(`🔴 ${uuid} marked offline (no heartbeat >60s)`);
          onUpdate({ uuid, status: "offline" });
          delete lastSeenRef.current[uuid]; // nie spamujemy ciągle
        }
      }
    }, 30000);

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
      ws.close();
    };
  }, [onUpdate]);
}
