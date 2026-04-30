import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Dev tunnel support: ngrok cambia subdominio, así que no conviene fijarlo a uno solo.
    allowedHosts: true,
    proxy: {
      "/games": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/socket.io": {
        target: "http://127.0.0.1:8000",
        ws: true,
        changeOrigin: true
      },
      "/ops": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/persistence": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared")
    }
  }
});
