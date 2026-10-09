/**
 * Тренажёр слов: полноэкранный оверлей поверх страницы. Грузится по первому клику на кнопку
 * с data-play="<игра>" и data-module="<module темы | top>" (см. Trainer.astro). «Назад» в браузере закрывает игру.
 *
 * Игры-упражнения (тренировка дня, конструктор, собери вопрос, пропуск, на слух) пишут ответы
 * в интервальное повторение. Аркады (трасса, радар, пары) — только опыт и рекорды:
 * угадывание на скорости — слабое доказательство, что слово выучено.
 */
import type { Word } from "@/lib/words";
import { skilyUrl } from "@/lib/skily";
import { MODES, type ModeId } from "./modes";
import * as E from "./engine";
import * as fx from "./fx";
import { radar, pairs } from "./arcade";
import { road } from "./road";
import { h, picture } from "./dom";
import { loadWords } from "./data";

export type Summary = {
  correct: number;
  total: number;
  mistakes: Word[];
  xp: number;
  /** Аркады: очки (у «Пар» — секунды, меньше = лучше). */
  score?: number;
  scoreLabel?: string;
  lowerBetter?: boolean;
  /** Лучшая серия верных ответов подряд. */
  combo?: number;
};

export type Ctx = {
  stage: HTMLElement;
  pool: Word[];
  all: Word[];
  p: E.Progress;
  setBar(frac: number): void;
  setHud(html: string): void;
  /** Бейдж серии с огоньком в шапке (с 2 подряд). */
  setStreak(n: number): void;
  /** Прогресс из n капсул вместо сплошной полосы; mark() красит капсулу и возвращает её — цель для искр. */
  segments(n: number): void;
  mark(i: number, state: "cur" | "ok" | "bad" | "done"): HTMLElement | null;
  /** Элемент счёта в шапке — цель для искр в аркадах. */
  hudEl: HTMLElement;
  /** Запуск по «Ещё раз»: аркады пропускают экран правил. */
  again: boolean;
  /** Ответ по слову: интервальное повторение + опыт. */
  answer(w: Word, ok: boolean): void;
  finish(s: Summary): void;
  /** Клавиатура и таймеры, которые снимаются при выходе из игры. */
  onKey(fn: (e: KeyboardEvent) => void): void;
  later(fn: () => void, ms: number): void;
  alive(): boolean;
  /** Полноэкранный слой поверх шапки тренажёра (Трасса); снимается при выходе из игры. */
  layer(el: HTMLElement): void;
  /** Закрыть тренажёр. */
  exit(): void;
  muted(): boolean;
};

/* ─── Данные ─────────────────────────────────────────────── */

function poolFor(all: Word[], module?: string) {
  if (module === "top") return all.slice(0, 100);
  if (module) return all.filter((w) => w.m === module);
  // Весь словарь: сначала слова, которые встречаются в экзамене.
  return all.filter((w) => w.q > 0);
}

/* ─── Оверлей ────────────────────────────────────────────── */

let root: HTMLElement | null = null;
let disposers: (() => void)[] = [];
/** Клавиши текущего упражнения: один обработчик на урок, шаг подменяет его. */
let stepKey: ((e: KeyboardEvent) => void) | null = null;
const cleanup = () => {
  stepKey = null;
  disposers.forEach((d) => d());
  disposers = [];
  speechSynthesis?.cancel();
};

function close(fromHistory = false) {
  if (!root) return;
  cleanup();
  root.remove();
  root = null;
  document.documentElement.classList.remove("wt-open");
  if (!fromHistory && history.state?.wt) history.back();
  document.dispatchEvent(new CustomEvent("words:progress"));
}
addEventListener("popstate", () => root && close(true));

