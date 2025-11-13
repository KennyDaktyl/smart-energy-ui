import { useEffect, useRef } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8765";

/**
 * Hook do subskrybowania danych inwertera przez WebSocket.
 */
export function useInverterLive(
  serial: string,
  onUpdate: (data: {
    serial_number: string;
    active_power: number | null;
    status: string;
    timestamp?: string;
    error_message?: string | null;
  }) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!serial) return;

    let reconnectTimeout: number;
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`✅ WebSocket connected for inverter ${serial}`);
        ws.send(JSON.stringify({ action: "subscribe", serial }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "inverter_update" && msg.data.serial_number === serial) {
            onUpdate(msg.data);
          }
        } catch (err) {
          console.error("❌ WebSocket parse error:", err);
        }
      };

      ws.onerror = (e) => {
        console.warn("⚠️ WebSocket error:", e);
        ws.close();
      };

      ws.onclose = () => {
        console.log(`🔌 WebSocket closed for ${serial}`);
        reconnectTimeout = window.setTimeout(connect, 5000); // reconnect po 5s
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws.close();
    };
  }, [serial, onUpdate]);
}
