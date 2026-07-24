import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// NutriGuate - Local Development Config
export default defineConfig({
  server: {
    host: "localhost",
    port: 3000,
    open: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
});
