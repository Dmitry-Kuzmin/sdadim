/**
 * Пейзаж «Трассы»: вид сверху, четыре зоны Испании сменяют друг друга по ходу поездки.
 *
 *   campo   — campiña: трава, деревья, тюки сена, подсолнухи (фон r3-grass)
 *   costa   — Costa del Sol: слева море с волнами и лодками, пляж с зонтиками, пальмы
 *   pueblo  — белый посёлок: черепичные и плоские белые крыши, церковь с гнездом аиста, апельсины
 *   mancha  — La Mancha: охристая земля, оливковые рощи, пшеница, ветряные мельницы
 *
 * Как устроено. Земля зоны — «полоса» в мире: появляется у верхнего края экрана и уезжает вниз вместе
 * с дорогой (ближний край), а когда зона кончилась — сверху приходит её дальний край. Внутри полосы
 * текстура привязана к миру (сдвиг по модулю плитки T). Декорации — пул элементов: уехавший вниз
 * перерисовывается сверху в духе текущей зоны, поэтому смена пейзажа «наезжает», а не мигает.
 * Всё — SVG и CSS (words.css, «Трасса · пейзаж»), двигается только transform.
 */
import { h } from "./dom";

export type Biome = "campo" | "costa" | "pueblo" | "mancha";
export const BIOMES: { id: Biome; name: string }[] = [
  { id: "campo", name: "🌳 Campiña" },
  { id: "costa", name: "🌊 Costa del Sol" },
  { id: "pueblo", name: "🏘️ Pueblo blanco" },
  { id: "mancha", name: "🌾 La Mancha" },
];

/** Плитка текстур по вертикали: все фактуры зон повторяются с этим шагом. */
const T = 128;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <X>(list: [X, number][]): X => {
  let r = Math.random() * list.reduce((s, [, w]) => s + w, 0);
  for (const [x, w] of list) if ((r -= w) <= 0) return x;
  return list[0][0];
};

/** Общие градиенты и узоры: один раз на сцену, декорации на них ссылаются. */
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <pattern id="r3tile" width="7" height="5" patternUnits="userSpaceOnUse"><rect width="7" height="5" fill="#c2410c"/><path d="M0 4.6h7" stroke="#7c2d12" stroke-opacity=".5"/><path d="M3.5 0v4.6" stroke="#fdba74" stroke-opacity=".35"/></pattern>
  <radialGradient id="r3leaf" cx=".38" cy=".35"><stop offset="0" stop-color="#86d061"/><stop offset=".7" stop-color="#3f8a2a"/><stop offset="1" stop-color="#2a6a1d"/></radialGradient>
  <radialGradient id="r3olive" cx=".38" cy=".35"><stop offset="0" stop-color="#b9c48e"/><stop offset=".75" stop-color="#7d8a52"/><stop offset="1" stop-color="#5c6a38"/></radialGradient>
  <radialGradient id="r3orange" cx=".38" cy=".35"><stop offset="0" stop-color="#4ade80"/><stop offset=".7" stop-color="#166534"/><stop offset="1" stop-color="#14532d"/></radialGradient>
  <linearGradient id="r3frond" x1="0" x2="1"><stop offset="0" stop-color="#2f7d32"/><stop offset=".5" stop-color="#5fb84a"/><stop offset="1" stop-color="#2f7d32"/></linearGradient>
  <linearGradient id="r3wake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="r3cap" cx=".4" cy=".35"><stop offset="0" stop-color="#64748b"/><stop offset="1" stop-color="#1e293b"/></radialGradient>
