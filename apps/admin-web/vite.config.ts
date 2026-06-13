import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@reciclame/shared-domain": path.resolve(__dirname, "../../packages/shared-domain/src/index.ts"),
      "@reciclame/database-types": path.resolve(__dirname, "../../packages/database-types/src/index.ts"),
    },
  },
});