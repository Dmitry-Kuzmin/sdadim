/**
 * «Трасса» — полноэкранная аркада. Вид сверху: трава, асфальт, деревья, над дорогой едут мачты
 * с тремя табличками-переводами. Испанское слово — на синем указателе сверху. Перестройтесь
 * в полосу с правильным переводом до того, как проедете под мачтой: ←/→, A/D, 1–3, свайп или тап по полосе.
 * Ошибка — минус жизнь, три — конец поездки. Каждый верный ответ — быстрее, каждые 8 — новый уровень.
 *
 * Вся графика — SVG и CSS (words.css, блок «Трасса»), движение — один requestAnimationFrame и transform:
 * слои двигаются на видеокарте, без перерисовки. Скорость считается в долях высоты экрана — на телефоне
 * и на мониторе время на ответ одинаковое (timeOf).
 */
import type { Word } from "@/lib/words";
import type { Ctx } from "./trainer";
import { h } from "./dom";
import { source } from "./arcade";
import * as E from "./engine";
import * as fx from "./fx";

const LANES = 3;
const LIVES = 3;
const PER_LEVEL = 8;
/** Сколько секунд у игрока на ответ: от 3,6 с на старте до 1,4 с. Скорость дороги считается из этого
 *  и из расстояния «указатель → машина», поэтому на телефоне и на мониторе игра одинаково честная. */
const timeOf = (n: number) => Math.max(1.4, 3.6 * 0.95 ** n);
const kmhOf = (n: number) => Math.round(40 + ((3.6 - timeOf(n)) / 2.2) * 100);

const svgEl = (html: string, cls: string) => {
  const s = document.createElement("div");
  s.className = cls;
  s.innerHTML = html;
  return s;
};

/** Машина сверху, носом вверх. Поворотники .ind-l / .ind-r мигают при перестроении. */
const CAR = `<svg viewBox="0 0 64 120" aria-hidden="true">
  <defs>
    <linearGradient id="r3b" x1="0" x2="1"><stop offset="0" stop-color="#1e40af"/><stop offset=".45" stop-color="#3b82f6"/><stop offset=".55" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e40af"/></linearGradient>
    <linearGradient id="r3g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#3b4a63"/></linearGradient>
    <radialGradient id="r3i"><stop offset="0" stop-color="#fff7cc"/><stop offset=".35" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="1" y="37" width="9" height="6" rx="3" fill="#1e3a8a"/><rect x="54" y="37" width="9" height="6" rx="3" fill="#1e3a8a"/>
  <path d="M15 5 Q32 -1 49 5 Q58 9 58 26 L58 100 Q58 115 45 117 L19 117 Q6 115 6 100 L6 26 Q6 9 15 5Z" fill="url(#r3b)"/>
  <path d="M17 9 Q32 4 47 9 L45 29 L19 29Z" fill="#fff" opacity=".14"/>
  <path d="M11 35 Q32 28 53 35 L49 51 Q32 46 15 51Z" fill="url(#r3g)"/>
  <rect x="14" y="51" width="36" height="34" rx="7" fill="url(#r3b)"/>
  <rect x="18" y="54" width="28" height="9" rx="4" fill="#fff" opacity=".18"/>
  <path d="M15 86 Q32 91 49 86 L51 99 Q32 104 13 99Z" fill="url(#r3g)"/>
  <path d="M9.5 40 L11.5 97" stroke="#0b1220" stroke-width="3" stroke-linecap="round" opacity=".55"/>
  <path d="M54.5 40 L52.5 97" stroke="#0b1220" stroke-width="3" stroke-linecap="round" opacity=".55"/>
  <path d="M9 9 Q13 5 21 5 L20 11 Q14 11 9 14Z" fill="#fef9c3"/><path d="M55 9 Q51 5 43 5 L44 11 Q50 11 55 14Z" fill="#fef9c3"/>
  <rect x="9" y="111" width="13" height="4" rx="2" fill="#ef4444"/><rect x="42" y="111" width="13" height="4" rx="2" fill="#ef4444"/>
  <g class="ind-l"><circle cx="8" cy="15" r="9" fill="url(#r3i)"/><circle cx="8" cy="108" r="9" fill="url(#r3i)"/></g>
  <g class="ind-r"><circle cx="56" cy="15" r="9" fill="url(#r3i)"/><circle cx="56" cy="108" r="9" fill="url(#r3i)"/></g>
</svg>`;

