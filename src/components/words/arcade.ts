/**
 * Аркады тренажёра слов: «Радар», «Пары» (Трасса — road.ts). Пишут только опыт и рекорды —
 * в интервальное повторение не попадают (см. trainer.ts).
 */
import type { Word } from "@/lib/words";
import type { Ctx } from "./trainer";
import { MODES, type ModeId } from "./modes";
import { h, picture } from "./dom";
import * as E from "./engine";
import * as fx from "./fx";

/** Слова для аркады: из темы, если их хватает, иначе — частые слова экзамена. */
export function source(ctx: Ctx, ok: (w: Word) => boolean, min: number) {
  const own = ctx.pool.filter(ok);
  return own.length >= min ? own : ctx.all.filter((w) => w.q > 0 && ok(w));
}

/* ─── Правила аркады ─────────────────────────────────────── */

/** Экран «как играть» перед аркадой: три правила и рекорд. По «Ещё раз» не показывается. */
export function intro(ctx: Ctx, mode: ModeId, rules: [string, string][], start: () => void) {
  if (ctx.again) return start();
  const info = MODES.find((m) => m.id === mode)!;
  const best = ctx.p.best[mode];
  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    start();
  };
  const btn = h("button.wt-btn.is-primary.is-wide", { type: "button", onclick: go }, "Старт");
  ctx.stage.replaceChildren(
    h(
      "div.wt-intro.is-" + info.color,
      {},
      h("div.wt-intro-icon", { "aria-hidden": "true" }, info.emoji),
      h("h2", {}, info.title),
      h("ul", {}, ...rules.map(([icon, text]) => h("li", {}, h("span", { "aria-hidden": "true" }, icon), h("span", { html: text })))),
      best != null ? h("p.wt-intro-best", {}, `🏆 Ваш рекорд: ${best}${mode === "pairs" ? " с" : ""}`) : null,
      btn,
      h("p.wt-intro-kbd", {}, "Enter — старт"),
    ),
  );
  btn.focus({ preventScroll: true });
  ctx.onKey((e) => {
    if (!gone && (e.key === "Enter" || e.key === " ")) (e.preventDefault(), go());
  });
}

/**
 * Радар: 60 секунд, «перевод верный?» — да или нет. Серия умножает очки (×2 с 3, ×3 с 6, ×4 с 10),
 * ошибка сбрасывает серию и отнимает 2 секунды. Ответ — кнопкой, стрелкой (← неверно, → верно)
 * или свайпом карточки. Картинка на карточке выдала бы смысл слова — её показываем только
 * после ответа, в полоске «прошлое слово», вместе с верным переводом.
 */