export async function open(mode: ModeId, module?: string, only?: Word[], again = false) {
  if (!root) {
    root = h("div.wt", { role: "dialog", "aria-modal": "true", "aria-label": "Тренажёр слов" });
    document.body.append(root);
    document.documentElement.classList.add("wt-open");
    history.pushState({ wt: 1 }, "");
  }
  cleanup();
  const p = E.load();
  fx.setMuted(!!p.mute);
  root.replaceChildren(h("div.wt-loading", {}, "Загружаем слова…"));
  const all = await loadWords().catch(() => null);
  if (!root) return;
  if (!all) {
    root.replaceChildren(h("div.wt-loading", {}, "Не удалось загрузить слова. Проверьте интернет и попробуйте ещё раз."), h("button.wt-btn", { onclick: () => close() }, "Закрыть"));
    return;
  }
  const info = MODES.find((m) => m.id === mode)!;
  const pool = only ?? poolFor(all, module);

  const bar = h("i");
  const hud = h("div.wt-hud");
  const muteBtn = h("button.wt-icon", { type: "button", "aria-label": "Звук", title: "Звук" }, p.mute ? "🔇" : "🔊");
  muteBtn.onclick = () => {
    p.mute = !p.mute;
    fx.setMuted(p.mute);
    muteBtn.textContent = p.mute ? "🔇" : "🔊";
    E.save(p);
  };
  const stage = h("main.wt-stage");
  const barBox = h("div.wt-bar", {}, bar);
  const streakEl = h("span.wt-streak", { "aria-live": "polite" });
  root.replaceChildren(
    h("header.wt-top", {}, h("button.wt-icon", { type: "button", "aria-label": "Закрыть", title: "Закрыть (Esc)", onclick: () => close() }, "✕"), h("div.wt-title", {}, `${info.emoji} ${info.title}`), barBox, streakEl, hud, muteBtn),
    stage,
  );
  root.dataset.mode = mode;

  let live = true;
  disposers.push(() => (live = false));
  const keyFns: ((e: KeyboardEvent) => void)[] = [];
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.target instanceof HTMLInputElement) return;
    keyFns.forEach((f) => f(e));
  };
  addEventListener("keydown", onKeyDown);
  disposers.push(() => removeEventListener("keydown", onKeyDown));

  const ctx: Ctx = {
    stage,
    pool,
    all,
    p,
    setBar: (f) => (bar.style.width = `${Math.round(Math.min(1, f) * 100)}%`),
    setHud: (html) => (hud.innerHTML = html),
    setStreak(n) {
      const prev = Number(streakEl.dataset.n || 0);
      streakEl.dataset.n = String(n);
      streakEl.dataset.tier = n >= 10 ? "hot" : n >= 6 ? "warm" : n >= 3 ? "mild" : n >= 2 ? "seed" : "";
      streakEl.innerHTML = n >= 2 ? `<b aria-hidden="true">🔥</b><span>${n}</span>` : "";
      streakEl.setAttribute("aria-label", n >= 2 ? `Серия: ${n} подряд` : "");
      if (n > prev && n >= 2) fx.pop(streakEl);
    },
    segments(n) {
      barBox.classList.add("is-seg");
      barBox.replaceChildren(...Array.from({ length: n }, () => h("span")));
    },
    mark(i, state) {
      const seg = barBox.children[i] as HTMLElement | undefined;
      if (!seg) return null;
      seg.className = `is-${state}`;
      return seg;
    },
    hudEl: hud,
    again,
    answer(w, ok) {
      E.record(p, w.id, ok);
      E.addXp(p, ok ? 10 : 2);
      E.save(p);
    },
    finish: (s) => live && results(mode, module, s, p),
    onKey: (f) => keyFns.push(f),
    later(fn, ms) {
      const t = setTimeout(() => live && fn(), ms);
      disposers.push(() => clearTimeout(t));
    },
    alive: () => live,
    layer(el) {
      root!.append(el);
      disposers.push(() => el.remove());
    },
    exit: () => close(),
    muted: () => !!p.mute,
  };
  ({ daily, build: exercises, phrase: exercises, gap: exercises, listen: exercises, road, radar, pairs })[mode](ctx, mode);
}

/* ─── Итоги ──────────────────────────────────────────────── */

