#!/usr/bin/env node
/**
 * Адаптивные версии обложек блога: public/assets/blog/<имя>.jpg →
 * public/assets/blog/w/<имя>-{480,800,1200}.webp (для srcset, см. src/lib/covers.ts).
 * Запускается в prebuild; пропускает актуальные файлы. Папка w/ — в .gitignore.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "../public/assets/blog");
const OUT = join(SRC, "w");
const WIDTHS = [480, 800, 1200];

mkdirSync(OUT, { recursive: true });
let made = 0;
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".jpg"))) {
  const src = join(SRC, file);
  const srcTime = statSync(src).mtimeMs;
  for (const w of WIDTHS) {
    const out = join(OUT, file.replace(/\.jpg$/, `-${w}.webp`));
    if (existsSync(out) && statSync(out).mtimeMs >= srcTime) continue;
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(out);
    made++;
  }
}
console.log(`[Covers] webp-версий создано: ${made}`);
