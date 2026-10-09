#!/usr/bin/env node
/**
 * Словарь SkilyApp → тренажёр слов /ispanskij-dlya-dgt.
 *
 *   npm run words:sync
 *
 * Общая база — словарь SkilyApp (public.language_terms, та же Supabase, что и штрафы). Скрипт пишет снимок,
 * поэтому сайт не зависит от базы ни при сборке, ни в браузере:
 *   src/data/words.json          [{ id, es, ru, d, m, q, ex?, h?, img? }] — от частых в вопросах DGT к редким
 *   src/data/words-sync.json     дата последнего изменения словаря (lastmod в sitemap)
 *   public/img/slova/<id>.webp   картинка со знаком sdadim.eu (качается, только если её нет, она поменялась
 *                                в SkilyApp или поменялся знак — WM)
 * id строится из испанского написания: на нём держится прогресс учеников — не менять termId().
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const r = (p) => new URL(p, import.meta.url);
const OUT = r("../src/data/words.json");
const META = r("../src/data/words-images.json");
const IMG_DIR = r("../public/img/slova/");

/** Версия знака: поменял его вид — подними число, и все картинки перекачаются. */
const WM = 1;
/** Ширина картинки на сайте: в тренажёре и списке она не бывает шире 640 px. */
const W = 640;

export const termId = (es) =>
  es.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const env = Object.fromEntries(
  readFileSync(r("../.env"), "utf8").split("\n").map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()])
);
const URL_ = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/**
 * Знак sdadim.eu — полупрозрачный, по центру нижней трети: угол на ровном фоне затирается в один клик
 * и обрезается при object-fit: cover, центр — нет. Белый с тенью читается и на светлом, и на тёмном.
 */