function results(mode: ModeId, module: string | undefined, s: Summary, p: E.Progress) {
  cleanup();
  const stage = root?.querySelector<HTMLElement>(".wt-stage");
  if (!stage) return;
  root!.querySelector<HTMLElement>(".wt-bar")!.classList.remove("is-seg");
  root!.querySelector<HTMLElement>(".wt-bar")!.replaceChildren(h("i", { style: "width:100%" }));
  root!.querySelector(".wt-hud")!.innerHTML = "";
  root!.querySelector(".wt-streak")!.innerHTML = "";

  // Опыт упражнений уже начислен по словам; аркадам — сейчас, за очки.
  const xpBefore = s.score != null ? p.xp : p.xp - s.xp;
  const rankBefore = E.rankOf(xpBefore);
  const goalBefore = p.today.xp - (s.score != null ? 0 : s.xp) >= E.DAILY_GOAL;
  if (s.score != null) E.addXp(p, s.xp);
  const prev = p.best[mode];
  let record = false;
  if (s.score != null) {
    const better = prev == null ? s.score > 0 : s.lowerBetter ? s.score < prev : s.score > prev;
    if (better) p.best[mode] = s.score;
    // Первая игра — ещё не рекорд: празднуем, только когда побит прошлый результат.
    record = better && prev != null;
  }
  E.save(p);
  const rank = E.rankOf(p.xp);
  const levelUp = rank.i > rankBefore.i;
  const goalNow = !goalBefore && p.today.xp >= E.DAILY_GOAL;
  const acc = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  const perfect = s.total > 0 && s.correct === s.total;
  const arcade = s.score != null;

  const tone = levelUp || record ? "gold" : perfect || acc >= 70 ? "ok" : "calm";
  const title = levelUp ? "Новый ранг!" : record ? "Новый рекорд!" : perfect ? "Без единой ошибки!" : acc >= 70 ? "Отличный результат" : acc >= 40 ? "Неплохо, но можно лучше" : "Слова ещё новые — повторим";
  const emoji = levelUp ? rank.emoji : record ? "🏆" : perfect ? "🌟" : acc >= 70 ? "🎉" : "💪";
  const celebrate = levelUp || record || perfect || goalNow;

  // Главное число: очки (секунды) в аркаде, точность — в упражнениях.
  const big = h("b.wt-res-big", {}, "0");
  const fmtBig = (n: number) => (arcade ? (s.lowerBetter ? n.toFixed(1) : String(Math.round(n))) : `${Math.round(n)}%`);
  const bigVal = arcade ? s.score! : acc;
  const sub = arcade
    ? record
      ? `было ${prev}${s.lowerBetter ? " с" : ""}`
      : prev != null
        ? `рекорд — ${p.best[mode]}${s.lowerBetter ? " с" : ""}`
        : s.scoreLabel ?? "очков"
    : `${s.correct} из ${s.total} верно`;

  const chip = (icon: string, text: string, cls = "") => h("span.wt-chip" + cls, {}, h("span", { "aria-hidden": "true" }, icon), text);
  const xpNum = h("span", {}, "+0");
  const xpChip = h("span.wt-chip.is-xp", {}, h("span", { "aria-hidden": "true" }, "⚡"), xpNum, " XP");
  const chips = h(
    "div.wt-chips",
    {},
    xpChip,
    arcade && s.total ? chip("🎯", `${s.correct}/${s.total} верно`) : null,
    s.combo && s.combo >= 3 ? chip("🔥", `серия ${s.combo}`) : null,
  );

  // Ранг: полоса докручивается от «было» к «стало».
  const fill = h("i", { style: `width:${Math.round((levelUp ? 0 : rankBefore.frac) * 100)}%` });
  const goalFrac = Math.min(1, p.today.xp / E.DAILY_GOAL);
  const goal = h(
    "div.wt-goal" + (goalFrac >= 1 ? ".is-done" : ""),
    { style: `--f:${goalFrac}`, title: "Цель дня" },
    h("span", {}, goalFrac >= 1 ? "✓" : `${Math.round(goalFrac * 100)}%`),
  );
  const progress = h(
    "div.wt-res-rank",
    {},
    h("span.wt-res-rank-emoji", { "aria-hidden": "true" }, rank.emoji),
    h(
      "div.wt-res-rank-body",
      {},
      h("div", {}, h("b", {}, rank.name), h("span", {}, rank.next ? `${p.xp} / ${rank.next.xp} XP` : `${p.xp} XP`)),
      h("div.wt-meter", {}, fill),
      h("small", {}, goalFrac >= 1 ? (goalNow ? "Цель дня выполнена! 🎯" : "Цель дня выполнена") : `Цель дня: ещё ${E.DAILY_GOAL - p.today.xp} XP`),
    ),
    goal,
  );

  const again = h("button.wt-btn" + (s.mistakes.length ? "" : ".is-primary"), { type: "button", onclick: () => open(mode, module, undefined, true) }, "↻ Ещё раз");
  const fix = s.mistakes.length ? h("button.wt-btn.is-primary", { type: "button", onclick: () => open("daily", module, s.mistakes.slice(0, 8)) }, `Повторить ошибки · ${Math.min(8, s.mistakes.length)}`) : null;
  const main = fix ?? again;

  const box = h(
    "div.wt-result",
    {},
    h(
      "section.wt-res-hero.is-" + tone,
      {},
      h("div.wt-res-badge", { "aria-hidden": "true" }, emoji),
      h("p.wt-res-kicker", {}, levelUp ? `${rank.name}` : MODES.find((m) => m.id === mode)!.title),
      h("h2", {}, title),
      big,
      h("p.wt-res-sub", {}, sub),
      chips,
    ),
    progress,
    s.mistakes.length
      ? h(
          "section.wt-mistakes",
          {},
          h("h3", {}, "Слова с ошибками"),
          h(
            "ul",
            {},
            ...s.mistakes.slice(0, 8).map((w) =>
              h(
                "li",
                {},
                picture(w, "is-thumb") ?? h("span.wt-pic.is-thumb.is-empty"),
                h("div", {}, h("b", {}, w.es), h("span", {}, w.ru)),
                h("button.wt-say", { type: "button", "aria-label": `Произнести ${w.es}`, onclick: () => fx.speak(w.es) }, "🔊"),
              ),
            ),
          ),
        )
      : null,
    h("div.wt-actions", {}, main, fix ? again : null, h("button.wt-btn", { type: "button", onclick: () => close() }, "Другие игры")),
    h("p.wt-cta", { html: `Слова знаете? Проверьте себя на настоящих вопросах DGT — <a href="${skilyUrl("/ru", "words-result")}" target="_blank" rel="noopener">тесты на русском в Skilyapp →</a>` }),
  );
  stage.replaceChildren(box);
  stage.scrollTop = 0;
  main.focus({ preventScroll: true });
  const keys = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "Enter" && document.activeElement === document.body) main.click();
  };
  addEventListener("keydown", keys);
  disposers.push(() => removeEventListener("keydown", keys));

  // Анимация: число докручивается, опыт перетекает в полосу ранга.
  fx.countUp(big, bigVal, 900, fmtBig);
  fx.countUp(xpNum, s.xp, 700, (n) => `+${Math.round(n)}`);
  const t = setTimeout(() => {
    fill.style.width = `${Math.round(rank.frac * 100)}%`;
    fx.burst(xpChip, "gold", fill.parentElement, 14);
  }, 650);
  disposers.push(() => clearTimeout(t));
  if (celebrate) {
    fx.sfx("win");
    fx.confetti();
  }
}

