import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://sdadim.eu",
  // /blog/slug → dist/blog/slug.html; на Vercel cleanUrls отдаёт без .html и без слэша
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [react()],
  vite: {
    // Переменные окружения исторически с префиксом VITE_
    envPrefix: ["VITE_", "PUBLIC_"],
    resolve: {
      alias: [
        { find: "react-router-dom", replacement: fileURLToPath(new URL("./src/lib/router-shim.tsx", import.meta.url)) },
      ],
    },
  },
});
