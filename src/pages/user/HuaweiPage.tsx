import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { inverterApi } from "@/api/inverterApi";
import { installationApi } from "@/api/installationApi";
import { userApi } from "@/api/userApi";
import { useAuth } from "@/hooks/useAuth";

export default function HuaweiPage() {
  const { token, user } = useAuth();
  const [userInstallations, setUserInstallations] = useState<any[]>([]);
  const [huaweiData, setHuaweiData] = useState<any[]>([]);
  const [invertersByStation, setInvertersByStation] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchingHuawei, setFetchingHuawei] = useState(false);
  const [error, setError] = useState("");
  const [fetchingInverters, setFetchingInverters] = useState<string | null>(null);

  // 🔹 Pobierz instalacje użytkownika z backendu
  const fetchUserInstallations = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await userApi.getUserInstallations(token);
      setUserInstallations(res.data.installations || []);
    } catch {
      setError("Nie udało się pobrać instalacji użytkownika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInstallations();
  }, [token]);

  // 🔹 Pobierz instalacje z Huawei API
  const fetchHuaweiInstallations = async () => {
    if (!token) return;
    try {
      setFetchingHuawei(true);
      const res = await installationApi.getUserHuaweiInstallations(token);
      const stations = res.data?.stations || [];

      const mapped = stations.map((s: any) => ({
        name: s.stationName,
        station_code: s.stationCode,
        station_addr: s.stationAddr,
        capacity_kw: s.capacity,
      }));

      setHuaweiData(mapped);
    } catch {
      setError("Nie udało się pobrać danych z Huawei API.");
    } finally {
      setFetchingHuawei(false);
    }
  };

  // 🔹 Dodaj instalację i automatycznie przypisz jej urządzenia (inwertery)
  const handleAddInstallation = async (installation: any) => {
    if (!token) return;

    try {
      const res = await installationApi.createInstallation(token, {
        name: installation.name,
        station_code: installation.station_code,
        station_addr: installation.station_addr,
      });
      const newInstallation = res.data;
      console.log("✅ Utworzono instalację:", newInstallation);

      // automatyczne dodanie inwerterów
      await fetchAndCompareInverters(newInstallation.station_code, newInstallation.id);
      await fetchUserInstallations();
    } catch (err) {
      console.error(err);
      setError("Nie udało się dodać instalacji lub jej urządzeń.");
    }
  };

  // 🔹 Pobierz inwertery z Huawei API i porównaj z tymi z bazy
  const fetchAndCompareInverters = async (stationCode: string, installationId?: number) => {
    if (!token) return;
    try {
      setFetchingInverters(stationCode);

      // 1️⃣ Pobierz z Huawei
      const res = await inverterApi.getInstallationInverters(token, stationCode);
      const devices = res.data.devices || [];
      const huaweiInverters = devices.filter((d: any) => d.devTypeId === 1);

      // 2️⃣ Pobierz z backendu (instalacje usera)
      const userRes = await userApi.getUserInstallations(token);
      const userInverters =
        userRes.data.installations
          ?.find((i: any) => i.station_code === stationCode)
          ?.inverters || [];

      // 3️⃣ Zbuduj porównanie
      const merged = huaweiInverters.map((inv: any) => {
        const alreadySaved = userInverters.some(
          (dbInv: any) => dbInv.serial_number === inv.id.toString()
        );
        return {
          ...inv,
          alreadySaved,
          installation_id: installationId || userRes.data.installations.find(
            (i: any) => i.station_code === stationCode
          )?.id,
        };
      });

      setInvertersByStation((prev) => ({
        ...prev,
        [stationCode]: merged,
      }));
    } catch (err) {
      console.error("❌ Błąd przy pobieraniu urządzeń:", err);
      setError("Nie udało się pobrać urządzeń z Huawei.");
    } finally {
      setFetchingInverters(null);
    }
  };

  // 🔹 Dodaj pojedynczy inwerter do bazy
  const handleAddInverter = async (stationCode: string, inv: any) => {
    if (!token || !inv.installation_id) return;

    try {
      await inverterApi.createInverter(token, {
        installation_id: inv.installation_id,
        serial_number: inv.id.toString(),
        name: inv.devName,
        model: inv.model || inv.invType,
        dev_type_id: inv.devTypeId,
        latitude: inv.latitude,
        longitude: inv.longitude,
        capacity_kw: null,
      });

      console.log(`✅ Dodano inwerter ${inv.devName}`);
      await fetchAndCompareInverters(stationCode); // odśwież listę po dodaniu
    } catch (err) {
      console.error("❌ Nie udało się dodać inwertera:", err);
      setError("Nie udało się dodać inwertera do bazy.");
    }
  };

  const isInstallationInDB = (station_code: string) =>
    userInstallations.some((i) => i.station_code === station_code);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Integracja z Huawei API
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        {user?.huawei_username ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Połączono jako: <strong>{user.huawei_username}</strong>
            </Alert>
            <Button variant="contained" onClick={fetchHuaweiInstallations}>
              Pobierz dane z Huawei
            </Button>
          </>
        ) : (
          <Alert severity="warning">Brak danych Huawei</Alert>
        )}
      </Paper>

      {!fetchingHuawei &&
        huaweiData.map((inst) => {
          const inDb = isInstallationInDB(inst.station_code);
          const inverters = invertersByStation[inst.station_code] || [];

          return (
            <Card key={inst.station_code} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">{inst.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📍 {inst.station_addr}
                </Typography>

                {!inDb ? (
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={() => handleAddInstallation(inst)}
                  >
                    ➕ Dodaj instalację i inwertery
                  </Button>
                ) : (
                  <>
                    <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                      ✅ Instalacja przypisana
                    </Alert>

                    <Button
                      variant="outlined"
                      onClick={() => fetchAndCompareInverters(inst.station_code)}
                      disabled={fetchingInverters === inst.station_code}
                    >
                      {fetchingInverters === inst.station_code
                        ? "⏳ Pobieranie..."
                        : "🔄 Pokaż inwertery"}
                    </Button>

                    {inverters.length > 0 && (
                      <Box mt={2} ml={2}>
                        <Typography variant="subtitle1" mb={1}>
                          Inwertery (z Huawei):
                        </Typography>
                        {inverters.map((inv) => (
                          <Card key={inv.esnCode} sx={{ mb: 1, p: 1 }}>
                            <Typography>
                              ⚡ {inv.devName} ({inv.esnCode})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Model: {inv.model || inv.invType || "—"}
                            </Typography>
                            {inv.alreadySaved ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                sx={{ mt: 1 }}
                                disabled
                              >
                                ✅ Zapisano w bazie
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                sx={{ mt: 1 }}
                                onClick={() => handleAddInverter(inst.station_code, inv)}
                              >
                                ➕ Dodaj do bazy
                              </Button>
                            )}
                          </Card>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
    </Box>
  );
}