/* ─── Упражнения ─────────────────────────────────────────── */

type Kind = "new" | "pickRu" | "pickEs" | "img" | "listen" | "build" | "phrase" | "gap";
type Step = { w: Word; k: Kind; retry?: boolean };

const canBuild = (w: Word) => w.es.length <= 22 && /[a-zñáéíóúü]/i.test(w.es);
const canPhrase = (w: Word) => !!w.ex && w.ex.es.split(" ").length <= 20;
const canGap = (w: Word) => !!w.ex && !!E.findIn(w.ex.es, w.es);

let voiceOk: boolean | null = null;
const voice = async () => (voiceOk ??= await fx.hasVoice());

/** Тренировка дня: 6 слов, каждое — в 2–3 разных упражнениях от простого к сложному. */
async function daily(ctx: Ctx) {
  const v = await voice();
  const lesson = E.pickLesson(ctx.pool.length >= 4 ? ctx.pool : ctx.all, ctx.p, 6);
  const box = (w: Word) => ctx.p.cards[w.id]?.b ?? -1;
  const r1: Step[] = lesson.map((w) => ({ w, k: box(w) < 0 ? "new" : w.img ? "img" : "pickRu" }));
  const r2: Step[] = lesson.map((w) => ({ w, k: box(w) < 0 ? (w.img ? "img" : "pickRu") : v && Math.random() < 0.5 ? "listen" : "pickEs" }));
  const r3: Step[] = lesson.map((w): Step => {
    const hard: Kind[] = [];
    if (canBuild(w)) hard.push("build");
    if (canGap(w) && box(w) >= 1) hard.push("gap");
    if (canPhrase(w) && box(w) >= 1) hard.push("phrase");
    return { w, k: hard.length ? E.pick(hard) : "pickEs" };
  });
  runSteps(ctx, [...r1, ...E.shuffle(r2), ...E.shuffle(r3)]);
}

