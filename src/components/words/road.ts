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
import { BIOMES, scenery } from "./scenery";

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

/** Машина сверху, носом вверх. Передние колёса .whl поворачиваются, поворотники .ind-l / .ind-r мигают при перестроении. */
const CAR = `<svg viewBox="0 0 64 120" aria-hidden="true">
  <defs>
    <linearGradient id="r3b" x1="0" x2="1"><stop offset="0" stop-color="#1e40af"/><stop offset=".45" stop-color="#3b82f6"/><stop offset=".55" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e40af"/></linearGradient>
    <linearGradient id="r3g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#3b4a63"/></linearGradient>
    <radialGradient id="r3i"><stop offset="0" stop-color="#fff7cc"/><stop offset=".35" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="whl"><rect x="2" y="15" width="9" height="19" rx="3.5" fill="#0f172a"/><path d="M4 18h5M4 22h5M4 26h5M4 30h5" stroke="#475569" stroke-width="1"/></g>
  <g class="whl"><rect x="53" y="15" width="9" height="19" rx="3.5" fill="#0f172a"/><path d="M55 18h5M55 22h5M55 26h5M55 30h5" stroke="#475569" stroke-width="1"/></g>
  <rect x="2" y="84" width="9" height="19" rx="3.5" fill="#0f172a"/><rect x="53" y="84" width="9" height="19" rx="3.5" fill="#0f172a"/>
  <rect x="1" y="40" width="9" height="6" rx="3" fill="#1e3a8a"/><rect x="54" y="40" width="9" height="6" rx="3" fill="#1e3a8a"/>
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

type Mark = { el: HTMLElement; y: number };
/** Смена пейзажа — каждые столько слов. */
const PER_BIOME = 6;

export function road(ctx: Ctx) {
  const short = (w: Word) => w.ru.length <= 26;
  const words = E.shuffle(source(ctx, short, 6));
  const others = ctx.all.filter(short);

  /* ─── Сцена ─── */
  const grass = h("div.r3-grass");
  const ground = h("div.r3-ground");
  const decoLayer = h("div.r3-deco");
  const sky = h("div.r3-sky");
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
  const place = h("div.r3-place", { "aria-live": "polite" });
  const left = h("button.r3-pad.is-l", { type: "button", "aria-label": "Влево" }, "‹");
  const right = h("button.r3-pad.is-r", { type: "button", "aria-label": "Вправо" }, "›");
  const start = svgEl(LIGHT, "r3-start");
  const scene = h("div.r3", { role: "application", "aria-label": "Трасса: выберите полосу с правильным переводом" }, grass, ground, decoLayer, roadEl, sky, flash, hud, sign, toast, place, banner, left, right, start);
  ctx.layer(scene);

  /* ─── Состояние ─── */
  let W = 0, H = 0, RW = 0, laneW = 0, carTop = 0;
  let lane = 1, n = 0, lives = LIVES, score = 0, combo = 0, correct = 0, level = 1;
  let y = 0, v = 0, target = 0, kmh = 0, running = false, over = false;
  let rowY = 0, rowH = 0, rowOn = false, resolved = false, right_ = 0, cur: Word | null = null;
  let gates: HTMLElement[] = [];
  const mistakes = new Map<string, Word>();
  const skids: Mark[] = [];
  const motor = fx.engine();
  const land = scenery(ground, decoLayer, sky);
  const wheels = [...car.querySelectorAll<SVGGElement>(".whl")];
  const body = car.querySelector("svg")!;

  /* Физика машины: x — центр машины на дороге, vx — боковая скорость, yaw — поворот кузова,
     steer — угол передних колёс. Перестроение — пружина с демпфером к центру полосы.
     hold — пауза после нажатия: сначала поворотник, потом колёса, потом кузов.
     drift — перестроились в последний момент: пружина жёстче, демпфер слабее, кузов
     заносит с запаздыванием и перерулом, из-под задних колёс — дым и следы. */
  let cx = 0, vx = 0, yaw = 0, steer = 0, hold = 0, dir = 0, drift = 0, trail = 0;
  const laneX = (l: number) => 14 + laneW * (l + 0.5);
  let carW = 0;

  const layout = () => {
    W = scene.clientWidth;
    H = scene.clientHeight;
    // На телефоне — полоса травы по краям: сцена читается как дорога, а не как серый экран.
    RW = Math.min(W - Math.max(16, W * 0.13), 620);
    laneW = (RW - 28) / LANES;
    scene.style.setProperty("--rw", `${RW}px`);
    carW = Math.min(76, laneW * 0.52);
    scene.style.setProperty("--car", `${carW}px`);
    carTop = H - H * 0.17 - carW * 1.875;
    cx = laneX(lane);
    vx = 0;
    land.layout(W, H, RW);
  };

  /* ─── Управление ─── */
  const setLane = (l: number) => {
    const to = Math.max(0, Math.min(LANES - 1, l));
    if (to === lane || over) return;
    dir = to < lane ? -1 : 1;
    lane = to;
    hold = 0.09;
    // Сколько секунд до мачты: меньше трети времени на ответ — перестроение «на нервах», с заносом.
    const left = rowOn && !resolved && v > 1 ? (carTop - rowY - rowH) / v : 9;
    if (left < Math.max(0.45, timeOf(n) * 0.3)) {
      drift = 1;
      fx.sfx("skid");
    }
    car.classList.remove("is-l", "is-r");
    void car.offsetWidth;
    car.classList.add(dir < 0 ? "is-l" : "is-r");
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
    if (n > 0 && n % PER_BIOME === 0) {
      const next = BIOMES[(n / PER_BIOME) % BIOMES.length];
      land.set(next.id);
      // Зелёный указатель с названием места — как на испанских трассах.
      place.textContent = next.name;
      place.classList.remove("is-on");
      void place.offsetWidth;
      place.classList.add("is-on");
    }
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
      // Удар: кузов дёргает, короткий занос.
      yaw += (Math.random() < 0.5 ? -1 : 1) * 16;
      drift = 1;
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
    el.style.left = `${cx - 14}px`;
    marks.append(el);
    skids.push({ el, y: carTop - 10 });
  };
  /** Занос: дым и чёрные полосы из-под задних колёс (координаты колёс — с поворотом кузова). */
  const rearWheels = () => {
    const a = (yaw * Math.PI) / 180, cy = carTop + carW * 0.9375, dy = carW * 0.62, dx = carW * 0.4;
    return [-1, 1].map((s) => ({ x: cx + s * dx * Math.cos(a) - dy * Math.sin(a), y: cy + s * dx * Math.sin(a) + dy * Math.cos(a) }));
  };
  const tire = () => {
    for (const p of rearWheels()) {
      const m = h("i.r3-tire");
      m.style.cssText = `left:${p.x - 14}px;--a:${yaw}deg`;
      marks.append(m);
      skids.push({ el: m, y: p.y });
      if (Math.random() < 0.5) {
        const sm = h("i.r3-smoke");
        sm.style.cssText = `left:${p.x}px;top:${p.y}px`;
        roadEl.append(sm);
        const drop = v * 0.7;
        sm.animate([{ transform: "translate(-50%,-50%) scale(.4)", opacity: 0.55 }, { transform: `translate(${rnd(-24, 24)}px,${drop}px) scale(${rnd(2, 3)})`, opacity: 0 }], { duration: 700, easing: "ease-out" }).onfinish = () => sm.remove();
      }
    }
  };
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  /** Шаг физики машины. */
  const drive = (dt: number) => {
    const tx = laneX(lane);
    if (hold > 0) hold -= dt;
    else {
      const K = drift ? 240 : 105, C = 2 * Math.sqrt(K) * (drift ? 0.42 : 0.85);
      vx += (K * (tx - cx) - C * vx) * dt;
      cx += vx * dt;
    }
    const fwd = Math.max(160, v);
    const lim = drift ? 32 : 13;
    const yawT = Math.max(-lim, Math.min(lim, ((Math.atan2(vx, fwd) * 180) / Math.PI) * (drift ? 1.7 : 0.9)));
    yaw += (yawT - yaw) * Math.min(1, dt * (drift ? 5 : 14));
    // Колёса: на паузе — уже вывернуты в сторону полосы, в заносе — контрруль против кузова.
    const steerT = hold > 0 ? dir * 26 : Math.max(-32, Math.min(32, ((tx - cx) / laneW) * 34 - (drift ? yaw * 1.2 : 0)));
    steer += (steerT - steer) * Math.min(1, dt * 20);
    if (drift && Math.abs(yaw) > 5 && (trail -= dt) <= 0) (tire(), (trail = 0.03));
    if (drift && Math.abs(tx - cx) < 1.5 && Math.abs(vx) < 12 && Math.abs(yaw) < 2) drift = 0;
    car.style.transform = `translate3d(${cx}px,0,0) translateX(-50%)`;
    body.style.transform = `rotate(${yaw.toFixed(2)}deg)`;
    for (const w of wheels) w.style.transform = `rotate(${steer.toFixed(1)}deg)`;
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
      land.step(dy);
      for (let i = skids.length - 1; i >= 0; i--) {
        const s = skids[i];
        s.y += dy;
        s.el.style.transform = `translate3d(-50%,${s.y}px,0) rotate(var(--a, 0deg))`;
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
    drive(dt);
    // Фактуры травы и асфальта — повторяющиеся плитки: сдвиг по модулю размера плитки.
    grass.style.transform = `translate3d(0,${y % 256}px,0)`;
    tex.style.transform = `translate3d(0,${y % 96}px,0)`;
    requestAnimationFrame(frame);
  };

  const onResize = () => layout();
  addEventListener("resize", onResize);
  layout();
  land.plant(W > 900 ? 26 : 18);
  paintHud();
  // Птицы: стая раз в 6–10 секунд, пока едем.
  const birds = () => {
    if (running) land.flock();
    ctx.later(birds, 6000 + Math.random() * 4000);
  };
  ctx.later(birds, 2500);
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
