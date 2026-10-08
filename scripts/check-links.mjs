#!/usr/bin/env node
/**
 * Проверка собранного сайта: каждая внутренняя ссылка ведёт на существующую страницу,
 * каждый #якорь — на существующий id. Валит сборку, если что-то битое.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = join(process.cwd(), "dist");
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith(".html") && files.push(join(d, f))));
walk(DIST);

// URL страницы → файл (cleanUrls как на Vercel: /blog/x → blog/x.html)
const resolve = (path) => {
  if (path === "/" || path === "") return join(DIST, "index.html");
  const clean = path.replace(/\/$/, "");
  for (const c of [clean, `${clean}.html`, join(clean, "index.html")]) {
    const f = join(DIST, c);
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
};
const ids = new Map();
const idsOf = (f) => {
  if (!ids.has(f)) ids.set(f, new Set([...readFileSync(f, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(f);
};

const errors = [];
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const page = "/" + relative(DIST, file).replace(/(index)?\.html$/, "");
  for (const [, attr, url] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(url)) continue;
    const [path, hash] = url.split("#");
    const target = path ? resolve(decodeURI(path.split("?")[0])) : file;
    if (!target) {
      errors.push(`${page}: ${attr}="${url}" — нет такой страницы или файла`);
      continue;
    }
    if (hash && target.endsWith(".html") && !idsOf(target).has(decodeURIComponent(hash))) errors.push(`${page}: ссылка ${url} — нет якоря #${hash}`);
  }
}

if (errors.length) {
  console.error(`❌ [check-links] битые ссылки: ${errors.length}\n` + [...new Set(errors)].map((e) => "   " + e).join("\n"));
  process.exit(1);
}
console.log(`✅ [check-links] ${files.length} страниц, все внутренние ссылки и якоря живые`);
