import { Box, Typography, Paper } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Moje konto
      </Typography>

      {user ? (
        <Paper sx={{ p: 3, maxWidth: 400 }}>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1">
            <strong>Rola:</strong> {user.role}
          </Typography>
          <Typography variant="body1">
            <strong>Huawei API:</strong>{" "}
            {user.huawei_username ? user.huawei_username : "Brak danych"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Konto utworzone:{" "}
            {new Date(user.created_at).toLocaleDateString("pl-PL")}
          </Typography>
        </Paper>
      ) : (
        <Typography color="text.secondary">Nie znaleziono danych użytkownika.</Typography>
      )}
    </Box>
  );
}