function mark(width) {
  const k = width / 640;
  const icon = Math.round(30 * k), fs = Math.round(24 * k), gap = Math.round(8 * k), pad = Math.round(10 * k);
  const w = Math.round(pad * 2 + icon + gap + fs * 4.9), h = Math.round(icon + 20 * k);
  return {
    w, h,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><filter id="s" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="${k}" stdDeviation="${(2.5 * k).toFixed(1)}" flood-color="#000" flood-opacity=".55"/></filter></defs>
      <g opacity=".6" filter="url(#s)">
        <rect x="${pad}" y="${(h - icon) / 2}" width="${icon}" height="${icon}" rx="${Math.round(icon * 0.24)}" fill="#2563eb"/>
        <text x="${pad + icon / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="${Math.round(icon * 0.62)}" fill="#fff">S</text>
        <text x="${pad + icon + gap}" y="${h / 2}" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="${fs}" fill="#fff">sdadim.eu</text>
      </g>
    </svg>`,
  };
}

async function watermark(buf) {
  const img = sharp(buf).resize({ width: W, withoutEnlargement: true });
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  const m = mark(info.width);
  return sharp(data)
    .composite([{ input: Buffer.from(m.svg), left: Math.round((info.width - m.w) / 2), top: Math.round(info.height * 0.72 - m.h / 2) }])
    .webp({ quality: 74 })
    .toBuffer();
}

const rows = [];
for (let from = 0; ; from += 1000) {
  const res = await fetch(`${URL_}/rest/v1/language_terms?select=*&order=term_es`, { headers: { ...headers, Range: `${from}-${from + 999}` } });
  if (!res.ok) throw new Error(`language_terms: ${res.status} ${await res.text()}`);
  const page = await res.json();
  rows.push(...page);
  if (page.length < 1000) break;
}

/**
 * Пример — целый вопрос экзамена со словом: в словаре SkilyApp примеры часто обрезаны («Esta señal:…»),
 * а игры «Собери вопрос» и «Пропуск» работают с полным предложением. Только бесплатные вопросы
 * (is_premium = false): платная база SkilyApp на сайт не попадает. Публичный ключ и так отдаёт только их.
 */
const questions = [];
for (let from = 0; ; from += 1000) {
  const res = await fetch(`${URL_}/rest/v1/questions_new?select=question_es,question_ru,is_premium&country=eq.es&is_premium=eq.false&question_es=not.is.null&order=id`, {
    headers: { ...headers, Range: `${from}-${from + 999}` },
  });
  if (!res.ok) throw new Error(`questions_new: ${res.status} ${await res.text()}`);
  const page = await res.json();
  questions.push(...page.filter((q) => q.is_premium === false && q.question_ru));
  if (page.length < 1000) break;
}
const flat = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const full = questions
  .map((q) => ({ es: q.question_es.replace(/\s+/g, " ").trim(), ru: q.question_ru.replace(/\s+/g, " ").trim() }))
  .filter((q) => /[?.]$/.test(q.es) && !/…|\.\.\./.test(q.es) && !/[:]$/.test(q.es))
  .map((q) => ({ ...q, n: q.es.split(" ").length, low: flat(q.es) }))
  .filter((q) => q.n >= 5 && q.n <= 24);
/** Как stem() в engine.ts: короткое слово — только с окончанием множественного числа, длинное — любое окончание. */
const stem = (w) => {
  const e = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return w.length <= 5 ? `${e(w)}(?:s|es)?` : `${e(w.slice(0, -2))}[a-z]{0,4}`;
};
/** Как engine.findIn: слово целиком, у каждого слова — любое окончание (vía → vías, adelantar → adelanta). */
const pattern = (es) =>
  new RegExp(`(^|[^a-z])${flat(es).replace(/[¿?¡!.,]/g, "").split(/\s+/).map(stem).join("\\s+")}(?![a-z])`);
/** Лучший пример: длина ближе к 12 словам, и один вопрос не повторяется у многих слов. */
const used = new Map();
function example(es) {
  const re = pattern(es);
  const hits = full.filter((q) => re.test(q.low));
  if (!hits.length) return undefined;
  const best = hits.sort((a, b) => Math.abs(a.n - 12) + 4 * (used.get(a.es) ?? 0) - (Math.abs(b.n - 12) + 4 * (used.get(b.es) ?? 0)))[0];
  used.set(best.es, (used.get(best.es) ?? 0) + 1);
  return { es: best.es, ru: best.ru };
}

const prev = existsSync(META) ? JSON.parse(readFileSync(META, "utf8")) : {};
const meta = {};
mkdirSync(IMG_DIR, { recursive: true });
const clean = (s) => s?.replace(/\s+/g, " ").trim() || undefined;
const seen = new Set();
const out = [];
let fetched = 0;

for (const s of rows) {
  if (!s.module || !s.term_es || !s.term_ru) continue;
  const id = termId(s.term_es);
  if (seen.has(id)) continue;
  seen.add(id);
  const w = { id, es: clean(s.term_es), ru: clean(s.term_ru), d: clean(s.description_ru), m: s.module, q: s.q_count ?? 0 };
  const own = s.example_es && s.example_ru && !/…|\.\.\.|:$/.test(s.example_es.trim()) ? { es: clean(s.example_es), ru: clean(s.example_ru) } : undefined;
  const ex = (w.es.length > 2 && example(w.es)) || own;
  if (ex) w.ex = ex;
  if (s.hint_ru) w.h = clean(s.hint_ru);
  if (s.image_url) {
    const file = new URL(`${id}.webp`, IMG_DIR);
    // Дорожные знаки — официальные и общие: знак sdadim на них только мешает читать знак.
    const sign = s.image_url.includes("/road-signs/");
    const wm = sign ? 0 : WM;
    if (prev[id]?.src !== s.image_url || prev[id]?.wm !== wm || !existsSync(file)) {
      const res = await fetch(s.image_url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(file, sign ? await sharp(buf).resize({ width: 320, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer() : await watermark(buf));
        fetched++;
      } else console.warn(`! ${s.term_es}: картинка ${res.status}`);
    }
    if (existsSync(file)) {
      w.img = sign ? "sign" : "pic";
      meta[id] = { src: s.image_url, wm };
    }
  }
  out.push(w);
}

out.sort((a, b) => b.q - a.q || a.es.localeCompare(b.es, "es"));
const json = JSON.stringify(out, null, 0).replace(/\},\{/g, "},\n{") + "\n";
// Дата изменения словаря — lastmod страниц тренажёра в sitemap. Меняется, только если слова правда поменялись.
const SYNCED = r("../src/data/words-sync.json");
if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== json || !existsSync(SYNCED)) {
  writeFileSync(SYNCED, JSON.stringify({ date: new Date().toISOString().slice(0, 10) }) + "\n");
}
writeFileSync(OUT, json);
writeFileSync(META, JSON.stringify(meta, null, 0).replace(/\},"/g, '},\n"') + "\n");
console.log(`✓ ${out.length} слов → src/data/words.json, с картинкой ${out.filter((w) => w.img).length}, скачано ${fetched}`);
console.log(`  примеры: ${out.filter((w) => w.ex).length} (из ${full.length} бесплатных вопросов экзамена)`);