/** Отдельная игра на одно упражнение: 10 слов (вопросов — 6), подходящих под него. */
async function exercises(ctx: Ctx, mode: ModeId) {
  const kind = mode as Kind;
  if (kind === "listen" && !(await voice())) {
    ctx.stage.replaceChildren(h("div.wt-loading", {}, "В этом браузере нет испанского голоса. Попробуйте Chrome или Safari — или сыграйте в другую игру."));
    return;
  }
  const ok = kind === "build" ? canBuild : kind === "phrase" ? canPhrase : kind === "gap" ? canGap : () => true;
  let src = ctx.pool.filter(ok);
  if (src.length < 4) src = ctx.all.filter((w) => w.q > 0 && ok(w));
  const words = E.pickLesson(src, ctx.p, kind === "phrase" ? 6 : 10);
  runSteps(ctx, E.shuffle(words).map((w) => ({ w, k: kind })));
}

/** Откуда летят искры: кнопка ответа, иначе — само задание. */
let lastSrc: Element | null = null;

function runSteps(ctx: Ctx, steps: Step[]) {
  const first = steps.length;
  let i = 0, correct = 0, total = 0, combo = 0, best = 0, xp = 0;
  const mistakes = new Map<string, Word>();
  ctx.segments(first);

  const next = () => {
    if (!ctx.alive()) return;
    if (i >= steps.length) {
      const bonus = mistakes.size === 0 && total > 0 ? 20 : 0;
      if (bonus) E.addXp(ctx.p, bonus), E.save(ctx.p);
      return ctx.finish({ correct, total, mistakes: [...mistakes.values()], xp: xp + bonus, combo: best });
    }
    const n = i;
    const step = steps[i++];
    if (n < first) ctx.mark(n, "cur");
    lastSrc = null;
    render(ctx, step, (ok) => {
      if (step.k === "new") return void ctx.mark(n, "done");
      if (!step.retry) total++;
      const seg = n < first ? ctx.mark(n, ok ? "ok" : "bad") : null;
      const src = lastSrc ?? ctx.stage.querySelector(".wt-q");
      if (src) fx.burst(src, ok, seg);
      if (ok) {
        if (!step.retry) correct++;
        combo++;
        best = Math.max(best, combo);
        xp += 10;
        fx.sfx(combo % 5 === 0 ? "combo" : "ok");
        if (combo % 5 === 0) fx.burst(ctx.hudEl.parentElement!.querySelector(".wt-streak") ?? src!, "gold");
      } else {
        combo = 0;
        xp += 2;
        mistakes.set(step.w.id, step.w);
        fx.sfx("bad");
        // Ошибку — ещё раз в конце урока, проще: выбор перевода.
        if (!step.retry) steps.push({ w: step.w, k: step.w.img ? "img" : "pickRu", retry: true });
      }
      if (!step.retry) ctx.answer(step.w, ok);
      ctx.setStreak(combo);
    }, next);
  };
  ctx.onKey((e) => stepKey?.(e));
  next();
}