</defs></svg>`;

/* ─── Декорации (вид сверху, тень запечена вправо-вниз) ─── */

const shadow = (inner: string, dx = 6, dy = 9) => `<g transform="translate(${dx} ${dy})" fill="#000" opacity=".2">${inner}</g>`;

const SVG = {
  palm: () => {
    const leaves = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45 + rnd(-8, 8)} 50 50)" d="M50 50 Q63 30 50 3 Q37 30 50 50Z" fill="url(#r3frond)"/>`).join("");
    const sh = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45} 50 50)" d="M50 50 Q63 30 50 3 Q37 30 50 50Z"/>`).join("");
    return `<svg viewBox="-8 -8 124 124">${shadow(sh, 10, 14)}${leaves}<circle cx="50" cy="50" r="6" fill="#8b5a2b"/></svg>`;
  },
  olive: () => {
    const trees = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const x = 20 + c * 40 + rnd(-4, 4), y = 20 + r * 40 + rnd(-4, 4), s = rnd(11, 15);
        trees.push(`<circle cx="${x + 4}" cy="${y + 6}" r="${s}" fill="#000" opacity=".18"/><circle cx="${x}" cy="${y}" r="${s}" fill="url(#r3olive)"/><circle cx="${x - s * 0.35}" cy="${y - s * 0.3}" r="${s * 0.4}" fill="#d6dcb4" opacity=".35"/>`);
      }
    return `<svg viewBox="0 0 140 140">${trees.join("")}</svg>`;
  },
  orange: () => {
    const dots = Array.from({ length: 7 }, () => `<circle cx="${rnd(30, 70)}" cy="${rnd(30, 70)}" r="3.4" fill="#fb923c"/>`).join("");
    return `<svg viewBox="0 0 110 110">${shadow('<circle cx="50" cy="50" r="38"/>')}<circle cx="50" cy="50" r="38" fill="url(#r3orange)"/>${dots}</svg>`;
  },
  cypress: () => `<svg viewBox="0 0 60 60"><circle cx="34" cy="36" r="17" fill="#000" opacity=".2"/><circle cx="26" cy="26" r="17" fill="#14532d"/><circle cx="22" cy="21" r="8" fill="#22863a" opacity=".6"/></svg>`,
  house: (w: number, ht: number) => {
    // Половина домов — черепица в два ската, половина — плоская белая крыша-терраса с патио.
    if (Math.random() < 0.55)
      return `<svg viewBox="0 0 ${w + 8} ${ht + 10}"><rect x="7" y="9" width="${w}" height="${ht}" fill="#000" opacity=".22"/><rect width="${w}" height="${ht}" fill="#f8fafc"/><rect x="2" y="2" width="${w - 4}" height="${ht / 2 - 2}" fill="url(#r3tile)"/><rect x="2" y="${ht / 2}" width="${w - 4}" height="${ht / 2 - 2}" fill="url(#r3tile)"/><rect x="2" y="${ht / 2}" width="${w - 4}" height="${ht / 2 - 2}" fill="#000" opacity=".16"/><path d="M2 ${ht / 2}H${w - 2}" stroke="#fed7aa" stroke-width="1.6"/></svg>`;
    const p = Math.min(w, ht) * 0.34;
    return `<svg viewBox="0 0 ${w + 8} ${ht + 10}"><rect x="7" y="9" width="${w}" height="${ht}" fill="#000" opacity=".22"/><rect width="${w}" height="${ht}" fill="#fff"/><rect x="2.5" y="2.5" width="${w - 5}" height="${ht - 5}" fill="#eef1f5" stroke="#dde3ea"/><rect x="${w - p - 6}" y="6" width="${p}" height="${p}" rx="2" fill="#84cc16"/><circle cx="${w - p / 2 - 6}" cy="${6 + p / 2}" r="${p * 0.3}" fill="#3f8a2a"/><circle cx="10" cy="${ht - 10}" r="4" fill="#cbd5e1"/><rect x="${w * 0.35}" y="${ht * 0.55}" width="5" height="5" fill="#cbd5e1"/></svg>`;
  },
  church: () =>
    `<svg viewBox="0 0 90 130">${shadow('<rect x="20" y="40" width="44" height="84"/><rect x="26" y="0" width="32" height="34"/>', 8, 10)}<rect x="20" y="40" width="44" height="84" fill="#fff"/><rect x="22" y="42" width="19" height="80" fill="url(#r3tile)"/><rect x="43" y="42" width="19" height="80" fill="url(#r3tile)"/><rect x="43" y="42" width="19" height="80" fill="#000" opacity=".16"/><rect x="26" y="0" width="32" height="34" fill="#fff"/><path d="M28 2L42 17L28 32Z" fill="#c2410c"/><path d="M56 2L42 17L56 32Z" fill="#9a3412"/><path d="M28 2L42 17L56 2Z" fill="#ea580c"/><path d="M28 32L42 17L56 32Z" fill="#7c2d12"/><circle cx="42" cy="17" r="7" fill="#a16207"/><circle cx="42" cy="17" r="4.5" fill="#fff"/><circle cx="43.5" cy="15.5" r="1.4" fill="#f97316"/></svg>`,
  mill: () =>
    `<svg viewBox="0 0 120 120">${shadow('<circle cx="60" cy="60" r="20"/>', 9, 12)}<circle cx="60" cy="60" r="20" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><circle cx="60" cy="60" r="12" fill="url(#r3cap)"/><g class="r3-sails"><g fill="#f5f5f4" stroke="#78716c" stroke-width="1.4">${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a} 60 60)"><rect x="56" y="6" width="9" height="50" rx="1"/><path d="M56 16h9M56 26h9M56 36h9M56 46h9" stroke-width=".8"/></g>`).join("")}</g></g><circle cx="60" cy="60" r="3.5" fill="#44403c"/></svg>`,
  boat: () =>
    `<svg viewBox="0 0 40 120"><path d="M20 60 L4 120 L36 120Z" fill="url(#r3wake)"/><path d="M20 4 Q34 26 32 62 Q20 72 8 62 Q6 26 20 4Z" fill="#fff" stroke="#94a3b8"/><path d="M20 14 Q28 30 27 56 Q20 61 13 56 Q12 30 20 14Z" fill="#b45309"/><rect x="14" y="34" width="12" height="12" rx="2" fill="#e2e8f0"/><path d="M20 10 V60" stroke="#475569" stroke-width="1.2"/></svg>`,
  umbrella: () => {
    const c = pick<[string, string]>([[["#ef4444", "#fff"], 1], [["#2563eb", "#fff"], 1], [["#f59e0b", "#fff"], 1], [["#10b981", "#fef3c7"], 1]]);
    const wedges = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45} 30 30)" d="M30 30 L30 6 A24 24 0 0 1 47 13Z" fill="${c[i % 2]}"/>`).join("");
    return `<svg viewBox="0 0 80 70"><rect x="38" y="36" width="16" height="30" rx="2" fill="${c[0]}" opacity=".8" transform="rotate(12 46 51)"/><circle cx="37" cy="38" r="24" fill="#000" opacity=".15"/>${wedges}<circle cx="30" cy="30" r="3" fill="#475569"/></svg>`;
  },
};

