/**
 * Тексты «Трассы» на двух языках. Язык ставит embed.ts (`mount({ lang })`) на время игры;
 * без него — русский, как на sdadim.eu. Испанские реплики игры («¿Qué significa?», «¡Vamos!», «Nivel») не переводим:
 * это часть декораций, как на настоящей трассе.
 */
export type RoadLang = "ru" | "en";

const T = {
  ru: {
    title: "Трасса",
    rule1: "Испанское слово — на синем указателе, переводы — на табличках над тремя полосами.",
    rule2: "Перестройтесь в полосу с <b>правильным переводом</b>: ← → на клавиатуре, свайп или тап по полосе.",
    rule3: "Три жизни. Сначала времени много, с каждым словом дорога <b>быстрее</b>.",
    best: "Ваш рекорд",
    exit: "Выйти",
    start: "Старт",
    again: "Ещё раз",
    close: "Закрыть",
    newRecord: "Новый рекорд!",
    finish: "Финиш",
    score: (n: number) => ` ${plural(n, "очко", "очка", "очков")}`,
    summary: (c: number, t: number, s: number) => `Верно ${c} из ${t} · лучшая серия ${s}`,
    needWords: "Нужно хотя бы 3 слова.",
    pts: "очков",
    kmh: "км/ч",
    left: "Влево",
    right: "Вправо",
    scene: "Трасса: выберите полосу с правильным переводом",
    say: "Произнести",
    streakToast: (n: number) => `Серия ${n}!`,
    streakAria: (n: number) => `Серия: ${n} подряд`,
    ready: "Приготовьтесь",
  },
  en: {
    title: "Road Run",
    rule1: "The Spanish word is on the blue road sign. The translations are on the signs above the three lanes.",
    rule2: "Switch to the lane with the <b>right translation</b>: arrow keys, swipe, or tap a lane.",
    rule3: "You have three lives. The road starts slow, then gets <b>faster</b> with every word.",
    best: "Your best",
    exit: "Exit",
    start: "Start",
    again: "Play again",
    close: "Close",
    newRecord: "New record!",
    finish: "Finish!",
    score: (n: number) => (n === 1 ? " point" : " points"),
    summary: (c: number, t: number, s: number) => `${c} of ${t} correct · best streak ${s}`,
    needWords: "You need at least 3 words to play.",
    pts: "points",
    kmh: "km/h",
    left: "Left",
    right: "Right",
    scene: "Road Run: pick the lane with the correct translation",
    say: "Hear the word",
    streakToast: (n: number) => `${n} in a row!`,
    streakAria: (n: number) => `${n} correct in a row`,
    ready: "Get ready",
  },
} as const;

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
}

let lang: RoadLang = "ru";
export const setRoadLang = (l: RoadLang) => void (lang = l);
export const roadLang = () => lang;
export const tr = () => T[lang];
