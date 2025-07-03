import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests starting with /auth to your backend
      "/auth": {
        target: "http://197.253.19.78:9091",
        changeOrigin: true,
        // Optionally, remove /auth from the path if your backend expects it
        // rewrite: (path) => path.replace(/^\/auth/, '/auth'),
      },
    },
  },
});