type Kind = keyof typeof SVG | "tree" | "bush" | "flowers" | "rock" | "bale" | "sun" | "wheat";
/** Размер [ширина, высота], можно ли обрезать краем экрана (большие постройки и рощи — можно). */
const SIZE: Record<Kind, () => [number, number, boolean]> = {
  tree: () => ((s) => [s, s, false])(rnd(46, 92)),
  bush: () => ((s) => [s, s, false])(rnd(16, 32)),
  flowers: () => ((s) => [s, s, false])(rnd(26, 46)),
  rock: () => ((s) => [s, s * 0.8, false])(rnd(14, 30)),
  bale: () => ((s) => [s, s, false])(rnd(18, 26)),
  sun: () => [rnd(70, 130), rnd(90, 170), true],
  wheat: () => [rnd(80, 140), rnd(110, 200), true],
  palm: () => ((s) => [s, s, true])(rnd(70, 110)),
  olive: () => ((s) => [s, s, true])(rnd(110, 160)),
  orange: () => ((s) => [s, s, false])(rnd(34, 50)),
  cypress: () => [28, 28, false],
  house: () => [rnd(56, 110), rnd(42, 76), true],
  church: () => [90, 130, true],
  mill: () => ((s) => [s, s, true])(rnd(84, 110)),
  boat: () => [22, 66, false],
  umbrella: () => [44, 38, false],
};
const KINDS: Record<Biome, [Kind, number][]> = {
  campo: [["tree", 5], ["bush", 2], ["flowers", 1.5], ["rock", 0.8], ["bale", 1.2], ["sun", 0.8]],
  costa: [["palm", 4], ["umbrella", 3], ["bush", 1], ["house", 0.8]],
  pueblo: [["house", 6], ["orange", 2], ["cypress", 1.5], ["church", 0.5]],
  mancha: [["olive", 3], ["wheat", 2], ["mill", 1.2], ["bale", 1], ["rock", 0.6], ["house", 0.4]],
};