/**
 * Одно упражнение. done(ok) — ответ дан (звук, прогресс), next() — к следующему.
 * После ответа снизу выезжает плашка с правильным ответом и подсказкой; Enter — дальше.
 */
function render(ctx: Ctx, step: Step, done: (ok: boolean) => void, next: () => void) {
  const { w } = step;
  const stage = ctx.stage;
  let answered = false, moved = false;
  stepKey = null;
  const go = () => {
    if (moved) return;
    moved = true;
    next();
  };

  const sheet = (ok: boolean, extra?: Node | null) => {
    answered = true;
    done(ok);
    if (step.k === "new") return;
    const btn = h("button.wt-btn.is-primary", { type: "button", onclick: go }, "Дальше →");
    const el = h(
      "div.wt-sheet" + (ok ? ".is-ok" : ".is-bad"),
      { role: "status" },
      h("div.wt-sheet-body", {}, h("b", {}, ok ? E.pick(["Верно!", "Точно!", "Отлично!", "Так держать!"]) : "Правильный ответ:"), h("div.wt-sheet-word", {}, h("button.wt-say", { type: "button", "aria-label": "Произнести", onclick: () => fx.speak(w.es) }, "🔊"), h("span", {}, h("b", {}, w.es), ` — ${w.ru}`)), extra ?? null, w.h ? h("p.wt-hint", {}, `💡 ${w.h}`) : null),
      btn,
    );
    stage.append(el);
    if (ok) fx.speak(w.es);
    btn.focus({ preventScroll: true });
    stepKey = (e) => {
      if (e.key === "Enter" || e.key === " ") (e.preventDefault(), go());
    };
  };

  const head = (label: string, ...kids: (Node | null)[]) => h("div.wt-q", {}, h("p.wt-label", {}, label), ...kids);

  /** Четыре варианта, клавиши 1–4. */
  const choices = (opts: Word[], field: "ru" | "es", onPick?: (ok: boolean) => void) => {
    const list = E.shuffle([w, ...opts]);
    const btns = list.map((o, n) =>
      h("button.wt-opt", { type: "button", "data-n": n + 1, onclick: () => choose(o, btns[n]) }, h("kbd", {}, String(n + 1)), h("span", {}, o[field])),
    );
    const choose = (o: Word, b: HTMLButtonElement) => {
      if (answered) return;
      const ok = o.id === w.id;
      btns.forEach((x, n) => {
        x.disabled = true;
        if (list[n].id === w.id) x.classList.add("is-ok");
      });
      lastSrc = b;
      if (!ok) b.classList.add("is-bad"), fx.shake(b);
      else fx.pop(b);
      onPick?.(ok);
      sheet(ok);
    };
    stepKey = (e) => {
      const n = Number(e.key) - 1;
      if (n >= 0 && n < btns.length) choose(list[n], btns[n]);
    };
    return h("div.wt-opts", {}, ...btns);
  };

  stage.replaceChildren();
  const k = step.k;

  if (k === "new") {
    fx.speak(w.es);
    const meet = () => !answered && sheet(true);
    stepKey = (e) => e.key === "Enter" && meet();
    stage.append(
      h(
        "div.wt-q.wt-new",
        {},
        h("p.wt-label", {}, "✨ Новое слово"),
        picture(w),
        h("div.wt-big", {}, w.es, h("button.wt-say", { type: "button", "aria-label": "Произнести", onclick: () => fx.speak(w.es) }, "🔊")),
        h("div.wt-tr", {}, w.ru),
        w.d ? h("p.wt-desc", {}, w.d) : null,
        w.ex ? h("blockquote.wt-ex", {}, h("span", {}, w.ex.es), h("small", {}, w.ex.ru)) : null,
        w.h ? h("p.wt-hint", {}, `💡 ${w.h}`) : null,
        h("button.wt-btn.is-primary", { type: "button", onclick: meet }, "Запомнил →"),
      ),
    );
    return;
  }

  if (k === "pickRu" || k === "img" || k === "pickEs") {
    const field = k === "pickRu" ? "ru" : "es";
    const prompt = k === "pickRu" ? h("div.wt-big", {}, w.es) : k === "pickEs" ? h("div.wt-big.is-ru", {}, w.ru) : null;
    const label = k === "pickRu" ? "Как переводится?" : k === "img" ? "Что на картинке?" : "Как это по-испански?";
    stage.append(head(label, k !== "pickEs" ? picture(w) : null, prompt), choices(E.distractors(w, ctx.all, field), field));
    if (k === "pickRu") fx.speak(w.es);
    return;
  }

  if (k === "listen") {
    const play = h("button.wt-play", { type: "button", "aria-label": "Прослушать", onclick: () => fx.speak(w.es) }, "🔊");
    const slow = h("button.wt-play.is-slow", { type: "button", "aria-label": "Медленно", onclick: () => fx.speak(w.es, true) }, "🐢");
    stage.append(head("Что вы услышали?", h("div.wt-plays", {}, play, slow)), choices(E.distractors(w, ctx.all, "ru"), "ru"));
    setTimeout(() => fx.speak(w.es), 250);
    return;
  }

  if (k === "gap") {
    const ex = w.ex!;
    const [a, b] = E.findIn(ex.es, w.es)!;
    const sentence = h("p.wt-sentence", {}, ex.es.slice(0, a), h("span.wt-blank", {}, "＿＿＿"), ex.es.slice(b));
    const opts = choices(E.distractors(w, ctx.all, "es"), "es");
    // После ответа — слово в той форме, в какой оно стоит в вопросе.
    opts.addEventListener("click", () => {
      if (!answered) return;
      const blank = sentence.querySelector(".wt-blank")!;
      blank.textContent = ex.es.slice(a, b);
      blank.classList.add("is-filled");
    });
    stage.append(head("Какое слово пропущено в вопросе экзамена?", sentence, h("p.wt-sub", {}, ex.ru)), opts);
    return;
  }

  if (k === "build") return build(ctx, w, stage, head, (ok) => sheet(ok), (fn) => (stepKey = fn));
  if (k === "phrase") return phrase(w, stage, head, (ok, extra) => sheet(ok, extra));
}

