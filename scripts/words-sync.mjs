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
 *   src/data/word-questions.json { id: [вопрос с ответами, объяснением и картинкой] } — до 3 вопросов DGT
 *                                со словом для его страницы (только сборка, в браузер не уходит)
 *   public/img/voprosy/<id>.webp картинка вопроса целиком (без обрезки — на ней бывают знаки); знак Skily
 *                                на ней уже есть, свой не ставим
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
const Q_DIR = r("../public/img/voprosy/");

/** Версия знака: поменял его вид — подними число, и все картинки перекачаются. */
const WM = 3;
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
        <g transform="translate(${pad + icon / 2} ${h / 2 + icon * 0.02}) scale(${(icon * 0.66) / 24}) translate(-12 -12)" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" fill="#fff"/>
          <path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
        </g>
        <text x="${pad + icon + gap}" y="${h / 2}" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="${fs}" fill="#fff">sdadim.eu</text>
      </g>
    </svg>`,
  };
}

/**
 * У части картинок SkilyApp рисунок лежит посреди серой рамки — её обрезаем. Рамка — это отступ со всех
 * четырёх сторон и примерно одинаковый слева/справа и сверху/снизу. Однотонный белый фон иллюстрации
 * (машины у верхнего края, пустота снизу) рамкой не считается — такую картинку не трогаем.
 */
async function trimmed(buf) {
  const src = await sharp(buf).metadata();
  const { data, info } = await sharp(buf).trim({ threshold: 14 }).toBuffer({ resolveWithObject: true });
  const l = -(info.trimOffsetLeft ?? 0), t = -(info.trimOffsetTop ?? 0);
  const r = src.width - l - info.width, b = src.height - t - info.height;
  const framed = Math.min(l, r) >= src.width * 0.03 && Math.min(t, b) >= src.height * 0.03
    && Math.abs(l - r) <= src.width * 0.05 && Math.abs(t - b) <= src.height * 0.05;
  return framed ? data : buf;
}

/** Картинка слова — кадр 4:3 со знаком sdadim.eu по центру. */
async function watermark(buf) {
  const img = sharp(await trimmed(buf)).resize({ width: W, height: Math.round((W * 3) / 4), fit: "cover" });
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  const m = mark(info.width);
  return sharp(data)
    .composite([{ input: Buffer.from(m.svg), left: Math.round((info.width - m.w) / 2), top: Math.round(info.height * 0.72 - m.h / 2) }])
    .webp({ quality: 74 })
    .toBuffer();
}

const rows = [];
for (let from = 0; ; from += 1000) {
  const res = await fetch(`${URL_}/rest/v1/language_terms?select=id,term_es,term_ru,term_en,description_es,description_ru,description_en,hint_ru,hint_en,example_es,example_ru,example_en,difficulty,category,image_url,audio_url,module,q_count,aliases,topic_id,created_at,updated_at&order=term_es`, { headers: { ...headers, Range: `${from}-${from + 999}` } });
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
  const res = await fetch(`${URL_}/rest/v1/questions_new?select=id,question_es,question_ru,explanation_ru,image_url,is_premium&country=eq.es&is_premium=eq.false&question_es=not.is.null&order=id`, {
    headers: { ...headers, Range: `${from}-${from + 999}` },
  });
  if (!res.ok) throw new Error(`questions_new: ${res.status} ${await res.text()}`);
  const page = await res.json();
  questions.push(...page.filter((q) => q.is_premium === false && q.question_ru));
  if (page.length < 1000) break;
}
const flat = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const all = questions
  .map((q) => ({ id: q.id, es: q.question_es.replace(/\s+/g, " ").trim(), ru: q.question_ru.replace(/\s+/g, " ").trim(), x: q.explanation_ru, src: q.image_url }))
  .map((q) => ({ ...q, n: q.es.split(" ").length, low: flat(q.es) }));
const full = all
  .filter((q) => /[?.]$/.test(q.es) && !/…|\.\.\./.test(q.es) && !/[:]$/.test(q.es))
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
/**
 * Вопросы для страницы слова — из всех бесплатных (с картинкой, как на экзамене, поэтому годятся и
 * «¿Qué indica esta señal?»): первый — тот же, что в примере, дальше — ближе к 12 словам.
 */
const pageQs = new Map();
function pageQuestions(w) {
  if (w.es.length <= 2) return [];
  const re = pattern(w.es);
  const first = w.ex && all.find((q) => q.es === w.ex.es);
  const rest = all.filter((q) => q !== first && re.test(q.low)).sort((a, b) => Math.abs(a.n - 12) - Math.abs(b.n - 12));
  return [first, ...rest].filter(Boolean).slice(0, 3);
}
function example(es) {
  const re = pattern(es);
  const hits = full.filter((q) => re.test(q.low));
  if (!hits.length) return undefined;
  hits.sort((a, b) => Math.abs(a.n - 12) + 4 * (used.get(a.es) ?? 0) - (Math.abs(b.n - 12) + 4 * (used.get(b.es) ?? 0)));
  const best = hits[0];
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
  const qs = pageQuestions(w);
  if (qs.length) pageQs.set(id, qs);
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

// Ответы к вопросам страниц слов — одной выборкой по id (порциями: длина адреса ограничена).
const qIds = [...new Set([...pageQs.values()].flat().map((q) => q.id))];
const answers = new Map();
for (let i = 0; i < qIds.length; i += 150) {
  const res = await fetch(`${URL_}/rest/v1/answer_options?select=question_id,text_es,text_ru,is_correct,position&question_id=in.(${qIds.slice(i, i + 150).join(",")})&order=position`, { headers });
  if (!res.ok) throw new Error(`answer_options: ${res.status} ${await res.text()}`);
  for (const a of await res.json()) {
    if (!answers.has(a.question_id)) answers.set(a.question_id, []);
    answers.get(a.question_id).push({ es: clean(a.text_es), ru: clean(a.text_ru), ok: a.is_correct || undefined });
  }
}
// Картинки вопросов: качаются один раз (или когда поменялись в SkilyApp), размер — для width/height на странице.
mkdirSync(Q_DIR, { recursive: true });
const qImg = new Map();
let qFetched = 0;
for (const q of all.filter((q) => q.src && qIds.includes(q.id))) {
  const file = new URL(`${q.id}.webp`, Q_DIR);
  const key = `q:${q.id}`;
  if (prev[key]?.src === q.src && prev[key]?.wm === 1 && existsSync(file)) {
    meta[key] = prev[key];
  } else {
    const res = await fetch(q.src);
    if (!res.ok) { console.warn(`! вопрос ${q.id}: картинка ${res.status}`); continue; }
    const { data: webp, info } = await sharp(await trimmed(Buffer.from(await res.arrayBuffer())))
      .resize({ width: W, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toBuffer({ resolveWithObject: true });
    const [w, h] = [info.width, info.height];
    writeFileSync(file, webp);
    meta[key] = { src: q.src, wm: 1, w, h };
    qFetched++;
  }
  qImg.set(q.id, [meta[key].w, meta[key].h]);
}
const wq = {};
for (const w of out) {
  const qs = (pageQs.get(w.id) ?? [])
    .map((q) => ({ id: q.id, es: q.es, ru: q.ru, a: answers.get(q.id) ?? [], x: clean(q.x), img: qImg.get(q.id) }))
    .filter((q) => q.a.length >= 2 && q.a.filter((a) => a.ok).length === 1 && q.a.every((a) => a.es && a.ru));
  if (qs.length) wq[w.id] = qs;
}
writeFileSync(r("../src/data/word-questions.json"), JSON.stringify(wq) + "\n");
writeFileSync(META, JSON.stringify(meta, null, 0).replace(/\},"/g, '},\n"') + "\n");
console.log(`✓ ${out.length} слов → src/data/words.json, с картинкой ${out.filter((w) => w.img).length}, скачано ${fetched}, вопросов для страниц ${Object.values(wq).flat().length} у ${Object.keys(wq).length} слов (картинок скачано ${qFetched})`);
console.log(`  примеры: ${out.filter((w) => w.ex).length} (из ${full.length} бесплатных вопросов экзамена)`);