/** Светофор обратного отсчёта: красный → жёлтый → зелёный. */
const LIGHT = `<div class="r3-light"><i></i><i></i><i></i></div>`;

type Deco = { el: HTMLElement; y: number; h: number };

export function road(ctx: Ctx) {
  const short = (w: Word) => w.ru.length <= 26;
  const words = E.shuffle(source(ctx, short, 6));
  const others = ctx.all.filter(short);

  /* ─── Сцена ─── */
  const grass = h("div.r3-grass");
  const decoLayer = h("div.r3-deco");
  const tex = h("div.r3-tex");
  const marks = h("div.r3-marks");
  const row = h("div.r3-row");
  const car = svgEl(CAR, "r3-car");
  const asphalt = h("div.r3-asphalt", {}, tex, marks, row);
  const roadEl = h("div.r3-road", {}, asphalt, car);
  const flash = h("div.r3-flash");

  const sign = h("div.r3-sign", { "aria-live": "polite" });
  const hearts = h("span.r3-hearts");
  const scoreEl = h("b.r3-score", {}, "0");
  const speedEl = h("span.r3-speed");
  const quit = h("button.r3-btn", { type: "button", "aria-label": "Закрыть", onclick: () => ctx.exit() }, "✕");
  const hud = h("div.r3-hud", {}, quit, h("div.r3-stats", {}, hearts, h("span.r3-box", {}, scoreEl, h("small", {}, "очков")), speedEl));
  const toast = h("div.r3-toast", { role: "status" });
  const banner = h("div.r3-banner");
  const left = h("button.r3-pad.is-l", { type: "button", "aria-label": "Влево" }, "‹");
  const right = h("button.r3-pad.is-r", { type: "button", "aria-label": "Вправо" }, "›");
  const start = svgEl(LIGHT, "r3-start");
  const scene = h("div.r3", { role: "application", "aria-label": "Трасса: выберите полосу с правильным переводом" }, grass, decoLayer, roadEl, flash, hud, sign, toast, banner, left, right, start);
  ctx.layer(scene);

  /* ─── Состояние ─── */
  let W = 0, H = 0, RW = 0, laneW = 0, carTop = 0;
  let lane = 1, n = 0, lives = LIVES, score = 0, combo = 0, correct = 0, level = 1;
  let y = 0, v = 0, target = 0, kmh = 0, running = false, over = false;
  let rowY = 0, rowH = 0, rowOn = false, resolved = false, right_ = 0, cur: Word | null = null;
  let gates: HTMLElement[] = [];
  const mistakes = new Map<string, Word>();
  const decos: Deco[] = [];
  const skids: Deco[] = [];
  const motor = fx.engine();

  const layout = () => {
    W = scene.clientWidth;
    H = scene.clientHeight;
    // На телефоне — полоса травы по краям: сцена читается как дорога, а не как серый экран.
    RW = Math.min(W - Math.max(16, W * 0.13), 620);
    laneW = (RW - 28) / LANES;
    scene.style.setProperty("--rw", `${RW}px`);
    scene.style.setProperty("--car", `${Math.min(76, laneW * 0.52)}px`);
    carTop = H - H * 0.17 - Math.min(76, laneW * 0.52) * 1.875;
    placeCar();
  };
  const placeCar = () => (car.style.left = `${14 + laneW * (lane + 0.5)}px`);

  /* ─── Деревья и кусты на траве: переиспользуем, когда уезжают за экран ─── */
  /** Дерево, куст, камень или цветы — по размеру обочины: на узкой только мелочь. */
  const dress = (d: Deco, yy: number) => {
    const gap = (W - RW) / 2;
    d.y = yy;
    d.el.hidden = gap < 14;
    if (d.el.hidden) return;
    const r = Math.random();
    const kind = gap >= 70 && r < 0.55 ? "r3-tree" : r < 0.7 ? "r3-bush" : r < 0.85 ? "r3-flowers" : "r3-rock";
    const max = Math.max(10, gap - 10);
    const s = Math.min(max, kind === "r3-tree" ? 48 + Math.random() * 46 : kind === "r3-flowers" ? 26 + Math.random() * 20 : 16 + Math.random() * 18);
    const x = 4 + Math.random() * Math.max(0, gap - s - 8);
    d.h = s;
    d.el.className = kind;
    d.el.style.cssText = `left:${Math.random() < 0.5 ? x : W - gap + x + 4}px;width:${s}px;height:${s}px;--hue:${Math.round(Math.random() * 24 - 12)}deg`;
  };
  const plant = () => {
    for (let i = 0; i < 18; i++) {
      const d: Deco = { el: h("i"), y: 0, h: 0 };
      decoLayer.append(d.el);
      decos.push(d);
      dress(d, Math.random() * H);
    }
  };

  /* ─── Управление ─── */
  const setLane = (l: number) => {
    const to = Math.max(0, Math.min(LANES - 1, l));
    if (to === lane || over) return;
    const dir = to < lane ? "l" : "r";
    lane = to;
    placeCar();
    car.classList.remove("is-l", "is-r");
    void car.offsetWidth;
    car.classList.add(`is-${dir}`);
    fx.sfx("tap");
  };
  left.onclick = () => setLane(lane - 1);
  right.onclick = () => setLane(lane + 1);
  let px = 0, py = 0;
  scene.addEventListener("pointerdown", (e) => {
    px = e.clientX;
    py = e.clientY;
  });
  scene.addEventListener("pointerup", (e) => {
    if ((e.target as Element).closest("button")) return;
    const dx = e.clientX - px;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(e.clientY - py)) return setLane(lane + Math.sign(dx));
    const r = roadEl.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right) setLane(Math.floor(((e.clientX - r.left - 14) / laneW)));
  });
  ctx.onKey((e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") (e.preventDefault(), setLane(lane - 1));
    else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") (e.preventDefault(), setLane(lane + 1));
    else if (["1", "2", "3"].includes(e.key)) setLane(Number(e.key) - 1);
  });

  /* ─── HUD ─── */
  const paintHud = () => {
    hearts.innerHTML = Array.from({ length: LIVES }, (_, i) => `<i class="${i < lives ? "" : "is-off"}">♥</i>`).join("");
    scoreEl.textContent = String(score);
  };
  const say = (text: string, cls = "") => {
    toast.className = `r3-toast is-on ${cls}`;
    toast.textContent = text;
    ctx.later(() => (toast.className = "r3-toast"), 1700);
  };
  const shout = (text: string) => {
    banner.textContent = text;
    banner.classList.remove("is-on");
    void banner.offsetWidth;
    banner.classList.add("is-on");
  };

  /* ─── Мачта с ответами ─── */
  const spawn = () => {
    if (over) return;
    const w = words[n % words.length];
    cur = w;
    const opts = E.shuffle([w, ...E.distractors(w, others, "ru", LANES - 1)]);
    right_ = opts.indexOf(w);
    gates = opts.map((o) => h("div.r3-gate", { lang: "ru" }, h("span", {}, o.ru)));
    row.replaceChildren(h("i.r3-beam"), ...gates);
    sign.replaceChildren(h("small", {}, "¿Qué significa?"), h("b", { lang: "es" }, w.es), h("button.r3-say", { type: "button", "aria-label": "Произнести", onclick: () => fx.speak(w.es) }, "🔊"));
    sign.classList.remove("is-new");
    void sign.offsetWidth;
    sign.classList.add("is-new");
    rowH = row.offsetHeight;
    // Мачта появляется сразу под указателем: всё расстояние до машины — время на чтение.
    const signBottom = sign.offsetTop + sign.offsetHeight + 12;
    rowY = signBottom;
    row.style.transform = `translate3d(0,${rowY}px,0)`;
    row.classList.remove("is-in");
    void row.offsetWidth;
    row.classList.add("is-in");
    target = Math.max(40, carTop - rowH - signBottom) / timeOf(n);
    kmh = kmhOf(n);
    rowOn = true;
    resolved = false;
  };

  const resolve = () => {
    resolved = true;
    const w = cur!;
    n++;
    gates[right_].classList.add("is-ok");
    if (lane === right_) {
      correct++;
      combo++;
      const mult = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
      const add = 10 * mult;
      score += add;
      fx.sfx(combo % 5 === 0 ? "combo" : "ok");
      fx.floatText(roadEl, `+${add}${mult > 1 ? ` ×${mult}` : ""}`, "is-ok r3-plus");
      if (combo % 5 === 0) say(`🔥 Серия ${combo}!`, "is-good");
      if (correct % PER_LEVEL === 0) {
        level++;
        shout(`Nivel ${level}`);
        fx.sfx("combo");
      }
    } else {
      combo = 0;
      lives--;
      mistakes.set(w.id, w);
      gates[lane].classList.add("is-bad");
      fx.sfx("crash");
      fx.shake(scene);
      flash.classList.remove("is-on");
      void flash.offsetWidth;
      flash.classList.add("is-on");
      v *= 0.35;
      skid();
      say(`${w.es} — ${w.ru}`, "is-bad");
    }
    paintHud();
    if (lives <= 0) {
      over = true;
      running = false;
      motor.stop();
      shout("Fin del trayecto");
      ctx.later(() => ctx.finish({ correct, total: n, mistakes: [...mistakes.values()], xp: Math.round(score / 5), score, scoreLabel: "очков" }), 1600);
    }
  };

  /** Тормозной след под машиной — уезжает вместе с дорогой. */
  const skid = () => {
    const el = h("i.r3-skid");
    el.style.left = `${laneW * (lane + 0.5)}px`;
    marks.append(el);
    skids.push({ el, y: carTop - 10, h: 140 });
  };

  /* ─── Главный цикл ─── */
  let last = performance.now();
  const frame = (t: number) => {
    if (!ctx.alive()) return;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (running || over) {
      v += (target * (over ? 0 : 1) - v) * Math.min(1, dt * (over ? 1.5 : 1.2));
      const dy = v * dt;
      y += dy;
      for (const d of decos) {
        d.y += dy;
        if (d.y > H + 20) dress(d, -d.h - Math.random() * 200);
        d.el.style.transform = `translate3d(0,${d.y}px,0)`;
      }
      for (let i = skids.length - 1; i >= 0; i--) {
        const s = skids[i];
        s.y += dy;
        s.el.style.transform = `translate3d(-50%,${s.y}px,0)`;
        if (s.y > H) (s.el.remove(), skids.splice(i, 1));
      }
      if (rowOn) {
        rowY += dy;
        row.style.transform = `translate3d(0,${rowY}px,0)`;
        if (!resolved && rowY + rowH >= carTop) resolve();
        if (resolved && rowY > H) {
          rowOn = false;
          if (!over) ctx.later(spawn, 250);
        }
      }
      const k = target ? v / target : 0;
      motor.set(Math.min(1, (kmh / 140) * k));
      speedEl.innerHTML = `<b>${Math.round(kmh * k)}</b><small>км/ч</small>`;
    }
    // Фактуры травы и асфальта — повторяющиеся плитки: сдвиг по модулю размера плитки.
    grass.style.transform = `translate3d(0,${y % 256}px,0)`;
    tex.style.transform = `translate3d(0,${y % 96}px,0)`;
    requestAnimationFrame(frame);
  };

  const onResize = () => layout();
  addEventListener("resize", onResize);
  layout();
  plant();
  paintHud();
  speedEl.innerHTML = `<b>0</b><small>км/ч</small>`;
  sign.replaceChildren(h("small", {}, "Приготовьтесь"), h("b", {}, "¡Vamos!"));
  requestAnimationFrame(frame);

  // Светофор: 3 сигнала по 0,6 с, на зелёный — поехали.
  const lights = start.querySelectorAll("i");
  [0, 1, 2].forEach((i) =>
    ctx.later(() => {
      lights.forEach((l, k) => l.classList.toggle("is-on", k === i));
      fx.sfx(i === 2 ? "ok" : "tap");
      if (i === 2) {
        running = true;
        spawn();
        ctx.later(() => start.classList.add("is-off"), 500);
      }
    }, 300 + i * 650),
  );

  const stop = () => {
    removeEventListener("resize", onResize);
    motor.stop();
  };
  // Снять обработчики при выходе: слой убирает trainer, а resize и мотор — здесь.
  const obs = new MutationObserver(() => {
    if (!scene.isConnected) (stop(), obs.disconnect());
  });
  obs.observe(scene.parentElement!, { childList: true });
}
