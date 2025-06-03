import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://apitaskmanager.pdteam.net',
        changeOrigin: true,
        secure: false,
      },
      // 👇 Thêm proxy WebSocket cho Socket.IO
      '/socket.io': {
        target: 'https://apitaskmanager.pdteam.net',
        ws: true,             // Bắt buộc để hỗ trợ WebSocket
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  base: '/',
});
