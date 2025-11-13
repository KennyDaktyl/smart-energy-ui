import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mui/material/Grid2": "@mui/material/Grid",
    },
  },
  server: {
    port: 5173,
    open: true,
    fs: { strict: false },
    middlewareMode: false,
    hmr: true,
  },
  build: {
    rollupOptions: {
      input: "./index.html",
    },
  },
});
