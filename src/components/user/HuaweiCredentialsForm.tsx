import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Paper, Alert } from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface Props {
  token: string;
  onSaved?: () => void; 
}

export default function HuaweiCredentialsForm({ token }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/users/me/huawei-credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.huawei_username);
        setPassword(res.data.huawei_password);
      })
      .catch(() => {
      });
  }, [token]);

  const handleSave = async () => {
    try {
      await axios.put(
        `${API_URL}/users/huawei-credentials`,
        {
          huawei_username: username,
          huawei_password: password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setMessage("Dane Huawei zapisane pomyślnie!");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Błąd zapisu danych");
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 4, mt: 3 }}>
      <Typography variant="h6" mb={2}>
        Dane logowania Huawei API
      </Typography>

      {message && (
        <Alert severity={saved ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Huawei Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Huawei Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
        Zapisz dane
      </Button>
    </Paper>
  );
}