type Deco = { el: HTMLElement; y: number; h: number; x: number; w: number };
type Zone = { b: Biome; el: HTMLElement; tex: HTMLElement; near: number; far: number };

export function scenery(ground: HTMLElement, decoLayer: HTMLElement, sky: HTMLElement) {
  ground.insertAdjacentHTML("beforeend", DEFS);
  let W = 0, H = 0, gap = 0, biome: Biome = "campo", y = 0;
  const decos: Deco[] = [];
  const zones: Zone[] = [];

  /** Ширина моря у левой обочины (пляж — 26px до дороги). */
  const seaW = () => Math.max(0, gap - 26);

  const dress = (d: Deco, yy: number) => {
    d.y = yy;
    d.el.hidden = gap < 14;
    if (d.el.hidden) return;
    const leftSide = Math.random() < 0.5;
    // Слева на побережье — море: там только лодки, если море вообще видно.
    let kind: Kind;
    if (biome === "costa" && leftSide) kind = seaW() > 36 && Math.random() < 0.4 ? "boat" : "umbrella";
    else kind = pick(KINDS[biome]);
    let [w, ht, crop] = SIZE[kind]();
    if (!crop) {
      const k = Math.min(1, Math.max(10, gap - 8) / w);
      w *= k;
      ht *= k;
    }
    // Обрезаемое может уходить за край экрана, но не на дорогу.
    const lo = crop ? -w * 0.45 : 4;
    const hi = Math.max(lo, gap - w - 4);
    let x = rnd(lo, hi);
    if (kind === "boat") x = rnd(6, Math.max(6, seaW() - w - 8));
    if (kind === "umbrella" && biome === "costa" && leftSide) x = Math.max(4, seaW() - w * 0.25);
    const left = leftSide ? x : W - gap + (gap - x - w);
    // Не ставить на соседа: если пересекается — сдвигаем выше, за край экрана это не видно.
    for (let k = 0; k < 8; k++) {
      const hit = decos.find((o) => o !== d && !o.el.hidden && left < o.x + o.w && o.x < left + w && yy < o.y + o.h - 14 && o.y < yy + ht + 6);
      if (!hit) break;
      yy = hit.y - ht - 10;
    }
    d.y = yy;
    d.x = left;
    d.w = w;
    d.h = ht + 20;
    d.el.className = `r3-d is-${kind}`;
    d.el.innerHTML = kind in SVG ? (kind === "house" ? SVG.house(Math.round(w), Math.round(ht)) : (SVG as unknown as Record<string, () => string>)[kind]()) : "";
    d.el.style.cssText = `left:${left}px;width:${w}px;height:${ht}px;--hue:${Math.round(rnd(-14, 14))}deg;--r:${kind === "boat" ? rnd(-12, 12) : kind === "house" || kind === "wheat" || kind === "sun" ? rnd(-6, 6) : rnd(0, 360)}deg`;
  };

  const zone = (b: Biome): Zone => {
    const tex = h("div.r3-ztex", {}, b === "costa" ? h("div.r3-sea", {}, h("i")) : null);
    const el = h("div.r3-zone.is-" + b, {}, tex);
    ground.append(el);
    return { b, el, tex, near: 0, far: -Infinity };
  };

  return {
    layout(w: number, ht: number, rw: number) {
      W = w;
      H = ht;
      gap = (w - rw) / 2;
      ground.style.setProperty("--gap", `${gap}px`);
      ground.style.setProperty("--sea", `${seaW()}px`);
    },
    plant(n = 22) {
      for (let i = 0; i < n; i++) {
        const d: Deco = { el: h("i"), y: 0, h: 0, x: 0, w: 0 };
        decoLayer.append(d.el);
        decos.push(d);
        dress(d, Math.random() * H);
      }
    },
    get biome() {
      return biome;
    },
    /** Сменить зону: её земля въезжает сверху, декорации сверху — уже новые. */
    set(b: Biome) {
      if (b === biome) return;
      zones.at(-1) && zones.at(-1)!.far === -Infinity && (zones.at(-1)!.far = -40);
      biome = b;
      if (b !== "campo") zones.push(zone(b));
    },
    step(dy: number) {
      y += dy;
      for (const d of decos) {
        d.y += dy;
        if (d.y > H + 20) dress(d, -d.h - Math.random() * 160);
        d.el.style.transform = `translate3d(0,${d.y}px,0) rotate(var(--r))`;
      }
      for (let i = zones.length - 1; i >= 0; i--) {
        const z = zones[i];
        z.near += dy;
        z.far += dy;
        if (z.far > H + 120) {
          z.el.remove();
          zones.splice(i, 1);
          continue;
        }
        const top = Math.max(z.far, -T - 120), bottom = Math.min(z.near, H + T + 120);
        z.el.style.transform = `translate3d(0,${top}px,0)`;
        z.el.style.height = `${Math.max(0, bottom - top)}px`;
        const phase = (((y - top) % T) + T) % T;
        z.tex.style.transform = `translate3d(0,${phase}px,0)`;
      }
    },
    /** Стая птиц через экран: чайки над морем, аисты над посёлком, ласточки в поле. */
    flock() {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const type = biome === "costa" ? "gull" : biome === "pueblo" ? "stork" : "swift";
      const n = type === "stork" ? 2 : Math.round(rnd(3, 6));
      // Над обочиной, вдоль дороги: над табличками с ответами птицы не летают — не мешают читать.
      if (gap < 70) return;
      const side = Math.random() < 0.5 ? 0 : W - gap;
      const up = Math.random() < 0.5;
      const x0 = side + rnd(0.25, 0.75) * gap, x1 = side + rnd(0.25, 0.75) * gap;
      const y0 = up ? H + 80 : -80, y1 = up ? -120 : H + 120;
      const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90;
      const dur = type === "stork" ? rnd(9000, 12000) : rnd(5500, 8000);
      for (let i = 0; i < n; i++) {
        const b = h("i.r3-bird.is-" + type, { html: BIRD });
        const ox = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 26, oy = Math.ceil(i / 2) * 22;
        sky.append(b);
        const at = (x: number, yy: number) => `translate(${x + ox}px,${yy + oy}px) rotate(${ang}deg)`;
        b.style.setProperty("--flap", `${rnd(0.28, 0.4)}s`);
        b.animate([{ transform: at(x0, y0) }, { transform: at(x1, y1) }], { duration: dur, delay: i * 90, easing: "linear", fill: "both" }).onfinish = () => b.remove();
      }
    },
  };
}

/** Птица сверху, головой вверх; крылья машут (CSS), тень на земле — копия ниже и правее. */
const BIRD = `<svg viewBox="0 0 60 40" aria-hidden="true"><g class="sh" transform="translate(16 26)" opacity=".22"><g class="w"><path d="M30 16 Q16 5 2 11 Q16 13 30 20Z"/><path d="M30 16 Q44 5 58 11 Q44 13 30 20Z"/></g><ellipse cx="30" cy="18" rx="3.4" ry="9"/></g><g class="b"><g class="w"><path d="M30 16 Q16 5 2 11 Q16 13 30 20Z"/><path d="M30 16 Q44 5 58 11 Q44 13 30 20Z"/></g><ellipse cx="30" cy="18" rx="3.4" ry="9"/><circle cx="30" cy="9.5" r="2.6"/></g></svg>`;
