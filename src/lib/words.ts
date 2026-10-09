/**
 * Тренажёр слов «Испанский для DGT» (/ispanskij-dlya-dgt) — данные для страниц при сборке.
 *
 *   src/data/words.json        слова из словаря SkilyApp ← npm run words:sync (от частых к редким)
 *   src/data/word-sets.ts      темы — пишем руками
 *   src/data/word-questions.json вопросы DGT со словом для его страницы ← npm run words:sync
 *   public/img/slova/<id>.webp картинки со знаком sdadim.eu ← npm run words:sync
 *
 * Игры получают слова из /ispanskij-dlya-dgt/slovar.bin (src/pages/ispanskij-dlya-dgt/slovar.bin.ts),
 * а не из HTML: так страница темы лёгкая, а «Тренировка дня» видит весь словарь.
 */
import raw from "@/data/words.json";
import rawQs from "@/data/word-questions.json";
import { TOP_SIZE, WORD_SETS, type WordSet } from "@/data/word-sets";
import { markWord } from "@/lib/watermark";

export type Word = {
  id: string;
  es: string;
  ru: string;
  /** Толкование по-русски. */
  d?: string;
  /** module SkilyApp → тема. */
  m: string;
  /** В скольких вопросах экзамена DGT встречается. */
  q: number;
  /** Пример из настоящего вопроса DGT. */
  ex?: { es: string; ru: string };
  /** Ловушка или разница значений. */
  h?: string;
  img?: "pic" | "sign";
};

/** Настоящий бесплатный вопрос DGT: ответы в порядке экзамена, ровно один верный, объяснение по-русски. */
export type ExamQuestion = {
  id: string;
  es: string;
  ru: string;
  a: { es: string; ru: string; ok?: boolean }[];
  x?: string;
  /** Картинка вопроса [ширина, высота] — /img/voprosy/<id>.webp. */
  img?: [number, number];
};

export const BASE = "/ispanskij-dlya-dgt";
/** С водяным знаком в русских полях (src/lib/watermark.ts) — и в HTML, и в данных для игр. */
export const WORDS = (raw as Word[]).map(markWord);
export const wordImg = (id: string) => `/img/slova/${id}.webp`;
export const qImg = (id: string) => `/img/voprosy/${id}.webp`;
export const setUrl = (s: WordSet) => `${BASE}/${s.slug}`;
export const wordUrl = (w: Word) => `${BASE}/slovo/${w.id}`;
/** «arcén» → «Arcén»: заголовки и подписи. */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Слова темы — от частых в экзамене к редким. */
export const setWords = (s: WordSet): Word[] => (s.module === "top" ? WORDS.slice(0, TOP_SIZE) : WORDS.filter((w) => w.m === s.module));

/** Основная тема слова (не сборная «топ»): из неё хлебные крошки и «похожие слова». */
const BY_MODULE = new Map(WORD_SETS.filter((s) => s.module !== "top").map((s) => [s.module, s]));
export const wordSet = (w: Word) => BY_MODULE.get(w.m)!;

/**
 * Своя страница — только у слова, о котором есть что сказать: оно встречается в вопросах экзамена
 * или у него есть пример из вопроса. Остальные живут в списке темы — без «тонких» страниц.
 */
export const hasPage = (w: Word) => w.q > 0 || !!w.ex;
export const PAGE_WORDS = WORDS.filter(hasPage);

/** До 3 вопросов экзамена со словом — для его страницы; первый совпадает с примером ex. */
const QS = rawQs as Record<string, ExamQuestion[]>;
export const wordQuestions = (w: Word): ExamQuestion[] => QS[w.id] ?? [];

/** Соседи по теме для «Похожих слов»: ближайшие по частоте, со своей страницей. */
export function related(w: Word, n = 8): Word[] {
  const same = WORDS.filter((x) => x.m === w.m && x.id !== w.id && hasPage(x));
  const i = WORDS.indexOf(w);
  return same.sort((a, b) => Math.abs(WORDS.indexOf(a) - i) - Math.abs(WORDS.indexOf(b) - i)).slice(0, n);
}

/** Место слова по частоте во всём экзамене: 1 — самое частое. */
export const rank = (w: Word) => WORDS.indexOf(w) + 1;

export const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return `${n} ${a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many}`;
};

export { WORD_SETS, type WordSet };
