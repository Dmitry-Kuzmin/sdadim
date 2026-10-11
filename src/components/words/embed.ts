/**
 * «Трасса» для других сайтов (migran.es, SkilyApp): один файл https://sdadim.eu/embed/trassa.js,
 * стили внутри. Правка игры здесь, в sdadim, — после деплоя её сразу получают все сайты.
 *
 *   const { mount } = await import("https://sdadim.eu/embed/trassa.js");
 *   const game = mount({ words: [{ id, es, ru }], onAnswer, onFinish, onExit });
 *   game.destroy();
 *
 * Игра открывается поверх страницы на весь экран: правила → поездка → итоги («Ещё раз» / «Выйти»).
 * Собирает scripts/build-embed.mjs (перед astro build). API — EmbedOptions, менять только совместимо:
 * на него завязаны чужие сайты.
 */
import type { Word } from "@/lib/words";
import type { Ctx, Summary } from "./trainer";
import { h } from "./dom";
import * as fx from "./fx";
import { road, ROAD_RULES } from "./road";
import css from "./road.css?inline";
import embedCss from "./embed.css?inline";

export type EmbedWord = { id?: string; es: string; ru: string; /** Тема: дистракторы берутся из неё. */ theme?: string };
export type EmbedResult = {
  score: number;
  correct: number;
  total: number;
  combo: number;
  best: number;
  mistakes: { id: string; es: string; ru: string }[];
};
export type EmbedOptions = {
  words: EmbedWord[];
  /** Каждый ответ — для прогресса слов на стороне сайта. */
  onAnswer?: (id: string, ok: boolean) => void;
  onFinish?: (r: EmbedResult) => void;
  /** Игрок закрыл игру (✕, Esc, «Выйти»). Слой уже убран. */
  onExit?: () => void;
  muted?: boolean;
  /** Ключ рекорда в localStorage сайта. */
  storageKey?: string;
};

export const version = 1;

let styled = false;
const style = () => {
  if (styled) return;
  styled = true;
  document.head.append(h("style", { "data-trassa": "" }, css + embedCss));
};

export function mount(o: EmbedOptions) {
  style();
  fx.setMuted(!!o.muted);
  const key = o.storageKey ?? "trassa:best";
  const words: Word[] = o.words
    .filter((w) => w.es && w.ru)
    .map((w) => ({ id: w.id ?? w.es, es: w.es, ru: w.ru, m: w.theme ?? "", q: 1 }) as Word);
  const root = h("div.r3-embed", { role: "dialog", "aria-modal": "true", "aria-label": "Трасса" });
  document.body.append(root);
  const overflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  let run = 0;
  let disposers: (() => void)[] = [];
  let keyFns: ((e: KeyboardEvent) => void)[] = [];
  const clear = () => {
    run++;
    disposers.forEach((f) => f());
    disposers = [];
    keyFns = [];
    root.replaceChildren();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return exit();
    keyFns.forEach((f) => f(e));
  };
  addEventListener("keydown", onKeyDown);

  const best = () => {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch {
      return 0;
    }
  };

  let gone = false;
  const destroy = () => {
    if (gone) return;
    gone = true;
    clear();
    removeEventListener("keydown", onKeyDown);
    root.remove();
    document.documentElement.style.overflow = overflow;
  };
  const exit = () => {
    destroy();
    o.onExit?.();
  };

  const card = (...kids: (Node | null)[]) => {
    clear();
    root.append(h("div.r3e-card", {}, ...kids));
    root.querySelector<HTMLElement>(".r3e-go")?.focus({ preventScroll: true });
  };

  const rules = () => {
    const b = best();
    card(
      h("div.r3e-icon", { "aria-hidden": "true" }, "🚗"),
      h("h2", {}, "Трасса"),
      h("ul", {}, ...ROAD_RULES.map(([icon, text]) => h("li", {}, h("span", { "aria-hidden": "true" }, icon), h("span", { html: text })))),
      b ? h("p.r3e-best", {}, `🏆 Ваш рекорд: ${b}`) : null,
      h("div.r3e-btns", {}, h("button.r3e-btn.is-ghost", { type: "button", onclick: exit }, "Выйти"), h("button.r3e-btn.r3e-go", { type: "button", onclick: play }, "Старт")),
    );
    keyFns.push((e) => e.key === "Enter" && (e.preventDefault(), play()));
  };

  const results = (s: Summary) => {
    const score = s.score ?? 0;
    const was = best();
    const top = Math.max(was, score);
    try {
      localStorage.setItem(key, String(top));
    } catch {}
    const mistakes = s.mistakes.map((w) => ({ id: w.id, es: w.es, ru: w.ru }));
    o.onFinish?.({ score, correct: s.correct, total: s.total, combo: s.combo ?? 0, best: top, mistakes });
    card(
      h("div.r3e-icon", { "aria-hidden": "true" }, score > was ? "🏆" : "🏁"),
      h("h2", {}, score > was && was ? "Новый рекорд!" : "Финиш"),
      h("p.r3e-score", {}, h("b", {}, String(score)), " очков"),
      h("p.r3e-sub", {}, `Верно ${s.correct} из ${s.total} · лучшая серия ${s.combo ?? 0}`),
      mistakes.length ? h("ul.r3e-miss", {}, ...mistakes.map((w) => h("li", {}, h("b", { lang: "es" }, w.es), " — ", w.ru))) : null,
      h("div.r3e-btns", {}, h("button.r3e-btn.is-ghost", { type: "button", onclick: exit }, "Выйти"), h("button.r3e-btn.r3e-go", { type: "button", onclick: play }, "Ещё раз")),
    );
    keyFns.push((e) => e.key === "Enter" && (e.preventDefault(), play()));
  };

  function play() {
    clear();
    const me = run;
    const live = () => !gone && me === run;
    const noop = () => {};
    const ctx = {
      stage: root,
      pool: words,
      all: words,
      p: { best: {} },
      setBar: noop,
      setHud: noop,
      setStreak: noop,
      segments: noop,
      mark: () => null,
      hudEl: root,
      again: true,
      answer: noop,
      arcadeAnswer: (w: Word, ok: boolean) => o.onAnswer?.(w.id, ok),
      finish: (s: Summary) => live() && results(s),
      onKey: (f: (e: KeyboardEvent) => void) => keyFns.push(f),
      later(fn: () => void, ms: number) {
        const t = setTimeout(() => live() && fn(), ms);
        disposers.push(() => clearTimeout(t));
      },
      alive: live,
      layer: (el: HTMLElement) => root.append(el),
      exit,
      muted: () => !!o.muted,
    } as unknown as Ctx;
    road(ctx);
  }

  if (words.length < 3) {
    card(h("h2", {}, "Трасса"), h("p.r3e-sub", {}, "Нужно хотя бы 3 слова."), h("div.r3e-btns", {}, h("button.r3e-btn.r3e-go", { type: "button", onclick: exit }, "Закрыть")));
  } else rules();

  return { destroy };
}