/** Конструктор: собрать испанское слово из букв. Пробелы и знаки ставятся сами; 3 ошибки — слово открывается. */
function build(ctx: Ctx, w: Word, stage: HTMLElement, head: (l: string, ...k: (Node | null)[]) => HTMLElement, sheet: (ok: boolean) => void, setKey: (fn: (e: KeyboardEvent) => void) => void) {
  const chars = [...w.es];
  const isLetter = (c: string) => /[\p{L}]/u.test(c);
  const slots = chars.map((c) => h("span.wt-slot" + (isLetter(c) ? "" : ".is-fixed"), {}, isLetter(c) ? "" : c === " " ? " " : c));
  const order = chars.map((c, i) => (isLetter(c) ? i : -1)).filter((i) => i >= 0);
  const slotsBox = h("div.wt-slots", {}, ...slots);
  let pos = 0, errors = 0, finished = false;
  const tiles = E.shuffle(order).map((i) => {
    const t = h("button.wt-tile-letter", { type: "button" }, chars[i]);
    t.onclick = () => tap(t);
    return t;
  });
  const end = (ok: boolean) => {
    finished = true;
    lastSrc = slotsBox;
    tiles.forEach((t) => (t.disabled = true));
    sheet(ok);
  };
  const place = (t: HTMLButtonElement | undefined) => {
    const i = order[pos++];
    slots[i].textContent = chars[i];
    slots[i].classList.add("is-on");
    if (t) t.classList.add("is-used"), (t.disabled = true);
    fx.sfx("tap");
    if (pos >= order.length) end(errors <= 1);
  };
  const tap = (t: HTMLButtonElement) => {
    if (finished || t.disabled) return;
    const need = chars[order[pos]];
    if (t.textContent!.toLowerCase() === need.toLowerCase()) return place(t);
    errors++;
    fx.shake(t);
    fx.sfx("bad");
    if (errors >= 3) {
      while (pos < order.length) {
        const i = order[pos];
        slots[i].classList.add("is-shown");
        const tt = tiles.find((x) => !x.disabled && x.textContent!.toLowerCase() === chars[i].toLowerCase());
        place(tt);
        if (finished) return;
      }
    }
  };
  const hint = h("button.wt-btn.is-ghost", { type: "button" }, "Подсказка");
  hint.onclick = () => {
    if (finished) return;
    errors++;
    const need = chars[order[pos]].toLowerCase();
    place(tiles.find((x) => !x.disabled && x.textContent!.toLowerCase() === need));
  };
  // Клавиатура: можно печатать, ударения не обязательны — подставится буква с ударением, если без него нет.
  setKey((e) => {
    if (finished || e.key.length !== 1 || e.metaKey || e.ctrlKey) return;
    const key = e.key.toLowerCase();
    const free = tiles.filter((x) => !x.disabled);
    const need = chars[order[pos]].toLowerCase();
    const exact = free.find((x) => x.textContent!.toLowerCase() === key);
    const loose = E.bare(key) === E.bare(need) ? free.find((x) => x.textContent!.toLowerCase() === need) : undefined;
    const t = (exact && exact.textContent!.toLowerCase() === need ? exact : loose) ?? exact;
    if (t) tap(t);
  });
  stage.append(head("Соберите слово по-испански", picture(w), h("div.wt-big.is-ru", {}, w.ru)), slotsBox, h("div.wt-letters", {}, ...tiles), h("div.wt-row", {}, hint));
}

