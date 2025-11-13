import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/admin/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Użytkownicy</Typography>
      {users.map((u: any) => (
        <Card key={u.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{u.email}</Typography>
            <Typography variant="body2">Rola: {u.role}</Typography>
            <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate(`/admin/users/${u.id}/installations`)}>
              Zobacz instalacje
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
