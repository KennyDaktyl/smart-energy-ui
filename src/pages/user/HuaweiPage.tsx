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
import HuaweiCredentialsForm from "@/components/user/HuaweiCredentialsForm";

export default function HuaweiPage() {
  const { token, user, refreshUser } = useAuth();
  const [userInstallations, setUserInstallations] = useState<any[]>([]);
  const [huaweiData, setHuaweiData] = useState<any[]>([]);
  const [invertersByStation, setInvertersByStation] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchingHuawei, setFetchingHuawei] = useState(false);
  const [error, setError] = useState("");
  const [fetchingInverters, setFetchingInverters] = useState<string | null>(null);

  // New UI state
  const [showEditForm, setShowEditForm] = useState(false);
  const [huaweiSaved, setHuaweiSaved] = useState(false);

  const fetchUserInstallations = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await userApi.getUserInstallations(token);
      setUserInstallations(res.data.installations || []);
    } catch {
      setError("Failed to fetch user installations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInstallations();
  }, [token]);

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
      setError("Failed to fetch Huawei installations.");
    } finally {
      setFetchingHuawei(false);
    }
  };

  const handleAddInstallation = async (installation: any) => {
    if (!token) return;

    try {
      const res = await installationApi.createInstallation(token, {
        name: installation.name,
        station_code: installation.station_code,
        station_addr: installation.station_addr,
      });
      const newInstallation = res.data;

      await fetchAndCompareInverters(newInstallation.station_code, newInstallation.id);
      await fetchUserInstallations();
    } catch (err) {
      console.error(err);
      setError("Failed to add installation.");
    }
  };

  const fetchAndCompareInverters = async (stationCode: string, installationId?: number) => {
    if (!token) return;
    try {
      setFetchingInverters(stationCode);

      const res = await inverterApi.getInstallationInverters(token, stationCode);
      const devices = res.data.devices || [];
      const huaweiInverters = devices.filter((d: any) => d.devTypeId === 1);

      const userRes = await userApi.getUserInstallations(token);
      const userInverters =
        userRes.data.installations
          ?.find((i: any) => i.station_code === stationCode)
          ?.inverters || [];

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
      console.error("Failed to fetch inverters from Huawei:", err);
      setError("Failed to fetch inverters from Huawei.");
    } finally {
      setFetchingInverters(null);
    }
  };

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

      await fetchAndCompareInverters(stationCode);
    } catch (err) {
      console.error("Failed to add inverter to DB:", err);
      setError("Failed to add inverter to database.");
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
        Huawei API Integration
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* --- CREDENTIALS SECTION --- */}
      <Paper sx={{ p: 3, mb: 4 }}>
        {!user?.huawei_username || showEditForm ? (
          <>
            {!user?.huawei_username && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Huawei credentials are not configured.
              </Alert>
            )}

            <HuaweiCredentialsForm
              token={token!}
              onSaved={async () => {
                setHuaweiSaved(true);
                setShowEditForm(false);

                await refreshUser?.();
                await fetchUserInstallations();

                setTimeout(() => setHuaweiSaved(false), 3000);
              }}
            />

            {user?.huawei_username && (
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Connected as: <strong>{user.huawei_username}</strong>
            </Alert>

            {huaweiSaved && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Huawei credentials saved successfully.
              </Alert>
            )}

            <Button variant="contained" onClick={fetchHuaweiInstallations}>
              Fetch Huawei installations
            </Button>

            <Button variant="outlined" sx={{ ml: 2 }} onClick={() => setShowEditForm(true)}>
              Change Huawei data
            </Button>
          </>
        )}
      </Paper>

      {/* --- INSTALLATIONS & INVERTERS --- */}
      {!fetchingHuawei &&
        huaweiData.map((inst) => {
          const inDb = isInstallationInDB(inst.station_code);
          const inverters = invertersByStation[inst.station_code] || [];

          return (
            <Card key={inst.station_code} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">{inst.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Address: {inst.station_addr}
                </Typography>

                {!inDb ? (
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={() => handleAddInstallation(inst)}
                  >
                    Add installation and inverters
                  </Button>
                ) : (
                  <>
                    <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                      Installation assigned
                    </Alert>

                    <Button
                      variant="outlined"
                      onClick={() => fetchAndCompareInverters(inst.station_code)}
                      disabled={fetchingInverters === inst.station_code}
                    >
                      {fetchingInverters === inst.station_code
                        ? "Loading..."
                        : "Show inverters"}
                    </Button>

                    {inverters.length > 0 && (
                      <Box mt={2} ml={2}>
                        <Typography variant="subtitle1" mb={1}>
                          Inverters (from Huawei):
                        </Typography>
                        {inverters.map((inv) => (
                          <Card key={inv.esnCode} sx={{ mb: 1, p: 1 }}>
                            <Typography>
                              {inv.devName} ({inv.esnCode})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Model: {inv.model || inv.invType || "Unknown"}
                            </Typography>
                            {inv.alreadySaved ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                sx={{ mt: 1 }}
                                disabled
                              >
                                Already saved
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                sx={{ mt: 1 }}
                                onClick={() => handleAddInverter(inst.station_code, inv)}
                              >
                                Add to database
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
