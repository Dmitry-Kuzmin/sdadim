#!/usr/bin/env node
/**
 * Иконки сайта из одного источника — public/logo.svg:
 * favicon.png (48), apple-touch-icon.png (180, без скругления — iOS скругляет сам), logo.png (512, для JSON-LD).
 *
 *   npm run icons
 */
import puppeteer from "puppeteer";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "../public");
const svg = readFileSync(join(PUBLIC, "logo.svg"), "utf8");
const square = svg.replace(/ rx="\d+"/, "");

const jobs = [
  ["favicon.png", 48, svg],
  ["apple-touch-icon.png", 180, square],
  ["logo.png", 512, svg],
];

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
for (const [name, size, src] of jobs) {
  await page.setViewport({ width: size, height: size });
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${src}`);
  await page.screenshot({ path: join(PUBLIC, name), omitBackground: true });
  console.log(`✓ ${name}`);
}
await browser.close();
