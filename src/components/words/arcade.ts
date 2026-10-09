/**
 * Аркады тренажёра слов: «Трасса», «Радар», «Пары». Пишут только опыт и рекорды —
 * в интервальное повторение не попадают (см. trainer.ts).
 */
import type { Word } from "@/lib/words";
import type { Ctx } from "./trainer";
import { h, picture } from "./dom";
import * as E from "./engine";
import * as fx from "./fx";

const LANES = 3;
const LIVES = 3;
const hearts = (n: number) => "❤️".repeat(n) + "🖤".repeat(LIVES - n);

/** Слова для аркады: из темы, если их хватает, иначе — частые слова экзамена. */
function source(ctx: Ctx, ok: (w: Word) => boolean, min: number) {
  const own = ctx.pool.filter(ok);
  return own.length >= min ? own : ctx.all.filter((w) => w.q > 0 && ok(w));
}

/**
 * Трасса: испанское слово на знаке, три полосы с переводами едут навстречу.
 * Перестройтесь в полосу с правильным переводом: ←/→, A/D, тап по полосе или кнопки внизу.
 * Ошибка — минус жизнь, три ошибки — конец. Каждый верный ответ — быстрее.
 */
export function road(ctx: Ctx) {
  // Три перевода в ряд на телефоне: длинные не влезают в полосу.
  const short = (w: Word) => w.ru.length <= 24;
  const words = E.shuffle(source(ctx, short, 6));
  const others = ctx.all.filter(short);
  let lane = 1, n = 0, lives = LIVES, score = 0, combo = 0, correct = 0;
  const mistakes = new Map<string, Word>();

  const sign = h("div.rd-sign");
  const row = h("div.rd-row");
  const car = h("div.rd-car", { "aria-hidden": "true" }, carSvg());
  const field = h("div.rd-road", {}, h("div.rd-lines"), row, car);
  const toast = h("div.rd-toast", { role: "status" });
  const left = h("button.rd-ctl", { type: "button", "aria-label": "Влево" }, "◀");
  const right = h("button.rd-ctl", { type: "button", "aria-label": "Вправо" }, "▶");
  ctx.stage.replaceChildren(h("div.rd", {}, sign, field, toast, h("div.rd-ctls", {}, left, h("span", {}, "← → или тап по полосе"), right)));

  const setLane = (l: number) => {
    lane = Math.max(0, Math.min(LANES - 1, l));
    car.style.left = `${((lane + 0.5) / LANES) * 100}%`;
  };
  setLane(1);
  left.onclick = () => setLane(lane - 1);
  right.onclick = () => setLane(lane + 1);
  field.addEventListener("pointerdown", (e) => {
    const r = field.getBoundingClientRect();
    setLane(Math.floor(((e.clientX - r.left) / r.width) * LANES));
  });
  ctx.onKey((e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") (e.preventDefault(), setLane(lane - 1));
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") (e.preventDefault(), setLane(lane + 1));
    if (["1", "2", "3"].includes(e.key)) setLane(Number(e.key) - 1);
  });

  const hud = () => ctx.setHud(`<span>${hearts(lives)}</span><span class="wt-score">${score}</span>`);
  hud();
  ctx.setBar(0);

  const round = () => {
    if (!ctx.alive()) return;
    const w = words[n % words.length];
    const opts = E.shuffle([w, ...E.distractors(w, others, "ru", LANES - 1)]);
    const right = opts.indexOf(w);
    sign.replaceChildren(h("small", {}, "Как переводится?"), h("b", {}, w.es));
    const gates = opts.map((o) => h("div.rd-gate", { lang: "ru" }, o.ru));
    row.replaceChildren(...gates);
    const speed = Math.round(60 + n * 7);
    ctx.setBar(Math.min(1, n / 40));
    const dur = Math.max(1600, 5200 * 0.95 ** n);
    const from = -row.offsetHeight, to = car.offsetTop - row.offsetHeight - 6;
    const t0 = performance.now();
    field.style.setProperty("--speed", `${Math.max(0.25, dur / 5200)}s`);
    toast.textContent = `🚗 ${speed} км/ч`;
    const frame = (t: number) => {
      if (!ctx.alive()) return;
      const k = Math.min(1, (t - t0) / dur);
      row.style.transform = `translateY(${from + (to - from) * k}px)`;
      if (k < 1) return requestAnimationFrame(frame);
      const ok = lane === right;
      gates[right].classList.add("is-ok");
      n++;
      if (ok) {
        correct++;
        combo++;
        const add = 10 * (combo >= 8 ? 3 : combo >= 4 ? 2 : 1);
        score += add;
        fx.sfx(combo % 5 === 0 ? "combo" : "ok");
        fx.floatText(field, `+${add}`, "is-ok");
      } else {
        combo = 0;
        lives--;
        mistakes.set(w.id, w);
        gates[lane].classList.add("is-bad");
        fx.sfx("crash");
        fx.shake(car);
        toast.textContent = `${w.es} — ${w.ru}`;
      }
      hud();
      if (lives <= 0) return ctx.later(() => ctx.finish({ correct, total: n, mistakes: [...mistakes.values()], xp: Math.round(score / 5), score, scoreLabel: "очков" }), 1200);
      ctx.later(round, ok ? 380 : 1500);
    };
    requestAnimationFrame(frame);
  };
  ctx.later(round, 400);
}

const carSvg = () => {
  const s = document.createElement("span");
  s.innerHTML = `<svg viewBox="0 0 40 64" width="40" height="64"><rect x="4" y="4" width="32" height="56" rx="10" fill="#2563eb"/><rect x="9" y="14" width="22" height="12" rx="3" fill="#bfdbfe"/><rect x="9" y="40" width="22" height="9" rx="3" fill="#93c5fd"/><rect x="0" y="12" width="5" height="10" rx="2" fill="#1e293b"/><rect x="35" y="12" width="5" height="10" rx="2" fill="#1e293b"/><rect x="0" y="44" width="5" height="10" rx="2" fill="#1e293b"/><rect x="35" y="44" width="5" height="10" rx="2" fill="#1e293b"/><rect x="8" y="3" width="7" height="3" rx="1.5" fill="#fde68a"/><rect x="25" y="3" width="7" height="3" rx="1.5" fill="#fde68a"/></svg>`;
  return s;
};

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
