#!/usr/bin/env node
/**
 * IndexNow (Bing, Яндекс, Seznam…): после прод-деплоя на Vercel пингует страницы,
 * изменённые последним коммитом. Локально и на preview — пропускает.
 */
import { execSync } from "node:child_process";

const HOST = "sdadim.eu";
const KEY = "bd4d5d860c3503096bc6c0a673b19e96"; // файл-подтверждение: public/bd4d5d860c3503096bc6c0a673b19e96.txt

if (process.env.VERCEL_ENV !== "production") {
  console.log("IndexNow: не прод-сборка Vercel — пропускаю");
  process.exit(0);
}

let changed = [];
try {
  changed = execSync("git diff --name-only HEAD~1 HEAD", { encoding: "utf8" }).trim().split("\n").filter(Boolean);
} catch {
  changed = ["src/pages/index.astro"];
}

const urls = new Set();
for (const f of changed) {
  const post = f.match(/^src\/content\/blog\/(.+)\.mdx$/);
  if (post) {
    urls.add(`https://${HOST}/blog/${post[1]}`);
    urls.add(`https://${HOST}/blog`);
  } else if (/^src\/(pages|layouts|components|data|lib)\//.test(f)) urls.add(`https://${HOST}/`);
}

if (!urls.size) {
  console.log("IndexNow: страницы не менялись");
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: [...urls] }),
}).catch((e) => ({ status: String(e) }));
console.log(`IndexNow: ${urls.size} URL → ${res.status}`);
