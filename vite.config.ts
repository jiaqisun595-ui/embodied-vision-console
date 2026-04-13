import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Served at the root path "/" on the static host.
  // If deploying under a subpath (e.g., /embodied-vision-console/), change this accordingly.
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      "/proxy": {
        target: "http://localhost:9001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ""),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
