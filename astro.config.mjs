import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { randomBytes } from "node:crypto";

// Ключ данных тренажёра слов — новый на каждую сборку (src/pages/ispanskij-dlya-dgt/slovar.bin.ts)
const WORDS_KEY = randomBytes(32).toString("base64");

export default defineConfig({
  site: "https://sdadim.eu",
  // /blog/slug → dist/blog/slug.html; на Vercel cleanUrls отдаёт без .html и без слэша
  trailingSlash: "never",
  // CSS встраивается в HTML: минус блокирующий запрос перед первой отрисовкой
  build: { format: "file", inlineStylesheets: "always" },
  // Тексты статей — как написаны: без автозамены кавычек и тире
  markdown: { smartypants: false },
  integrations: [mdx()],
  vite: {
    // Переменные окружения исторически с префиксом VITE_
    envPrefix: ["VITE_", "PUBLIC_"],
    define: { __WORDS_KEY__: JSON.stringify(WORDS_KEY) },
  },
});
