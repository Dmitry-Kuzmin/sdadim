/**
 * Логика тренажёра слов без интерфейса: прогресс (Лейтнер), опыт, ранги, дневная цель, серия дней,
 * подбор слов для урока и неверных вариантов. Хранилище — localStorage; недоступно (приватный режим) —
 * тренажёр работает без сохранения.
 */
import type { Word } from "@/lib/words";

/** Слово в системе Лейтнера: b — коробка 0…5, d — когда повторить (ms), c/w — верно/ошибок. */
export type Card = { b: number; d: number; c: number; w: number };
export type Progress = {
  v: 1;
  cards: Record<string, Card>;
  xp: number;
  /** Дни занятий YYYY-MM-DD, последние 400. */
  days: string[];
  /** Опыт за сегодня — для дневной цели. */
  today: { d: string; xp: number };
  /** Рекорды игр: очки, а у «Пар» — лучшее время в секундах. */
  best: Record<string, number>;
  mute?: boolean;
};

const KEY = "sdadim-words:v1";
const DAY = 86_400_000;
/** Через сколько повторить слово из коробки b: 0 — в этой же сессии, дальше 1, 3, 7, 16, 35 дней. */
const INTERVAL = [0, 1, 3, 7, 16, 35].map((d) => d * DAY);
/** С какой коробки слово считается выученным. */
export const LEARNED = 3;
export const DAILY_GOAL = 50;

export const RANKS = [
  { xp: 0, name: "Пешеход", emoji: "🚶" },
  { xp: 100, name: "Ученик автошколы", emoji: "📘" },
  { xp: 300, name: "Новичок с «L»", emoji: "🔰" },
  { xp: 700, name: "Водитель", emoji: "🚗" },
  { xp: 1500, name: "Опытный водитель", emoji: "🏎️" },
  { xp: 3000, name: "Ас дорог", emoji: "🏆" },
  { xp: 6000, name: "Легенда DGT", emoji: "👑" },
];
export function rankOf(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const next = RANKS[i + 1];
  return { ...RANKS[i], i, next, frac: next ? (xp - RANKS[i].xp) / (next.xp - RANKS[i].xp) : 1 };
}

const today = () => new Date().toISOString().slice(0, 10);
const empty = (): Progress => ({ v: 1, cards: {}, xp: 0, days: [], today: { d: today(), xp: 0 }, best: {} });

export function load(): Progress {
  try {
    const p = { ...empty(), ...JSON.parse(localStorage.getItem(KEY) ?? "{}") } as Progress;
    if (p.today.d !== today()) p.today = { d: today(), xp: 0 };
    return p;
  } catch {
    return empty();
  }
}
export function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}
export const hasProgress = () => {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
};

/** Опыт + день занятий. */
export function addXp(p: Progress, xp: number) {
  const t = today();
  if (p.today.d !== t) p.today = { d: t, xp: 0 };
  p.today.xp += xp;
  p.xp += xp;
  if (p.days.at(-1) !== t) p.days = [...p.days, t].slice(-400);
}

/** Ответ по слову: верно — в следующую коробку, ошибка — в первую, повторить сразу. */
export function record(p: Progress, id: string, ok: boolean) {
  const c = p.cards[id] ?? { b: 0, d: 0, c: 0, w: 0 };
  const b = ok ? Math.min(5, c.b + 1) : 0;
  p.cards[id] = { b, d: Date.now() + INTERVAL[b], c: c.c + +ok, w: c.w + +!ok };
}

/** Сколько дней подряд занимались, включая сегодня (или вчера — серия ещё не прервана). */
export function streak(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(today())) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export const isLearned = (c?: Card) => !!c && c.b >= LEARNED;
export const isDue = (c?: Card, now = Date.now()) => !!c && c.d <= now;
/** Доля освоения набора: коробка 4+ = слово освоено полностью. */
export const mastery = (ids: string[], p: Progress) => (ids.length ? ids.reduce((s, id) => s + Math.min(4, p.cards[id]?.b ?? 0) / 4, 0) / ids.length : 0);

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Урок: сначала слова, которые пора повторить (ошибки — первыми), потом новые в порядке частоты
 * в экзамене, потом выученные — самые давние раньше.
 */
export function pickLesson(pool: Word[], p: Progress, size = 8): Word[] {
  const now = Date.now();
  const rank = (w: Word, i: number) => {
    const c = p.cards[w.id];
    if (c && c.d <= now) return c.b * 1000 + i;
    if (!c) return 100_000 + i;
    return 200_000 + c.d / DAY;
  };
  return pool
    .map((w, i) => ({ w, r: rank(w, i) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, size)
    .map((x) => x.w);
}

/**
 * Похожи ли переводы настолько, что оба можно счесть верными («дорога» и «дорога, шоссе»).
 * Такие не ставим рядом — это была бы нечестная ловушка.
 */
const parts = (s: string) =>
  s.toLowerCase().split(/[,;()/—–]|\s-\s/).map((x) => x.replace(/[¿?¡!.…«»"]/g, "").trim()).filter((x) => x.length >= 3);
export function similar(a: string, b: string): boolean {
  const pa = parts(a), pb = parts(b);
  return pa.some((x) => pb.some((y) => x === y || x.includes(y) || y.includes(x)));
}

/** Неверные варианты: сначала из той же темы, без синонимов верного. */
export function distractors(w: Word, all: Word[], field: "ru" | "es", n = 3): Word[] {
  const out: Word[] = [];
  const near = all.filter((x) => x.m === w.m);
  for (const src of [shuffle(near), shuffle(all)]) {
    for (const x of src) {
      if (out.length >= n) return out;
      if (x.id === w.id || similar(x.ru, w.ru) || x[field] === w[field] || out.some((o) => similar(o[field], x[field]) || similar(o.ru, x.ru))) continue;
      out.push(x);
    }
  }
  return out;
}

/** Сравнение без регистра и ударений: «arcen» = «arcén». */
export const bare = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Короткое слово — только с окончанием множественного числа («salvo» ≠ «salida»), длинное — любое окончание.
 *  Та же логика — в scripts/words-sync.mjs, которым подобраны примеры. */
const stem = (w: string) => {
  const e = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return w.length <= 5 ? `${e(w)}(?:s|es)?` : `${e(w.slice(0, -2))}[a-z]{0,4}`;
};

/**
 * Где слово стоит в предложении-примере: «vía» найдётся в «vías», «adelantar» — в «adelanta».
 * Возвращает [начало, конец] или null — тогда упражнение «Пропуск» это слово не берёт.
 */
export function findIn(sentence: string, es: string): [number, number] | null {
  // Одна буква → одна буква: позиции в «голом» тексте совпадают с исходным.
  const flat = [...sentence].map((ch) => bare(ch).charAt(0) || ch).join("");
  const words = bare(es).replace(/[¿?¡!.,]/g, "").split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const m = new RegExp(`(^|[^a-z])(${words.map(stem).join("\\s+")})(?![a-z])`, "i").exec(flat);
  if (!m) return null;
  const start = m.index + m[1].length;
  return [start, start + m[2].length];
}
