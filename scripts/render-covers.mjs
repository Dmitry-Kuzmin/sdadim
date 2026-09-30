#!/usr/bin/env node
/**
 * Обложки блога — это HTML-вёрстка (scripts/covers/*.html), а не сгенерированные картинки.
 * Скрипт открывает каждую в headless Chrome и сохраняет JPG 1600×1000
 * в public/assets/blog/<имя>.jpg.
 *
 *   npm run covers                 — все обложки
 *   npm run covers -- slovar-dgt   — одну
 */
import puppeteer from "puppeteer";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "covers");
const OUT = join(__dirname, "../public/assets/blog");

const only = process.argv.slice(2);
const names = readdirSync(SRC)
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""))
  .filter((n) => !only.length || only.includes(n));

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

for (const name of names) {
  await page.goto(`file://${join(SRC, name + ".html")}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, `${name}.jpg`), type: "jpeg", quality: 86 });
  console.log(`✓ ${name}.jpg`);
}

await browser.close();
