// «Трасса» для других сайтов: src/components/words/embed.ts → public/embed/trassa.js (один файл, стили внутри).
// Запускается перед astro build (prebuild); подключение — комментарий в embed.ts.
import { build } from "vite";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../src", import.meta.url));
await build({
  configFile: false,
  logLevel: "warn",
  resolve: { alias: { "@": src } },
  css: { postcss: { plugins: [] } },
  build: {
    lib: { entry: `${src}/components/words/embed.ts`, formats: ["es"], fileName: () => "trassa.js" },
    outDir: fileURLToPath(new URL("../public/embed", import.meta.url)),
    emptyOutDir: true,
    copyPublicDir: false,
    target: "es2020",
    minify: true,
  },
});
console.log("embed: public/embed/trassa.js");
