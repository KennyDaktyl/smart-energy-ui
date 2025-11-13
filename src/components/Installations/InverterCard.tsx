import { useEffect, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useInverterLive } from "@/hooks/useInverterLive";
import { Inverter } from "@/types/installation";
import { inverterApi } from "@/api/inverterApi";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  inverter: Inverter;
}

export function InverterCard({ inverter }: Props) {
  const [power, setPower] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { token } = useAuth();

  // 🔌 Subskrybuj dane z WebSocket
  useInverterLive(inverter.serial_number, (data) => {
    if (data.status === "failed") {
      setPower(null);
      setErrorMsg(data.error_message || "Power is not available");
    } else {
      setPower(data.active_power);
      setErrorMsg(null);
    }
    if (data.timestamp) setTimestamp(data.timestamp);
  });

  // 🔁 Pobierz stan początkowy z backendu (REST)
  useEffect(() => {
    const loadInitialPower = async () => {
      if (!token) return;
      try {
        const res = await inverterApi.getDeviceProduction(token, inverter.id);
        setPower(res.data?.active_power ?? null);
        setTimestamp(res.data?.timestamp ?? null);
      } catch {
        setErrorMsg("Power is not available");
        console.warn(`⚠️ Brak danych początkowych dla inwertera ${inverter.serial_number}`);
      }
    };
    loadInitialPower();
  }, [inverter.id, inverter.serial_number, token]);

  // 📅 Formatowanie czasu
  const formattedDateTime = timestamp
  ? new Date(timestamp).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  : null;

  return (
    <Box sx={{ ml: 2, mb: 2 }}>
      <Typography>
        ⚡ {inverter.name || "Brak nazwy"} ({inverter.serial_number})
      </Typography>

      {errorMsg ? (
        <Alert severity="error" sx={{ mt: 1, p: 1 }}>
          ❌ {errorMsg}
        </Alert>
      ) : power !== null ? (
        <Alert severity="success" sx={{ mt: 1, p: 1 }}>
          ⚙️ Aktualna moc: <strong>{power.toFixed(2)} W</strong>
          {formattedDateTime && (
            <Typography variant="body2" color="text.secondary">
              🕒 {formattedDateTime}
            </Typography>
          )}
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mt: 1, p: 1 }}>
          🔋 Power is not available
        </Alert>
      )}
    </Box>
  );
}