export function radar(ctx: Ctx) {
  const SECONDS = 60;
  const words = E.shuffle(source(ctx, () => true, 8));
  let i = 0, score = 0, streak = 0, best = 0, total = 0, correct = 0, ends = 0, over = false, secs = SECONDS;
  const mistakes = new Map<string, Word>();
  const mult = (n = streak) => (n >= 10 ? 4 : n >= 6 ? 3 : n >= 3 ? 2 : 1);

  const deck = h("div.rr-deck");
  const no = h("button.rr-btn.is-no", { type: "button" }, h("span", { "aria-hidden": "true" }, "✕"), "Неверно", h("kbd", {}, "←"));
  const yes = h("button.rr-btn.is-yes", { type: "button" }, h("span", { "aria-hidden": "true" }, "✓"), "Верно", h("kbd", {}, "→"));
  const last = h("div.rr-last", { "aria-live": "polite" }, h("span.rr-last-hint", {}, "Верный перевод — вправо, неверный — влево"));
  const scope = h("div.rr-scope", { "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("b"));
  const wrap = h("div.rr", {}, scope, deck, h("div.rr-btns", {}, no, yes), last);

  let cur: { w: Word; shown: string; truth: boolean; el: HTMLElement };
  const deal = () => {
    const w = words[i++ % words.length];
    const other = Math.random() < 0.5 ? E.distractors(w, ctx.all, "ru", 1)[0] : undefined;
    const el = h(
      "div.rr-card",
      {},
      h("span.rr-stamp.is-yes", {}, "Верно"),
      h("span.rr-stamp.is-no", {}, "Неверно"),
      h("div.rr-es", { lang: "es" }, w.es),
      h("div.rr-eq", {}, "это"),
      h("div.rr-ru", {}, other?.ru ?? w.ru),
    );
    cur = { w, shown: other?.ru ?? w.ru, truth: !other, el };
    deck.append(el);
    drag(el);
  };

  const hud = () => {
    const m = mult();
    ctx.setHud(`<span class="wt-time${secs <= 10 ? " is-hot" : ""}">⏱ ${Math.max(0, secs)}</span>${m > 1 ? `<span class="wt-mult is-x${m}">×${m}</span>` : ""}<span class="wt-score">${score}</span>`);
  };

  /** Старая карточка улетает в сторону ответа, следующая уже лежит под ней. */
  const fly = (el: HTMLElement, right: boolean, from = 0) => {
    el.classList.add("is-gone");
    el.style.pointerEvents = "none";
    const dir = right ? 1 : -1;
    el.animate(
      [
        { transform: `translateX(${from}px) rotate(${from / 18}deg)`, opacity: 1 },
        { transform: `translateX(${dir * 420}px) rotate(${dir * 22}deg)`, opacity: 0 },
      ],
      { duration: 260, easing: "cubic-bezier(.4,0,.8,.6)", fill: "forwards" },
    ).onfinish = () => el.remove();
  };

  const answer = (say: boolean, from = 0) => {
    if (over || !ends) return;
    const { w, truth, el } = cur;
    const ok = say === truth;
    total++;
    const before = mult();
    if (ok) {
      correct++;
      streak++;
      best = Math.max(best, streak);
      const add = 10 * mult();
      score += add;
      fx.sfx(mult() > before ? "combo" : "ok");
      fx.floatText(deck, `+${add}`, "is-ok");
      fx.burst(el, true, ctx.hudEl, 14);
      if (mult() > before) {
        fx.burst(deck, "gold", null, 26);
        fx.floatText(wrap, `×${mult()}!`, "is-gold");
      }
    } else {
      streak = 0;
      ends -= 2000;
      mistakes.set(w.id, w);
      fx.sfx("bad");
      fx.shake(deck);
      fx.ring(el, false);
      fx.floatText(deck, "−2 с", "is-bad");
      wrap.classList.remove("is-bad");
      void wrap.offsetWidth;
      wrap.classList.add("is-bad");
    }
    ctx.setStreak(streak);
    reveal(w, ok, truth);
    deal();
    fly(el, say, from);
    hud();
  };

  /** Полоска «прошлое слово»: картинка и верный перевод — то, что было бы подсказкой до ответа. */
  const reveal = (w: Word, ok: boolean, truth: boolean) => {
    last.className = `rr-last ${ok ? "is-ok" : "is-bad"}`;
    last.replaceChildren(
      picture(w, "is-thumb") ?? h("span.rr-last-mark", {}, ok ? "✓" : "✕"),
      h("div", {}, h("b", { lang: "es" }, w.es), h("span", {}, `— ${w.ru}`), !ok ? h("small", {}, truth ? "перевод был верный" : "перевод был неверный") : null),
      h("span.rr-last-icon", { "aria-label": ok ? "верно" : "ошибка" }, ok ? "✓" : "✕"),
    );
    last.animate([{ transform: "translateY(6px)", opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 200, easing: "ease-out" });
  };

  /** Свайп карточки: тянем — она наклоняется и показывает штамп, отпустили дальше 90px — ответ. */
  function drag(el: HTMLElement) {
    let x0 = 0, dx = 0, id = -1;
    el.addEventListener("pointerdown", (e) => {
      if (el.classList.contains("is-gone")) return;
      id = e.pointerId;
      x0 = e.clientX;
      dx = 0;
      el.setPointerCapture(id);
      el.classList.add("is-drag");
    });
    el.addEventListener("pointermove", (e) => {
      if (e.pointerId !== id) return;
      dx = e.clientX - x0;
      el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      el.style.setProperty("--yes", String(Math.max(0, Math.min(1, dx / 90))));
      el.style.setProperty("--no", String(Math.max(0, Math.min(1, -dx / 90))));
    });
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      el.classList.remove("is-drag");
      if (Math.abs(dx) > 90 && el === cur.el) return answer(dx > 0, dx);
      el.style.transform = "";
      el.style.setProperty("--yes", "0");
      el.style.setProperty("--no", "0");
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  no.onclick = () => answer(false);
  yes.onclick = () => answer(true);
  ctx.onKey((e) => {
    if (e.key === "ArrowLeft") (e.preventDefault(), answer(false));
    if (e.key === "ArrowRight") (e.preventDefault(), answer(true));
  });

  const tick = () => {
    if (!ctx.alive() || over) return;
    const left = (ends - performance.now()) / 1000;
    ctx.setBar(Math.max(0, left) / SECONDS);
    const s = Math.max(0, Math.ceil(left));
    if (s !== secs) {
      secs = s;
      wrap.classList.toggle("is-hot", s <= 10);
      hud();
      if (s <= 5 && s > 0) fx.sfx("tap");
    }
    if (left <= 0) {
      over = true;
      return ctx.finish({ correct, total, mistakes: [...mistakes.values()], xp: Math.round(score / 10), score, scoreLabel: "очков", combo: best });
    }
    requestAnimationFrame(tick);
  };

  intro(ctx, "radar", [
    ["🇪🇸", "Испанское слово и перевод. <b>Верный</b> — жмите ✓ или смахните вправо, <b>неверный</b> — ✕ или влево."],
    ["🔥", "Серия без ошибок умножает очки: ×2, ×3, до <b>×4</b>."],
    ["⏱", "60 секунд. Ошибка отнимает <b>2 секунды</b> и сбрасывает серию."],
  ], () => {
    ctx.stage.replaceChildren(wrap);
    deal();
    hud();
    ends = performance.now() + SECONDS * 1000;
    requestAnimationFrame(tick);
  });
}

/**
 * Пары на время: 3 раунда по 5 пар. Нажмите слово, потом его перевод (в любом порядке).
 * Ошибка — плюс 2 секунды. Результат — время, рекорд — самое быстрое.
 */
export function pairs(ctx: Ctx) {
  const ROUNDS = 3, PAIRS = 5;
  const words = E.shuffle(source(ctx, (w) => w.ru.length <= 40 && w.es.length <= 32, PAIRS * 2));
  let roundNo = 0, penalty = 0, errors = 0, matched = 0;
  const mistakes = new Map<string, Word>();
  let run = 0, best = 0, t0 = 0, timer = 0;
  const elapsed = () => (t0 ? (performance.now() - t0) / 1000 : 0) + penalty;
  const hud = () => ctx.setHud(`<span class="wt-score">⏱ ${elapsed().toFixed(1)} с</span>`);

  const round = () => {
    const set: Word[] = [];
    for (const w of words.slice(roundNo * PAIRS)) {
      if (set.length >= PAIRS) break;
      if (!set.some((x) => E.similar(x.ru, w.ru))) set.push(w);
    }
    if (set.length < 2) return end();
    let sel: HTMLButtonElement | null = null;
    let left = set.length;
    const make = (w: Word, side: "es" | "ru") => {
      const b = h("button.pr-cell", { type: "button", "data-id": w.id, "data-side": side }, side === "es" ? w.es : w.ru);
      b.classList.toggle("is-es", side === "es");
      b.onclick = () => {
        if (b.disabled) return;
        if (!sel || sel === b) {
          sel?.classList.remove("is-sel");
          sel = sel === b ? null : b;
          sel?.classList.add("is-sel");
          fx.sfx("tap");
          return;
        }
        if (sel.dataset.side === b.dataset.side) {
          sel.classList.remove("is-sel");
          sel = b;
          b.classList.add("is-sel");
          return;
        }
        const a = sel;
        sel = null;
        a.classList.remove("is-sel");
        if (a.dataset.id === b.dataset.id) {
          [a, b].forEach((x) => (x.classList.add("is-ok"), (x.disabled = true)));
          fx.burst(b, true, ctx.hudEl, 12);
          ctx.setStreak(++run);
          best = Math.max(best, run);
          fx.sfx(run > 0 && run % 5 === 0 ? "combo" : "ok");
          if (side === "ru" || a.dataset.side === "es") fx.speak(w.es);
          matched++;
          if (--left === 0) {
            roundNo++;
            ctx.setBar(roundNo / ROUNDS);
            ctx.later(roundNo >= ROUNDS ? end : round, 450);
          }
        } else {
          errors++;
          penalty += 2;
          ctx.setStreak((run = 0));
          fx.ring(b, false);
          const bad = set.find((x) => x.id === (a.dataset.side === "es" ? a.dataset.id : b.dataset.id));
          if (bad) mistakes.set(bad.id, bad);
          [a, b].forEach((x) => (x.classList.add("is-bad"), fx.shake(x), setTimeout(() => x.classList.remove("is-bad"), 400)));
          fx.sfx("bad");
          fx.floatText(ctx.stage, "+2 с", "is-bad");
        }
      };
      return b;
    };
    ctx.stage.replaceChildren(
      h("div.pr", {}, h("p.wt-label", {}, `Раунд ${roundNo + 1} из ${ROUNDS} · соедините пары`), h("div.pr-grid", {}, h("div.pr-col", {}, ...E.shuffle(set).map((w) => make(w, "es"))), h("div.pr-col", {}, ...E.shuffle(set).map((w) => make(w, "ru"))))),
    );
  };
  const end = () => {
    clearInterval(timer);
    const t = Math.round(elapsed() * 10) / 10;
    ctx.finish({ correct: matched, total: matched + errors, mistakes: [...mistakes.values()], xp: Math.max(10, Math.round(60 - t / 2)), score: t, scoreLabel: "секунд", lowerBetter: true, combo: best });
  };
  intro(ctx, "pairs", [
    ["🔗", "Нажмите испанское слово, потом его перевод — пара исчезнет."],
    ["🏁", `${ROUNDS} раунда по ${PAIRS} пар. Чем быстрее, тем лучше.`],
    ["⏱", "Ошибка — <b>плюс 2 секунды</b> к времени."],
  ], () => {
    t0 = performance.now();
    timer = window.setInterval(() => (ctx.alive() ? hud() : clearInterval(timer)), 100);
    ctx.setBar(0);
    round();
  });
}