/** Собери вопрос: настоящий вопрос DGT разбит на кусочки по 1–3 слова. */
function phrase(w: Word, stage: HTMLElement, head: (l: string, ...k: (Node | null)[]) => HTMLElement, sheet: (ok: boolean, extra?: Node) => void) {
  const ex = w.ex!;
  const tokens = ex.es.split(" ");
  const n = Math.min(8, Math.max(3, Math.ceil(tokens.length / 2.2)));
  const size = Math.ceil(tokens.length / n);
  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += size) chunks.push(tokens.slice(i, i + size).join(" "));
  const answer = h("div.wt-answer");
  const bank = h("div.wt-bank");
  let done = false;
  const placed: HTMLButtonElement[] = [];
  const check = () => {
    if (placed.length < chunks.length || done) return;
    done = true;
    const ok = placed.map((b) => b.textContent).join(" ") === ex.es;
    [...answer.children, ...bank.children].forEach((b) => ((b as HTMLButtonElement).disabled = true));
    answer.classList.add(ok ? "is-ok" : "is-bad");
    lastSrc = answer;
    sheet(ok, ok ? undefined : h("p.wt-sentence.is-small", {}, ex.es));
  };
  for (const c of E.shuffle(chunks)) {
    const b = h("button.wt-chunk", { type: "button" }, c);
    b.onclick = () => {
      if (done) return;
      fx.sfx("tap");
      if (b.parentElement === bank) (answer.append(b), placed.push(b));
      else (bank.append(b), placed.splice(placed.indexOf(b), 1));
      check();
    };
    bank.append(b);
  }
  stage.append(head("Соберите вопрос экзамена", h("p.wt-sub.is-lead", {}, ex.ru)), answer, bank);
}
