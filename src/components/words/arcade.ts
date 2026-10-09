/**
 * Аркады тренажёра слов: «Радар», «Пары» (Трасса — road.ts). Пишут только опыт и рекорды —
 * в интервальное повторение не попадают (см. trainer.ts).
 */
import type { Word } from "@/lib/words";
import type { Ctx } from "./trainer";
import { h, picture } from "./dom";
import * as E from "./engine";
import * as fx from "./fx";

/** Слова для аркады: из темы, если их хватает, иначе — частые слова экзамена. */
export function source(ctx: Ctx, ok: (w: Word) => boolean, min: number) {
  const own = ctx.pool.filter(ok);
  return own.length >= min ? own : ctx.all.filter((w) => w.q > 0 && ok(w));
}

/**
 * Радар: 60 секунд, «перевод верный?» — да или нет. Серия умножает очки (×2 с 3, ×3 с 6, ×4 с 10),
 * ошибка сбрасывает серию и отнимает 2 секунды. Клавиши: ← неверно, → верно.
 */
export function radar(ctx: Ctx) {
  const SECONDS = 60;
  const words = E.shuffle(source(ctx, () => true, 8));
  let i = 0, score = 0, streak = 0, total = 0, correct = 0, ends = performance.now() + SECONDS * 1000, over = false;
  const mistakes = new Map<string, Word>();
  const mult = () => (streak >= 10 ? 4 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1);

  const card = h("div.rr-card");
  const no = h("button.rr-btn.is-no", { type: "button" }, "✕ Неверно", h("kbd", {}, "←"));
  const yes = h("button.rr-btn.is-yes", { type: "button" }, "✓ Верно", h("kbd", {}, "→"));
  const wrap = h("div.rr", {}, card, h("div.rr-btns", {}, no, yes));
  ctx.stage.replaceChildren(wrap);

  let cur: { w: Word; shown: string; truth: boolean };
  const deal = () => {
    const w = words[i++ % words.length];
    const truth = Math.random() < 0.5;
    const other = truth ? undefined : E.distractors(w, ctx.all, "ru", 1)[0];
    cur = { w, shown: other?.ru ?? w.ru, truth: !other };
    card.replaceChildren(picture(cur.w, "is-small") ?? h("span"), h("div.rr-es", {}, w.es), h("div.rr-eq", {}, "="), h("div.rr-ru", {}, cur.shown));
  };
  const hud = () => ctx.setHud(`${mult() > 1 ? `<span class="wt-combo">×${mult()}</span>` : ""}<span class="wt-score">${score}</span>`);
  const answer = (say: boolean) => {
    if (over) return;
    total++;
    if (say === cur.truth) {
      correct++;
      streak++;
      const add = 10 * mult();
      score += add;
      fx.sfx(streak === 3 || streak === 6 || streak === 10 ? "combo" : "ok");
      fx.floatText(card, `+${add}`, "is-ok");
      card.classList.remove("is-bad");
      card.classList.add("is-ok");
    } else {
      streak = 0;
      ends -= 2000;
      mistakes.set(cur.w.id, cur.w);
      fx.sfx("bad");
      fx.shake(card);
      fx.floatText(card, "−2 с", "is-bad");
      card.classList.remove("is-ok");
      card.classList.add("is-bad");
    }
    hud();
    setTimeout(() => card.classList.remove("is-ok", "is-bad"), 220);
    deal();
  };
  no.onclick = () => answer(false);
  yes.onclick = () => answer(true);
  ctx.onKey((e) => {
    if (e.key === "ArrowLeft") (e.preventDefault(), answer(false));
    if (e.key === "ArrowRight") (e.preventDefault(), answer(true));
  });
  deal();
  hud();
  const tick = () => {
    if (!ctx.alive() || over) return;
    const left = (ends - performance.now()) / 1000;
    ctx.setBar(Math.max(0, left) / SECONDS);
    if (left <= 0) {
      over = true;
      return ctx.finish({ correct, total, mistakes: [...mistakes.values()], xp: Math.round(score / 10), score, scoreLabel: "очков" });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Пары на время: 3 раунда по 5 пар. Нажмите слово, потом его перевод (в любом порядке).
 * Ошибка — плюс 2 секунды. Результат — время, рекорд — самое быстрое.
 */
export function pairs(ctx: Ctx) {
  const ROUNDS = 3, PAIRS = 5;
  const words = E.shuffle(source(ctx, (w) => w.ru.length <= 40 && w.es.length <= 32, PAIRS * 2));
  let roundNo = 0, penalty = 0, errors = 0, matched = 0;
  const t0 = performance.now();
  const mistakes = new Map<string, Word>();
  const elapsed = () => (performance.now() - t0) / 1000 + penalty;
  const hud = () => ctx.setHud(`<span class="wt-score">⏱ ${elapsed().toFixed(1)} с</span>`);
  const timer = setInterval(() => ctx.alive() ? hud() : clearInterval(timer), 100);

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
          fx.sfx("ok");
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
    ctx.finish({ correct: matched, total: matched + errors, mistakes: [...mistakes.values()], xp: Math.max(10, Math.round(60 - t / 2)), score: t, scoreLabel: "секунд", lowerBetter: true });
  };
  ctx.setBar(0);
  round();
}
