/**
 * Пейзаж «Трассы»: вид сверху, поездка через Испанию — зоны сменяют друг друга по ходу игры.
 *
 *   campo     — campiña: трава, деревья, тюки сена, подсолнухи (фон r3-grass)
 *   pueblo    — белый посёлок Андалусии: вальмовые черепичные крыши, азотеи, дома с патио, церковь
 *   costa     — Costa del Sol: море с лодками, пляж с зонтиками, пальмы
 *   mancha    — La Mancha: оливы, пшеница, ветряные мельницы
 *   valencia  — уэрта: апельсиновые рощи, баррака, рисовые поля, Ciutat de les Arts i les Ciències
 *   feria     — ярмарка: шапито, карусель, цепочная карусель, касеты, шарики, платья фламенко
 *   barcelona — кварталы Эшампле, Sagrada Família со строительными кранами, Torre Glòries
 *   pirineos  — горы low-poly со снегом, сосны, скалы, горные озёра
 *   bilbao    — городские крыши, Guggenheim с мостом La Salve, Puppy
 *   euskadi   — Кантабрийское море, скалы, Gaztelugatxe, касерíо, коровы
 *   gijon     — набережная, пляж San Lorenzo, Elogio del Horizonte
 *   asturias  — Picos de Europa, орреo, коровы, Covadonga
 *
 * Как устроено. Земля зоны — «полоса» в мире: появляется у верхнего края экрана и уезжает вниз вместе
 * с дорогой (ближний край), а когда зона кончилась — сверху приходит её дальний край. Внутри полосы
 * текстура привязана к миру (сдвиг по модулю плитки T). Декорации — пул элементов: уехавший вниз
 * перерисовывается сверху в духе текущей зоны, поэтому смена пейзажа «наезжает», а не мигает.
 * Достопримечательности зоны ставятся первыми, как только зона въехала. В городах вдоль дороги —
 * тротуары с пешеходами. Всё — SVG и CSS (words.css, «Трасса · пейзаж»): каждый кадр меняется только
 * transform, а карусели, краны, флаги и шаги — CSS-анимации HTML-обёрток, их крутит видеокарта.
 */
import { h } from "./dom";

export type Biome = "campo" | "pueblo" | "costa" | "mancha" | "valencia" | "feria" | "barcelona" | "pirineos" | "bilbao" | "euskadi" | "gijon" | "asturias";
export const BIOMES: { id: Biome; name: string }[] = [
  { id: "campo", name: "🌳 Campiña" },
  { id: "pueblo", name: "🏘️ Pueblo blanco" },
  { id: "costa", name: "🌊 Costa del Sol" },
  { id: "mancha", name: "🌾 La Mancha" },
  { id: "valencia", name: "🍊 València" },
  { id: "feria", name: "🎪 Feria y circo" },
  { id: "barcelona", name: "⛪ Barcelona" },
  { id: "pirineos", name: "🏔️ Pirineos" },
  { id: "bilbao", name: "🏛️ Bilbao" },
  { id: "euskadi", name: "🌊 Euskadi" },
  { id: "gijon", name: "⚓ Gijón" },
  { id: "asturias", name: "⛰️ Picos de Europa" },
];
/** Слева море. */
const SEA = new Set<Biome>(["costa", "euskadi", "gijon"]);
/** Город: тротуары и пешеходы. */
const URBAN = new Set<Biome>(["pueblo", "valencia", "feria", "barcelona", "bilbao", "gijon"]);

/** Плитка текстур по вертикали: все фактуры зон повторяются с этим шагом. */
const T = 128;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const one = <X>(list: readonly X[]): X => list[Math.floor(Math.random() * list.length)];
const pick = <X>(list: [X, number][]): X => {
  let r = Math.random() * list.reduce((s, [, w]) => s + w, 0);
  for (const [x, w] of list) if ((r -= w) <= 0) return x;
  return list[0][0];
};
const f = (n: number) => n.toFixed(1);
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
/** Свет сверху-слева: t > 0 — светлее, t < 0 — темнее. */
const tone = (c: string, t: number) => (t > 0 ? mix(c, "#ffffff", t) : mix(c, "#000000", -t));
const pts = (p: number[][]) => p.map((q) => `${f(q[0])},${f(q[1])}`).join(" ");
/** Грань: обводка тем же цветом прячет щели сглаживания между соседними гранями. */
const poly = (p: number[][], fill: string) => `<polygon points="${pts(p)}" fill="${fill}" stroke="${fill}" stroke-width=".7" stroke-linejoin="round"/>`;

/** Общие градиенты и узоры: один раз на сцену, декорации на них ссылаются. */
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <pattern id="r3th" width="5" height="4.4" patternUnits="userSpaceOnUse"><path d="M0 4h5" stroke="#000" stroke-opacity=".3" stroke-width="1.1"/><path d="M2.5 0v4" stroke="#fff" stroke-opacity=".16"/></pattern>
  <pattern id="r3tv" width="4.4" height="5" patternUnits="userSpaceOnUse"><path d="M4 0v5" stroke="#000" stroke-opacity=".3" stroke-width="1.1"/><path d="M0 2.5h4" stroke="#fff" stroke-opacity=".16"/></pattern>
  <pattern id="r3chk" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#d48b5c"/><rect width="4" height="4" fill="#c97a4c"/><rect x="4" y="4" width="4" height="4" fill="#c97a4c"/></pattern>
  <pattern id="r3thatch" width="3" height="6" patternUnits="userSpaceOnUse"><path d="M1.5 0v6" stroke="#5c4310" stroke-opacity=".35"/></pattern>
  <pattern id="r3fl" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#4d8a2a"/><circle cx="2" cy="2" r="1.9" fill="#f472b6"/><circle cx="6.5" cy="3" r="1.7" fill="#facc15"/><circle cx="3.5" cy="6.8" r="1.8" fill="#f97316"/><circle cx="7.6" cy="7.5" r="1.5" fill="#fff"/><circle cx="5" cy="5" r="1.2" fill="#a855f7"/></pattern>
  <radialGradient id="r3leaf" cx=".38" cy=".35"><stop offset="0" stop-color="#86d061"/><stop offset=".7" stop-color="#3f8a2a"/><stop offset="1" stop-color="#2a6a1d"/></radialGradient>
  <radialGradient id="r3olive" cx=".38" cy=".35"><stop offset="0" stop-color="#b9c48e"/><stop offset=".75" stop-color="#7d8a52"/><stop offset="1" stop-color="#5c6a38"/></radialGradient>
  <radialGradient id="r3orange" cx=".38" cy=".35"><stop offset="0" stop-color="#4ade80"/><stop offset=".7" stop-color="#166534"/><stop offset="1" stop-color="#14532d"/></radialGradient>
  <radialGradient id="r3stone" cx=".35" cy=".3"><stop offset="0" stop-color="#ead7b0"/><stop offset=".7" stop-color="#b8956a"/><stop offset="1" stop-color="#7c6040"/></radialGradient>
  <radialGradient id="r3ball" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="r3frond" x1="0" x2="1"><stop offset="0" stop-color="#2f7d32"/><stop offset=".5" stop-color="#5fb84a"/><stop offset="1" stop-color="#2f7d32"/></linearGradient>
  <linearGradient id="r3wake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="r3lit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
  <linearGradient id="r3ti" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".45" stop-color="#b6c2d1"/><stop offset=".7" stop-color="#dfe6ee"/><stop offset="1" stop-color="#7c8a9e"/></linearGradient>
  <linearGradient id="r3pool" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset="1" stop-color="#0891b2"/></linearGradient>
  <linearGradient id="r3river" x1="0" x2="1"><stop offset="0" stop-color="#1e5f74"/><stop offset=".5" stop-color="#2b7c8f"/><stop offset="1" stop-color="#1e5f74"/></linearGradient>
  <linearGradient id="r3glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#0c4a6e"/></linearGradient>
  <radialGradient id="r3cap" cx=".4" cy=".35"><stop offset="0" stop-color="#64748b"/><stop offset="1" stop-color="#1e293b"/></radialGradient>
  <radialGradient id="r3lake" cx=".4" cy=".4"><stop offset="0" stop-color="#155e75"/><stop offset=".75" stop-color="#0e7490"/><stop offset="1" stop-color="#67c6d6"/></radialGradient>
</defs></svg>`;

/* ─── Детали (вид сверху, свет сверху-слева, тень вправо-вниз) ─── */

const shadow = (inner: string, dx = 6, dy = 9) => `<g transform="translate(${dx} ${dy})" fill="#000" opacity=".2">${inner}</g>`;
/** Анимированная HTML-обёртка поверх SVG декорации: центр (cx, cy) и сторона s — в единицах viewBox (vw × vh). */
const layer = (inner: string, cls: string, cx: number, cy: number, s: number, vw: number, vh: number, style = "") =>
  `<b class="${cls}" style="left:${f(((cx - s / 2) / vw) * 100)}%;top:${f(((cy - s / 2) / vh) * 100)}%;width:${f((s / vw) * 100)}%;height:${f((s / vh) * 100)}%;${style}">${inner}</b>`;

const ROOF = ["#c4532f", "#b84a2a", "#cf6a3c", "#a9452b", "#d0703f"];
/** Вальмовая крыша (4 ската): светлый скат сверху, тёмный снизу, черепица рядами вдоль карниза. */
const hip = (x: number, y: number, w: number, ht: number, base: string) => {
  const r = Math.min(w, ht) / 2, wide = w >= ht;
  const a = [x + r, y + r], b = wide ? [x + w - r, y + r] : [x + r, y + ht - r];
  const A = [x, y], B = [x + w, y], C = [x + w, y + ht], D = [x, y + ht];
  const faces: [number[][], number, string][] = wide
    ? [[[A, B, b, a], 0.2, "h"], [[A, a, D], 0.06, "v"], [[B, C, b], -0.2, "v"], [[D, a, b, C], -0.32, "h"]]
    : [[[A, B, a], 0.2, "h"], [[A, a, b, D], 0.06, "v"], [[B, C, b, a], -0.2, "v"], [[D, b, C], -0.32, "h"]];
  const [m, n] = wide ? [b, a] : [a, b];
  const L = (p: number[], q: number[]) => `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`;
  return (
    faces.map(([p, t, d]) => poly(p, tone(base, t)) + `<polygon points="${pts(p)}" fill="url(#r3t${d})"/>`).join("") +
    `<path d="${L(A, a)}${L(a, b)}${L(b, C)}${L(B, m)}${L(D, n)}" stroke="${tone(base, 0.4)}" stroke-width="1.3" stroke-opacity=".75" fill="none" stroke-linecap="round"/>` +
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(ht)}" fill="none" stroke="${tone(base, -0.45)}" stroke-opacity=".5"/>`
  );
};
/** Двускатная крыша: конёк горизонтальный или вертикальный (vert). */
const gable = (x: number, y: number, w: number, ht: number, base: string, vert = false, pat = "") => {
  const p1 = vert ? [[x, y], [x + w / 2, y], [x + w / 2, y + ht], [x, y + ht]] : [[x, y], [x + w, y], [x + w, y + ht / 2], [x, y + ht / 2]];
  const p2 = vert ? [[x + w / 2, y], [x + w, y], [x + w, y + ht], [x + w / 2, y + ht]] : [[x, y + ht / 2], [x + w, y + ht / 2], [x + w, y + ht], [x, y + ht]];
  const tex = pat || `url(#r3t${vert ? "v" : "h"})`;
  return (
    poly(p1, tone(base, 0.16)) + `<polygon points="${pts(p1)}" fill="${tex}"/>` + poly(p2, tone(base, -0.28)) + `<polygon points="${pts(p2)}" fill="${tex}"/>` +
    `<path d="${vert ? `M${f(x + w / 2)} ${f(y)}V${f(y + ht)}` : `M${f(x)} ${f(y + ht / 2)}H${f(x + w)}`}" stroke="${tone(base, 0.45)}" stroke-width="1.6"/>` +
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(ht)}" fill="none" stroke="${tone(base, -0.45)}" stroke-opacity=".5"/>`
  );
};
const chimney = (x: number, y: number) => `<rect x="${f(x + 2)}" y="${f(y + 3)}" width="7" height="7" fill="#000" opacity=".25"/><rect x="${f(x)}" y="${f(y)}" width="7" height="7" fill="#e7e5e4" stroke="#a8a29e"/><rect x="${f(x + 1.8)}" y="${f(y + 1.8)}" width="3.4" height="3.4" fill="#292524"/>`;

/** Предметы на плоской крыше и в патио; s — масштаб. */
const ITEM: Record<string, (x: number, y: number, s: number) => string> = {
  tank: (x, y, s) => `<circle cx="${f(x + 2)}" cy="${f(y + 3)}" r="${f(s * 0.3)}" fill="#000" opacity=".2"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.3)}" fill="url(#r3cap)"/><circle cx="${f(x - s * 0.08)}" cy="${f(y - s * 0.08)}" r="${f(s * 0.1)}" fill="#94a3b8"/>`,
  solar: (x, y, s) =>
    `<g transform="translate(${f(x)} ${f(y)})"><rect x="${f(-s * 0.5 + 3)}" y="${f(-s * 0.3 + 4)}" width="${f(s)}" height="${f(s * 0.6)}" fill="#000" opacity=".22"/><rect x="${f(-s * 0.5)}" y="${f(-s * 0.3)}" width="${f(s)}" height="${f(s * 0.6)}" fill="#1e3a8a" stroke="#e2e8f0"/><path d="M${f(-s * 0.17)} ${f(-s * 0.3)}v${f(s * 0.6)}M${f(s * 0.17)} ${f(-s * 0.3)}v${f(s * 0.6)}M${f(-s * 0.5)} 0h${f(s)}" stroke="#60a5fa" stroke-opacity=".6"/><path d="M${f(-s * 0.45)} ${f(-s * 0.25)}l${f(s * 0.3)} ${f(s * 0.18)}" stroke="#fff" stroke-opacity=".5"/></g>`,
  laundry: (x, y, s) => {
    const c = ["#ef4444", "#3b82f6", "#facc15", "#fff", "#10b981", "#ec4899"];
    let r = "";
    for (const dy of [-s * 0.18, s * 0.18]) {
      r += `<path d="M${f(x - s * 0.55)} ${f(y + dy)}h${f(s * 1.1)}" stroke="#64748b" stroke-width=".7"/>`;
      for (let i = 0; i < 4; i++) r += `<rect x="${f(x - s * 0.5 + i * s * 0.27)}" y="${f(y + dy - 1)}" width="${f(s * 0.2)}" height="${f(s * 0.16)}" fill="${one(c)}" stroke="#0000001a"/>`;
    }
    return r;
  },
  plants: (x, y, s) =>
    [[-0.3, -0.1], [0, 0.2], [0.3, -0.05]]
      .map(([a, b]) => `<circle cx="${f(x + a * s + 1.5)}" cy="${f(y + b * s + 2)}" r="${f(s * 0.16)}" fill="#000" opacity=".2"/><circle cx="${f(x + a * s)}" cy="${f(y + b * s)}" r="${f(s * 0.16)}" fill="#b45309"/><circle cx="${f(x + a * s)}" cy="${f(y + b * s)}" r="${f(s * 0.13)}" fill="url(#r3leaf)"/>${Math.random() < 0.4 ? `<circle cx="${f(x + a * s + 1)}" cy="${f(y + b * s - 1)}" r="1.4" fill="#f43f5e"/>` : ""}`)
      .join(""),
  box: (x, y, s) => `<rect x="${f(x - s * 0.35 + 3)}" y="${f(y - s * 0.28 + 4)}" width="${f(s * 0.7)}" height="${f(s * 0.56)}" fill="#000" opacity=".25"/><rect x="${f(x - s * 0.35)}" y="${f(y - s * 0.28)}" width="${f(s * 0.7)}" height="${f(s * 0.56)}" fill="#fff" stroke="#d6dbe2"/><rect x="${f(x - s * 0.35)}" y="${f(y - s * 0.28)}" width="${f(s * 0.7)}" height="${f(s * 0.56)}" fill="url(#r3lit)"/>`,
  pool: (x, y, s) => `<rect x="${f(x - s * 0.55)}" y="${f(y - s * 0.32)}" width="${f(s * 1.1)}" height="${f(s * 0.64)}" rx="3" fill="url(#r3pool)" stroke="#f1f5f9" stroke-width="2"/><path d="M${f(x - s * 0.4)} ${f(y - s * 0.05)}q${f(s * 0.1)} -3 ${f(s * 0.2)} 0t${f(s * 0.2)} 0" stroke="#fff" stroke-opacity=".7" fill="none"/><rect x="${f(x - s * 0.55)}" y="${f(y - s * 0.32)}" width="${f(s * 1.1)}" height="4" fill="#000" opacity=".12"/>`,
  ac: (x, y, s) => `<rect x="${f(x - s * 0.2 + 1.5)}" y="${f(y - s * 0.15 + 2)}" width="${f(s * 0.4)}" height="${f(s * 0.3)}" fill="#000" opacity=".22"/><rect x="${f(x - s * 0.2)}" y="${f(y - s * 0.15)}" width="${f(s * 0.4)}" height="${f(s * 0.3)}" rx="1.5" fill="#cbd5e1"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.1)}" fill="#64748b"/>`,
  sunbed: (x, y, s) =>
    [-0.22, 0.22].map((a) => `<rect x="${f(x + a * s - s * 0.08)}" y="${f(y - s * 0.2)}" width="${f(s * 0.16)}" height="${f(s * 0.5)}" rx="1.5" fill="#fff" stroke="#94a3b8" stroke-width=".6"/>`).join("") +
    `<circle cx="${f(x)}" cy="${f(y - s * 0.28)}" r="${f(s * 0.2)}" fill="#f97316"/><circle cx="${f(x)}" cy="${f(y - s * 0.28)}" r="${f(s * 0.2)}" fill="url(#r3ball)"/>`,
};
/** Разложить 2–3 предмета по углам площадки. */
const items = (x: number, y: number, w: number, ht: number, from: string[]) => {
  const slots = [[0.26, 0.28], [0.74, 0.28], [0.26, 0.72], [0.74, 0.72]].sort(() => Math.random() - 0.5);
  const s = Math.min(w, ht) * 0.42;
  return slots.slice(0, 2 + Math.floor(Math.random() * 2)).map(([a, b]) => ITEM[one(from)](x + a * w, y + b * ht, s)).join("");
};

/** Плоская белая крыша-терраса (азотея): парапет с тенью внутрь, бак, бельё, цветы, бассейн. */
const azotea = (w: number, ht: number) => {
  const floor = Math.random() < 0.35 ? "url(#r3chk)" : one(["#eef1f5", "#f3efe6", "#e9edf2"]);
  return (
    `<rect width="${w}" height="${ht}" rx="1.5" fill="#fdfdfd"/><rect x="3" y="3" width="${w - 6}" height="${ht - 6}" fill="${floor}"/>` +
    `<path d="M3 3H${w - 3}L${w - 7} 7H7V${ht - 7}L3 ${ht - 3}Z" fill="#000" opacity=".13"/>` +
    items(3, 3, w - 6, ht - 6, ["tank", "tank", "solar", "laundry", "plants", "plants", "box", "ac", ...(w > 70 && ht > 50 ? ["pool", "sunbed"] : [])])
  );
};
/** Дом с внутренним двориком: крыло сверху и слева, в патио — плитка, фонтан, апельсин, цветы. */
const patio = (w: number, ht: number, base: string) => {
  const tw = ht * 0.4, lw = w * 0.38, cw = w - lw, ch = ht - tw, fx = lw + cw / 2, fy = tw + ch / 2, fr = Math.min(cw, ch) * 0.17;
  return (
    `<rect x="${f(lw)}" y="${f(tw)}" width="${f(cw)}" height="${f(ch)}" fill="#fff"/><rect x="${f(lw)}" y="${f(tw)}" width="${f(cw - 3)}" height="${f(ch - 3)}" fill="url(#r3chk)"/>` +
    `<rect x="${f(lw)}" y="${f(tw)}" width="${f(cw)}" height="7" fill="#000" opacity=".2"/><rect x="${f(lw)}" y="${f(tw)}" width="6" height="${f(ch)}" fill="#000" opacity=".2"/>` +
    `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr + 2)}" fill="#f1f5f9"/><circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr)}" fill="url(#r3pool)"/><circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr * 0.3)}" fill="#fff"/>` +
    `<circle cx="${f(w - 9)}" cy="${f(ht - 9)}" r="${f(Math.min(cw, ch) * 0.2)}" fill="url(#r3orange)"/><circle cx="${f(w - 11)}" cy="${f(ht - 11)}" r="1.6" fill="#fb923c"/><circle cx="${f(w - 6)}" cy="${f(ht - 8)}" r="1.6" fill="#fb923c"/>` +
    ITEM.plants(lw + 10, ht - 9, Math.min(cw, ch) * 0.5) +
    hip(0, 0, lw, ht, base) + hip(0, 0, w, tw, base)
  );
};

/** Low-poly гора/скала/остров: кольца точек вокруг вершины, каждая грань закрашена по тому, смотрит ли она на свет. */
const lowpoly = (s: number, rings: [string, string][], ox = 0, oy = 0, flat = 1) => {
  const c = s / 2, n = 9 + Math.floor(Math.random() * 4);
  const P = [ox + c + rnd(-0.1, 0.1) * s, oy + c + rnd(-0.1, 0.1) * s];
  const base = Array.from({ length: n }, (_, i) => [(i / n) * Math.PI * 2 + rnd(-0.18, 0.18), rnd(0.74, 0.98)]);
  const R = rings.map((_, k) => {
    const t = (k + 1) / rings.length, j = k === rings.length - 1 ? 0 : s * 0.035;
    return base.map(([a, r]) => {
      const ex = ox + c + Math.cos(a) * r * c, ey = oy + c + Math.sin(a) * r * c * flat;
      return [P[0] + (ex - P[0]) * t + rnd(-j, j), P[1] + (ey - P[1]) * t + rnd(-j, j)];
    });
  });
  const shade = (tri: number[][], pal: [string, string]) => {
    const gx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3 - P[0], gy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3 - P[1];
    const l = Math.hypot(gx, gy) || 1;
    return poly(tri, mix(pal[0], pal[1], Math.max(0, Math.min(1, 0.5 - (gx + gy) / (l * 2.2) + rnd(-0.06, 0.06)))));
  };
  const edge = R[R.length - 1];
  let out = `<polygon points="${pts(edge.map(([x, y]) => [x + s * 0.05, y + s * 0.07]))}" fill="#000" opacity=".22"/>`;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    out += shade([P, R[0][i], R[0][j]], rings[0]);
    for (let k = 1; k < R.length; k++) out += shade([R[k - 1][i], R[k][i], R[k][j]], rings[k]) + shade([R[k - 1][i], R[k][j], R[k - 1][j]], rings[k]);
  }
  return out;
};
const SNOW: [string, string] = ["#a9b6c8", "#ffffff"];
const ROCK: [string, string] = ["#4b5563", "#c7ccd3"];
const ROCK2: [string, string] = ["#3f4650", "#9aa3ad"];
const SCREE: [string, string] = ["#5b5a49", "#a9a88a"];
const FOREST: [string, string] = ["#1f4d22", "#5f9a43"];
const MEADOW: [string, string] = ["#2f6b26", "#86c060"];

/** Ель сверху: три слоя звезды-хвои. */
const pineSvg = () => {
  const star = (r: number, n: number, rot: number, cx = 30, cy = 30) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i / (n * 2)) * Math.PI * 2 + rot, rr = i % 2 ? r * 0.55 : r;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    });
  const rot = rnd(0, 1);
  return `<svg viewBox="0 0 60 60"><polygon points="${pts(star(26, 9, rot, 37, 39))}" fill="#000" opacity=".25"/><polygon points="${pts(star(26, 9, rot))}" fill="#1d4a26"/><polygon points="${pts(star(18, 8, rot + 0.2))}" fill="#2d6b34"/><polygon points="${pts(star(10, 7, rot + 0.4))}" fill="#4a8f45"/><circle cx="27" cy="27" r="3" fill="#7bc06a" opacity=".7"/></svg>`;
};

/** Корова сверху: бурая астурийская или пятнистая. */
const cow = (x: number, y: number, a: number, spotted: boolean) => {
  const body = spotted ? "#f8fafc" : one(["#8b5a2b", "#a0682f", "#7a4b22"]);
  const spots = spotted ? `<circle cx="-3" cy="-2" r="3.4" fill="#111827"/><circle cx="3.5" cy="6" r="3" fill="#111827"/><circle cx="2" cy="-8" r="2" fill="#111827"/>` : `<ellipse rx="3" ry="6" fill="#fff" opacity=".12"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><ellipse cx="3" cy="4" rx="8" ry="13" fill="#000" opacity=".2"/><path d="M0 12 q3 4 1 8" stroke="${body}" stroke-width="1.6" fill="none"/><ellipse rx="7.5" ry="12" fill="${body}"/>${spots}<ellipse cy="-14" rx="4.6" ry="5.4" fill="${body}"/><ellipse cy="-17.5" rx="3.6" ry="2.4" fill="#f5c6b3"/><path d="M-4 -15 l-4 -2 M4 -15 l4 -2" stroke="${body}" stroke-width="2.4" stroke-linecap="round"/><path d="M-3 -17 l-2 -4 M3 -17 l2 -4" stroke="#f1e7d0" stroke-width="1.4" stroke-linecap="round"/></g>`;
};

/** Роща рядами: оливы, апельсины. */
const grove = (grad: string, fruit = "") => {
  const trees = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const x = 20 + c * 40 + rnd(-4, 4), y = 20 + r * 40 + rnd(-4, 4), s = rnd(11, 15);
      const fr = fruit ? Array.from({ length: 4 }, () => `<circle cx="${f(x + rnd(-s * 0.6, s * 0.6))}" cy="${f(y + rnd(-s * 0.6, s * 0.6))}" r="1.8" fill="${fruit}"/>`).join("") : "";
      trees.push(`<circle cx="${f(x + 4)}" cy="${f(y + 6)}" r="${f(s)}" fill="#000" opacity=".18"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="url(#${grad})"/><circle cx="${f(x - s * 0.35)}" cy="${f(y - s * 0.3)}" r="${f(s * 0.4)}" fill="#fff" opacity=".2"/>${fr}`);
    }
  return `<svg viewBox="0 0 140 140">${trees.join("")}</svg>`;
};

/** Флажок на шесте: колышется вся обёртка (.r3-flag). */
const FLAG = (c: string) => `<svg viewBox="-10 -10 20 20"><circle r="2" fill="#78350f"/><path d="M0 0 L9 -3 L0 -6Z" fill="${c}"/></svg>`;
/** Кольцо огоньков: два слоя мигают по очереди (.r3-twinkle). */
const BULBS = (odd: number) =>
  `<svg viewBox="0 0 100 100">${Array.from({ length: 20 }, (_, i) => {
    const a = ((i * 2 + odd) / 40) * Math.PI * 2;
    return `<circle cx="${f(50 + Math.cos(a) * 47.5)}" cy="${f(50 + Math.sin(a) * 47.5)}" r="1.6" fill="#fffbe6"/><circle cx="${f(50 + Math.cos(a) * 47.5)}" cy="${f(50 + Math.sin(a) * 47.5)}" r="3.2" fill="#fde047" opacity=".35"/>`;
  }).join("")}</svg>`;

/* ─── Декорации ─── */

const SVG: Record<string, (w: number, ht: number) => string> = {
  palm: () => {
    const leaves = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${f(i * 45 + rnd(-8, 8))} 50 50)" d="M50 50 Q63 30 50 3 Q37 30 50 50Z" fill="url(#r3frond)"/>`).join("");
    const sh = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45} 50 50)" d="M50 50 Q63 30 50 3 Q37 30 50 50Z"/>`).join("");
    return `<svg viewBox="-8 -8 124 124">${shadow(sh, 10, 14)}${leaves}<circle cx="50" cy="50" r="6" fill="#8b5a2b"/></svg>`;
  },
  olive: () => grove("r3olive"),
  naranjos: () => grove("r3orange", "#fb923c"),
  orange: () => {
    const dots = Array.from({ length: 7 }, () => `<circle cx="${f(rnd(30, 70))}" cy="${f(rnd(30, 70))}" r="3.4" fill="#fb923c"/>`).join("");
    return `<svg viewBox="0 0 110 110">${shadow('<circle cx="50" cy="50" r="38"/>')}<circle cx="50" cy="50" r="38" fill="url(#r3orange)"/>${dots}</svg>`;
  },
  cypress: () => `<svg viewBox="0 0 60 60"><circle cx="34" cy="36" r="17" fill="#000" opacity=".2"/><circle cx="26" cy="26" r="17" fill="#14532d"/><circle cx="22" cy="21" r="8" fill="#22863a" opacity=".6"/></svg>`,
  pine: pineSvg,
  /** Дом: вальмовая черепица с трубой, белая азотея или дом с патио — на юге азотей больше. */
  house: (w, ht) => {
    const base = one(ROOF);
    const south = cur === "pueblo" || cur === "costa" || cur === "valencia";
    const r = Math.random();
    let body: string;
    if (south && r < 0.42) body = azotea(w, ht);
    else if (w > 70 && ht > 50 && r < (south ? 0.68 : 0.3)) body = patio(w, ht, base);
    else {
      body = `<rect width="${w}" height="${ht}" fill="#fff"/>` + hip(0, 0, w, ht, base);
      if (Math.random() < 0.6) body += chimney(rnd(w * 0.15, w * 0.7), rnd(ht * 0.12, ht * 0.25));
      if (Math.random() < 0.3) body += ITEM.solar(w * 0.68, ht * 0.75, Math.min(w, ht) * 0.34);
    }
    return `<svg viewBox="0 0 ${w + 8} ${ht + 10}"><rect x="7" y="10" width="${w}" height="${ht}" fill="#000" opacity=".22"/>${body}</svg>`;
  },
  church: () =>
    `<svg viewBox="0 0 90 130">${shadow('<rect x="20" y="40" width="44" height="84"/><rect x="26" y="0" width="32" height="34"/>', 8, 10)}<rect x="20" y="40" width="44" height="84" fill="#fff"/>${gable(20, 40, 44, 84, "#c4532f", true)}<rect x="26" y="0" width="32" height="34" fill="#fff"/>${hip(28, 2, 28, 28, "#c2410c")}<circle cx="42" cy="16" r="7" fill="#a16207"/><circle cx="42" cy="16" r="4.5" fill="#fff"/><circle cx="43.5" cy="14.5" r="1.4" fill="#f97316"/></svg>`,
  mill: () =>
    `<svg viewBox="0 0 120 120">${shadow('<circle cx="60" cy="60" r="20"/>', 9, 12)}<circle cx="60" cy="60" r="20" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><circle cx="60" cy="60" r="12" fill="url(#r3cap)"/></svg>` +
    layer(`<svg viewBox="0 0 120 120"><g fill="#f5f5f4" stroke="#78716c" stroke-width="1.4">${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a} 60 60)"><rect x="56" y="6" width="9" height="50" rx="1"/><path d="M56 16h9M56 26h9M56 36h9M56 46h9" stroke-width=".8"/></g>`).join("")}</g><circle cx="60" cy="60" r="3.5" fill="#44403c"/></svg>`, "r3-spin", 60, 60, 120, 120, 120, "--sp:6s"),
  boat: () =>
    `<svg viewBox="0 0 40 120"><path d="M20 60 L4 120 L36 120Z" fill="url(#r3wake)"/><path d="M20 4 Q34 26 32 62 Q20 72 8 62 Q6 26 20 4Z" fill="#fff" stroke="#94a3b8"/><path d="M20 14 Q28 30 27 56 Q20 61 13 56 Q12 30 20 14Z" fill="${one(["#b45309", "#1d4ed8", "#dc2626", "#0f766e"])}"/><rect x="14" y="34" width="12" height="12" rx="2" fill="#e2e8f0"/><path d="M20 10 V60" stroke="#475569" stroke-width="1.2"/></svg>`,
  umbrella: () => {
    const c = one([["#ef4444", "#fff"], ["#2563eb", "#fff"], ["#f59e0b", "#fff"], ["#10b981", "#fef3c7"]]);
    const wedges = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45} 30 30)" d="M30 30 L30 6 A24 24 0 0 1 47 13Z" fill="${c[i % 2]}"/>`).join("");
    return `<svg viewBox="0 0 80 70"><rect x="38" y="36" width="16" height="30" rx="2" fill="${c[0]}" opacity=".8" transform="rotate(12 46 51)"/><circle cx="37" cy="38" r="24" fill="#000" opacity=".15"/>${wedges}<circle cx="30" cy="30" r="24" fill="url(#r3ball)" opacity=".5"/><circle cx="30" cy="30" r="3" fill="#475569"/></svg>`;
  },

  /* Север: касерío, орреo, коровы, горы, скалы */
  caserio: (w, ht) => {
    const base = one(["#b9472b", "#a4402a", "#c45a35"]);
    const annex = Math.random() < 0.6 ? `<rect x="${f(w * 0.62 + 4)}" y="${f(ht * 0.72 + 5)}" width="${f(w * 0.32)}" height="${f(ht * 0.34)}" fill="#000" opacity=".22"/>${gable(w * 0.62, ht * 0.72, w * 0.32, ht * 0.34, "#57534e", true)}` : "";
    return `<svg viewBox="0 0 ${w + 8} ${ht + 14}"><rect x="8" y="11" width="${w}" height="${ht}" fill="#000" opacity=".24"/><rect width="${w}" height="${ht}" fill="#fff"/>${gable(0, 0, w, ht * 0.9, base)}<rect y="${f(ht * 0.9)}" width="${w}" height="${f(ht * 0.1)}" fill="#7c4a24"/><path d="M0 ${f(ht * 0.95)}H${w}" stroke="#f43f5e" stroke-dasharray="2 4" stroke-width="2"/>${annex}${chimney(w * 0.7, ht * 0.15)}</svg>`;
  },
  horreo: () => {
    const base = one(["#b9472b", "#a9452b", "#6b6460"]);
    return `<svg viewBox="0 0 48 48"><rect x="7" y="9" width="36" height="36" fill="#000" opacity=".25"/>${hip(2, 2, 36, 36, base)}<circle cx="20" cy="20" r="2.4" fill="${tone(base, -0.5)}"/></svg>`;
  },
  cows: () => {
    const spotted = cur === "euskadi" && Math.random() < 0.5;
    const n = 2 + Math.floor(Math.random() * 2);
    return `<svg viewBox="0 0 90 90">${Array.from({ length: n }, (_, i) => cow(22 + (i % 2) * 40 + rnd(-6, 6), 25 + Math.floor(i / 2) * 40 + (i % 2) * 14 + rnd(-6, 6), rnd(0, 360), spotted)).join("")}</svg>`;
  },
  mountain: (s) => {
    const snow = cur === "pirineos" || Math.random() < 0.5;
    return `<svg viewBox="0 0 ${s} ${s}">${lowpoly(s, snow ? [SNOW, ROCK, FOREST] : [ROCK, SCREE, FOREST])}</svg>`;
  },
  crag: (s) => `<svg viewBox="0 0 ${s} ${s}">${lowpoly(s, [ROCK, ROCK2], 0, 0, rnd(0.6, 1))}</svg>`,
  islet: (s) => `<svg viewBox="0 0 ${s} ${s}"><ellipse cx="${f(s / 2)}" cy="${f(s / 2)}" rx="${f(s * 0.52)}" ry="${f(s * 0.5)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-dasharray="6 5"/>${lowpoly(s * 0.9, [MEADOW, ROCK], s * 0.05, s * 0.05)}</svg>`,
  ibon: (w, ht) => {
    const rocks = Array.from({ length: 6 }, () => {
      const a = rnd(0, Math.PI * 2);
      return `<circle cx="${f(w / 2 + Math.cos(a) * w * 0.46)}" cy="${f(ht / 2 + Math.sin(a) * ht * 0.46)}" r="${f(rnd(3, 6))}" fill="#9ca3af" stroke="#4b5563" stroke-opacity=".4"/>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${ht}"><ellipse cx="${f(w / 2)}" cy="${f(ht / 2)}" rx="${f(w * 0.47)}" ry="${f(ht * 0.46)}" fill="#c4b99a"/><ellipse cx="${f(w / 2)}" cy="${f(ht / 2)}" rx="${f(w * 0.42)}" ry="${f(ht * 0.4)}" fill="url(#r3lake)"/><ellipse cx="${f(w * 0.4)}" cy="${f(ht * 0.38)}" rx="${f(w * 0.14)}" ry="${f(ht * 0.06)}" fill="#fff" opacity=".35"/>${rocks}</svg>`;
  },

  /* Город */
  bloque: (w, ht) => {
    const base = one(["#d6d3cd", "#cfd5dc", "#e2d6c2", "#b8826a"]);
    let det = `<rect x="${f(w * 0.12)}" y="${f(ht * 0.14)}" width="${f(w * 0.24)}" height="${f(ht * 0.2)}" fill="${tone(base, 0.25)}"/><rect x="${f(w * 0.12 + 3)}" y="${f(ht * 0.34)}" width="${f(w * 0.24)}" height="4" fill="#000" opacity=".2"/>`;
    for (let i = 0; i < 3; i++) det += ITEM.ac(w * (0.5 + i * 0.14), ht * 0.22, Math.min(w, ht) * 0.3);
    if (Math.random() < 0.5) det += `<rect x="${f(w * 0.1)}" y="${f(ht * 0.55)}" width="${f(w * 0.45)}" height="${f(ht * 0.32)}" rx="3" fill="#4d8a2a"/><circle cx="${f(w * 0.22)}" cy="${f(ht * 0.7)}" r="${f(ht * 0.09)}" fill="url(#r3leaf)"/><circle cx="${f(w * 0.4)}" cy="${f(ht * 0.66)}" r="${f(ht * 0.06)}" fill="url(#r3leaf)"/>`;
    else det += ITEM.solar(w * 0.32, ht * 0.7, Math.min(w, ht) * 0.4);
    det += `<path d="M${f(w * 0.75)} ${f(ht * 0.6)}l14 6M${f(w * 0.75)} ${f(ht * 0.6)}l-3 12" stroke="#475569" stroke-width="1.2"/><circle cx="${f(w * 0.75)}" cy="${f(ht * 0.6)}" r="2" fill="#475569"/>`;
    det += `<rect x="${f(w * 0.6)}" y="${f(ht * 0.74)}" width="${f(w * 0.26)}" height="${f(ht * 0.14)}" fill="url(#r3glass)" opacity=".85"/>`;
    return `<svg viewBox="0 0 ${w + 16} ${ht + 22}"><rect x="14" y="20" width="${w}" height="${ht}" fill="#000" opacity=".28"/><rect width="${w}" height="${ht}" fill="${tone(base, 0.2)}"/><rect x="3" y="3" width="${w - 6}" height="${ht - 6}" fill="${base}"/><path d="M3 3H${w - 3}L${w - 7} 7H7V${ht - 7}L3 ${ht - 3}Z" fill="#000" opacity=".12"/>${det}</svg>`;
  },
  /** Квартал Эшампле: восьмиугольник со срезанными углами, кольцо домов разного цвета, зелёный двор. */
  illa: (s) => {
    const c = s * 0.2, d = s * 0.26;
    const oct = (o: number, k: number) => [[o + k, o], [s - o - k, o], [s - o, o + k], [s - o, s - o - k], [s - o - k, s - o], [o + k, s - o], [o, s - o - k], [o, o + k]];
    const tones = ["#d9c7a8", "#cbb38e", "#e4d6bd", "#c49a73", "#b7a58a", "#d3a27d", "#ddd2c0"];
    let seg = "";
    for (let side = 0; side < 4; side++)
      for (let p = c; p < s - c - 4; p += rnd(14, 26)) {
        const len = Math.min(rnd(14, 26), s - c - p);
        const r = side === 0 ? [p, 0, len, d] : side === 1 ? [s - d, p, d, len] : side === 2 ? [p, s - d, len, d] : [0, p, d, len];
        seg += `<rect x="${f(r[0])}" y="${f(r[1])}" width="${f(r[2])}" height="${f(r[3])}" fill="${one(tones)}" stroke="#00000022"/>`;
        if (Math.random() < 0.35) seg += ITEM.ac(r[0] + r[2] / 2, r[1] + r[3] / 2, 16);
      }
    const yard = oct(d, c * 0.55);
    const trees = Array.from({ length: 5 }, () => `<circle cx="${f(rnd(d + 12, s - d - 12))}" cy="${f(rnd(d + 12, s - d - 12))}" r="${f(rnd(6, 10))}" fill="url(#r3leaf)"/>`).join("");
    return `<svg viewBox="0 0 ${s + 14} ${s + 18}"><polygon points="${pts(oct(0, c).map(([x, y]) => [x + 12, y + 16]))}" fill="#000" opacity=".26"/><polygon points="${pts(oct(0, c))}" fill="#d6c4a4"/>${seg}<polygon points="${pts(oct(0, c))}" fill="url(#r3lit)" opacity=".5"/><polygon points="${pts(yard)}" fill="#6aa84f"/><polygon points="${pts(yard)}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="6" transform="translate(3 4)"/>${trees}<polygon points="${pts(oct(0, c))}" fill="none" stroke="#f5f0e6" stroke-width="2"/></svg>`;
  },
  parque: (s) => {
    const trees = Array.from({ length: 9 }, () => {
      const a = rnd(0, Math.PI * 2), r = rnd(s * 0.25, s * 0.42), tr = rnd(8, 13), x = s / 2 + Math.cos(a) * r, y = s / 2 + Math.sin(a) * r;
      return `<circle cx="${f(x + 4)}" cy="${f(y + 6)}" r="${f(tr)}" fill="#000" opacity=".2"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(tr)}" fill="url(#r3leaf)"/>`;
    }).join("");
    return `<svg viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" rx="10" fill="#5ea544"/><circle cx="${f(s / 2)}" cy="${f(s / 2)}" r="${f(s * 0.3)}" fill="none" stroke="#e7d9b8" stroke-width="7"/><path d="M0 ${f(s / 2)}H${s}M${f(s / 2)} 0V${s}" stroke="#e7d9b8" stroke-width="6"/><circle cx="${f(s / 2)}" cy="${f(s / 2)}" r="${f(s * 0.12)}" fill="#e5e7eb"/><circle cx="${f(s / 2)}" cy="${f(s / 2)}" r="${f(s * 0.09)}" fill="url(#r3pool)"/>${trees}</svg>` +
      layer(`<i></i>`, "r3-ripple", s / 2, s / 2, s * 0.18, s, s);
  },

  /* Валенсия */
  barraca: (w, ht) =>
    `<svg viewBox="0 0 ${w + 8} ${ht + 10}"><rect x="7" y="10" width="${w}" height="${ht}" fill="#000" opacity=".24"/><rect width="${w}" height="${ht}" fill="#fff"/>${gable(1, 1, w - 2, ht - 2, "#c9a24a", true, "url(#r3thatch)")}<path d="M${f(w / 2)} 1V${ht - 1}" stroke="#fff" stroke-width="3"/><path d="M${f(w / 2)} 4v-7M${f(w / 2 - 3)} -1h6" stroke="#57534e" stroke-width="1.5"/></svg>`,

  /* Ярмарка */
  caseta: (w, ht) => {
    const c = one(["#dc2626", "#16a34a", "#2563eb", "#db2777"]);
    const n = Math.max(4, Math.round(w / 8));
    const stripes = Array.from({ length: n }, (_, i) => (i % 2 ? "" : `<rect x="${f((i * w) / n)}" width="${f(w / n)}" height="${ht}" fill="${c}"/>`)).join("");
    const lamps = ["#facc15", "#ef4444", "#22c55e", "#3b82f6", "#f97316", "#fff"];
    const bulbs = Array.from({ length: n + 1 }, (_, i) => `<circle cx="${f((i * w) / n)}" cy="${f(ht + 3 + Math.sin((i / n) * Math.PI) * 3)}" r="2.2" fill="${lamps[i % lamps.length]}"/>`).join("");
    const scal = Array.from({ length: n * 2 }, (_, i) => `<circle cx="${f(((i + 0.5) * w) / (n * 2))}" cy="${ht}" r="${f(w / (n * 4))}" fill="${i % 2 ? "#fff" : c}"/>`).join("");
    return `<svg viewBox="0 0 ${w + 8} ${ht + 12}"><rect x="7" y="9" width="${w}" height="${ht}" fill="#000" opacity=".24"/><rect width="${w}" height="${ht}" fill="#fff"/>${stripes}<rect width="${w}" height="${f(ht / 2)}" fill="#fff" opacity=".14"/><rect y="${f(ht / 2)}" width="${w}" height="${f(ht / 2)}" fill="#000" opacity=".16"/><path d="M0 ${f(ht / 2)}H${w}" stroke="#fff" stroke-width="1.6"/>${scal}<path d="M0 ${ht + 3}Q${f(w / 2)} ${ht + 9} ${w} ${ht + 3}" stroke="#334155" stroke-width=".6" fill="none"/>${bulbs}</svg>`;
  },
  tiovivo: () => {
    const horses = Array.from({ length: 10 }, (_, i) => `<g transform="rotate(${i * 36} 50 50) translate(50 8)"><ellipse rx="2.6" ry="6" fill="${one(["#fff", "#fde68a", "#fecaca", "#bfdbfe"])}" stroke="#78350f" stroke-width=".5"/><circle cy="-6" r="1.8" fill="#f8fafc"/></g>`).join("");
    const col = one(["#ef4444", "#2563eb", "#16a34a"]);
    const wedges = Array.from({ length: 12 }, (_, i) => `<path transform="rotate(${i * 30} 50 50)" d="M50 50 L50 16 A34 34 0 0 1 67 20.6Z" fill="${i % 2 ? "#fff" : col}"/>`).join("");
    const rim = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `<circle cx="${f(50 + Math.cos(a) * 34)}" cy="${f(50 + Math.sin(a) * 34)}" r="2.6" fill="${i % 2 ? "#facc15" : col}"/>`;
    }).join("");
    return `<svg viewBox="0 0 100 100"><circle cx="56" cy="58" r="46" fill="#000" opacity=".2"/><circle cx="50" cy="50" r="46" fill="#a16207"/><circle cx="50" cy="50" r="46" fill="none" stroke="#fde68a" stroke-width="2"/></svg>` +
      layer(`<svg viewBox="0 0 100 100">${horses}<circle cx="54" cy="55" r="36" fill="#000" opacity=".25"/>${rim}${wedges}<circle cx="50" cy="50" r="34" fill="url(#r3ball)" opacity=".6"/><circle cx="50" cy="50" r="6" fill="#facc15" stroke="#a16207"/></svg>`, "r3-spin", 50, 50, 100, 100, 100, "--sp:9s");
  },
  sillas: () => {
    const chairs = Array.from({ length: 14 }, (_, i) => `<g transform="rotate(${f((i / 14) * 360)} 60 60)"><path d="M60 42 L60 8" stroke="#94a3b8" stroke-width=".8"/><rect x="56" y="3" width="8" height="7" rx="1.5" fill="${one(["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#a855f7"])}"/></g>`).join("");
    const top = Array.from({ length: 10 }, (_, i) => `<path transform="rotate(${i * 36} 60 60)" d="M60 60 L60 42 A18 18 0 0 1 70.6 45.4Z" fill="${i % 2 ? "#fff" : "#0ea5e9"}"/>`).join("");
    return `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#000" opacity=".08"/><circle cx="60" cy="60" r="20" fill="#78716c"/><circle cx="64" cy="66" r="18" fill="#000" opacity=".25"/></svg>` +
      layer(`<svg viewBox="0 0 120 120">${chairs}${top}<circle cx="60" cy="60" r="18" fill="url(#r3ball)" opacity=".6"/><circle cx="60" cy="60" r="4" fill="#facc15"/></svg>`, "r3-spin", 60, 60, 120, 120, 120, "--sp:3.6s");
  },
  globos: () => {
    const c = ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#ec4899", "#a855f7", "#f97316"];
    const b = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2, r = i ? 9 : 0, x = f(20 + Math.cos(a) * r), y = f(20 + Math.sin(a) * r);
      return `<circle cx="${x}" cy="${y}" r="6" fill="${c[i]}"/><circle cx="${x}" cy="${y}" r="6" fill="url(#r3ball)"/>`;
    }).join("");
    return `<svg viewBox="0 0 40 40"><circle cx="30" cy="34" r="12" fill="#000" opacity=".15"/>${b}</svg>`;
  },
  /** Шапито: полосатый конус, фестон по краю, растяжки, мигающие огоньки, флаги на шестах. */
  circo: () => {
    const n = 20;
    const wedges = Array.from({ length: n }, (_, i) => {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      return `<path d="M90 90 L${f(90 + Math.cos(a0) * 70)} ${f(90 + Math.sin(a0) * 70)} A70 70 0 0 1 ${f(90 + Math.cos(a1) * 70)} ${f(90 + Math.sin(a1) * 70)}Z" fill="${i % 2 ? "#fef3c7" : "#dc2626"}"/>`;
    }).join("");
    const valance = Array.from({ length: 40 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2;
      return `<circle cx="${f(90 + Math.cos(a) * 71)}" cy="${f(90 + Math.sin(a) * 71)}" r="4" fill="${i % 2 ? "#facc15" : "#1d4ed8"}"/>`;
    }).join("");
    const ropes = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + 0.1;
      return `<path d="M${f(90 + Math.cos(a) * 70)} ${f(90 + Math.sin(a) * 70)}L${f(90 + Math.cos(a) * 88)} ${f(90 + Math.sin(a) * 88)}" stroke="#78350f" stroke-width=".8"/><circle cx="${f(90 + Math.cos(a) * 88)}" cy="${f(90 + Math.sin(a) * 88)}" r="1.4" fill="#78350f"/>`;
    }).join("");
    const flags = ([[90, 90, "#facc15"], [90, 52, "#2563eb"], [90, 128, "#16a34a"], [52, 90, "#ec4899"], [128, 90, "#f97316"]] as [number, number, string][])
      .map(([x, y, c], i) => layer(FLAG(c), "r3-flag", x, y, 26, 180, 180, `animation-delay:-${i * 0.17}s`)).join("");
    return `<svg viewBox="0 0 180 180">${ropes}<circle cx="102" cy="106" r="74" fill="#000" opacity=".24"/>${valance}${wedges}<circle cx="90" cy="90" r="70" fill="url(#r3lit)"/><circle cx="90" cy="90" r="22" fill="none" stroke="#facc15" stroke-width="4"/><circle cx="90" cy="90" r="38" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-dasharray="3 5"/><circle cx="90" cy="90" r="5" fill="#78350f"/></svg>` +
      layer(BULBS(0), "r3-twinkle", 90, 90, 150, 180, 180) + layer(BULBS(1), "r3-twinkle is-b", 90, 90, 150, 180, 180) + flags;
  },

  /* Достопримечательности */
  /** Sagrada Família: план латинского креста, 18 башен с цветными навершиями, два строительных крана крутятся. */
  sagrada: () => {
    const st = "#c6a272";
    const tower = (x: number, y: number, r: number, top: string) => `<circle cx="${f(x + r * 0.5)}" cy="${f(y + r * 0.7)}" r="${r}" fill="#000" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#r3stone)"/><circle cx="${x}" cy="${y}" r="${f(r * 0.62)}" fill="none" stroke="#7c6040" stroke-opacity=".5" stroke-dasharray="2 2"/><circle cx="${x}" cy="${y}" r="${f(r * 0.32)}" fill="${top}"/><circle cx="${f(x - r * 0.1)}" cy="${f(y - r * 0.12)}" r="${f(r * 0.12)}" fill="#fff" opacity=".8"/>`;
    const tops = ["#ef4444", "#f59e0b", "#16a34a", "#e5e7eb", "#f97316"];
    let towers = "";
    for (const y of [106, 122, 148, 164]) towers += tower(186, y, 8, one(tops)) + tower(14, y, 8, one(tops));
    for (const x of [72, 88, 112, 128]) towers += tower(x, 258, 8.5, one(tops));
    for (const [x, y] of [[78, 113], [122, 113], [78, 157], [122, 157]]) towers += tower(x, y, 11, "#e5e7eb");
    towers += tower(100, 58, 13, "#93c5fd") + tower(100, 135, 17, "#fef3c7") + `<path d="M100 123v24M88 135h24" stroke="#fde047" stroke-width="3"/>`;
    const crane = (c: string) => `<svg viewBox="-50 -50 100 100"><rect x="-41" y="5" width="78" height="4" fill="#000" opacity=".2"/><rect x="-46" y="-2" width="78" height="4" fill="${c}"/><path d="M-46 0h78" stroke="#7c2d12" stroke-dasharray="2 3"/><rect x="18" y="-3.5" width="12" height="7" fill="#57534e"/><rect x="-4" y="-4" width="8" height="8" fill="#1f2937"/><rect x="-34" y="-1" width="3" height="5" fill="#0f172a"/></svg>`;
    return `<svg viewBox="0 0 200 280"><rect y="40" width="200" height="236" rx="8" fill="#e7dcc4"/><rect x="150" y="190" width="44" height="50" rx="16" fill="#5ea544"/><ellipse cx="172" cy="214" rx="14" ry="10" fill="url(#r3pool)"/>` +
      `<path d="M72 252V160H22V110H72V62A28 28 0 0 1 128 62V110H178V160H128V252Z" fill="#000" opacity=".25" transform="translate(9 12)"/>` +
      `${gable(72, 62, 56, 190, st, true)}${gable(22, 110, 156, 50, st)}<path d="M72 62A28 28 0 0 1 128 62Z" fill="${tone(st, 0.1)}"/>${towers}</svg>` +
      layer(crane("#facc15"), "r3-spin", 40, 70, 100, 200, 280, "--sp:28s") + layer(crane("#ef4444"), "r3-spin is-rev", 165, 230, 90, 200, 280, "--sp:36s");
  },
  /** Torre Glòries: эллипс-купол в разноцветных панелях. */
  glories: () => {
    let px = "";
    for (let y = 8; y < 108; y += 7) for (let x = 8; x < 88; x += 7) px += `<rect x="${x}" y="${y}" width="6" height="6" fill="${one(["#1d4ed8", "#2563eb", "#dc2626", "#0ea5e9", "#f97316", "#38bdf8", "#1e3a8a"])}"/>`;
    return `<svg viewBox="0 0 96 116"><clipPath id="r3gl"><ellipse cx="46" cy="56" rx="40" ry="50"/></clipPath><ellipse cx="56" cy="68" rx="40" ry="50" fill="#000" opacity=".28"/><g clip-path="url(#r3gl)">${px}<ellipse cx="46" cy="56" rx="40" ry="50" fill="url(#r3lit)"/></g><ellipse cx="46" cy="56" rx="40" ry="50" fill="none" stroke="#e2e8f0" stroke-width="2"/><ellipse cx="38" cy="40" rx="10" ry="14" fill="#fff" opacity=".35"/></svg>`;
  },
  /** Guggenheim Bilbao: титановые «лепестки» с бликом, известняк, стекло, Нервьон и красный мост La Salve. */
  guggen: () =>
    `<svg viewBox="0 0 260 230"><rect width="40" height="230" fill="url(#r3river)"/><path d="M8 0v230M24 0v230" stroke="#fff" stroke-opacity=".12" stroke-dasharray="14 18"/><rect x="40" width="220" height="230" fill="#ddd6c8"/>` +
    `<g transform="translate(12 16)" fill="#000" opacity=".26"><path d="M120 40C160 10 220 30 210 80C200 110 160 100 140 90Z"/><path d="M90 80C70 40 130 30 150 70C170 110 120 130 90 110Z"/><path d="M150 100C200 90 240 130 220 170C190 200 150 180 140 150Z"/><path d="M60 120C40 90 100 90 120 120C140 160 100 190 70 170Z"/></g>` +
    `<rect x="150" y="170" width="80" height="44" fill="#e8dcc0" stroke="#b8a888"/><rect x="58" y="176" width="54" height="40" fill="#e8dcc0" stroke="#b8a888"/><rect x="110" y="96" width="40" height="64" fill="url(#r3glass)"/>` +
    `<g fill="url(#r3ti)" stroke="#f8fafc" stroke-width="1.2"><path d="M120 40C160 10 220 30 210 80C200 110 160 100 140 90Z"/><path d="M60 120C40 90 100 90 120 120C140 160 100 190 70 170Z"/><path d="M150 100C200 90 240 130 220 170C190 200 150 180 140 150Z"/><path d="M90 80C70 40 130 30 150 70C170 110 120 130 90 110Z"/><path d="M110 130C130 110 170 130 160 160C150 190 110 190 100 165Z"/></g>` +
    `<g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"><path d="M128 44C160 24 200 36 202 70"/><path d="M98 82C92 58 124 52 140 72"/><path d="M160 108C196 102 222 134 210 160"/><path d="M68 122C66 104 96 104 110 124"/></g>` +
    `<path d="M0 18L260 6" stroke="#000" stroke-opacity=".25" stroke-width="9" transform="translate(6 10)"/><path d="M0 18L260 6" stroke="#dc2626" stroke-width="8"/><path d="M0 18L260 6" stroke="#fca5a5" stroke-width="1.5"/></svg>` +
    layer(`<svg viewBox="0 0 100 100"><path d="M10 30C40 10 80 20 85 50M20 70C30 50 60 50 70 80" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`, "r3-glint", 140, 110, 160, 260, 230),
  /** Puppy: собака из цветов перед музеем. */
  puppy: () =>
    `<svg viewBox="0 0 80 100"><g transform="translate(7 10)" fill="#000" opacity=".25"><ellipse cx="40" cy="58" rx="22" ry="30"/><circle cx="40" cy="22" r="16"/></g><ellipse cx="40" cy="58" rx="22" ry="30" fill="url(#r3fl)"/><ellipse cx="20" cy="82" rx="7" ry="9" fill="url(#r3fl)"/><ellipse cx="60" cy="82" rx="7" ry="9" fill="url(#r3fl)"/><circle cx="40" cy="22" r="16" fill="url(#r3fl)"/><ellipse cx="25" cy="16" rx="6" ry="10" fill="url(#r3fl)" transform="rotate(-25 25 16)"/><ellipse cx="55" cy="16" rx="6" ry="10" fill="url(#r3fl)" transform="rotate(25 55 16)"/><ellipse cx="40" cy="8" rx="6" ry="5" fill="url(#r3fl)"/><ellipse cx="40" cy="58" rx="22" ry="30" fill="url(#r3lit)"/><circle cx="40" cy="22" r="16" fill="url(#r3lit)"/></svg>`,
  /** Ciutat de les Arts i les Ciències: бассейн, Palau de les Arts с «пером», Hemisfèric-«глаз», рёбра Museu. */
  arts: () => {
    const ribs = Array.from({ length: 14 }, (_, i) => `<path d="M${74 + i * 6} 214l-4 -8M${74 + i * 6} 306l-4 8" stroke="#fff" stroke-width="2.4"/>`).join("");
    const eye = Array.from({ length: 9 }, (_, i) => {
      const k = Math.sin(((i + 1) / 10) * Math.PI) * 26;
      return `<path d="M${58 + i * 7} ${f(160 - k)}V${f(160 + k)}" stroke="#cbd5e1" stroke-width="1"/>`;
    }).join("");
    return `<svg viewBox="0 0 170 320"><rect width="170" height="320" fill="#e5e7eb"/><rect width="26" height="320" fill="#6aa84f"/><rect x="146" width="24" height="320" fill="#6aa84f"/><rect x="38" y="6" width="100" height="308" rx="6" fill="url(#r3pool)" stroke="#f8fafc" stroke-width="3"/><path d="M46 110q6 -3 12 0t12 0M100 116q6 -3 12 0t12 0M50 196q6 -3 12 0t12 0M44 260q6 -3 12 0" stroke="#fff" stroke-opacity=".6" fill="none"/>` +
      `<g transform="translate(8 12)" fill="#000" opacity=".22"><path d="M50 30Q88 0 126 34Q120 86 86 92Q46 86 50 30Z"/><path d="M50 160Q85 122 120 160Q85 198 50 160Z"/><rect x="70" y="212" width="90" height="96" rx="8"/></g>` +
      `<path d="M50 30Q88 0 126 34Q120 86 86 92Q46 86 50 30Z" fill="#f8fafc" stroke="#cbd5e1"/><path d="M50 30Q88 0 126 34Q120 86 86 92Q46 86 50 30Z" fill="url(#r3lit)" opacity=".7"/><path d="M40 52Q90 -6 150 70" stroke="#e2e8f0" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M40 52Q90 -6 150 70" stroke="#fff" stroke-width="2" fill="none"/>` +
      `<path d="M50 160Q85 122 120 160Q85 198 50 160Z" fill="#f8fafc"/>${eye}<circle cx="85" cy="160" r="13" fill="#1e3a8a"/><circle cx="85" cy="160" r="13" fill="url(#r3ball)"/><path d="M50 160Q85 122 120 160Q85 198 50 160Z" fill="none" stroke="#94a3b8"/>` +
      `<rect x="70" y="212" width="90" height="96" rx="8" fill="#fff"/><rect x="84" y="224" width="62" height="72" rx="4" fill="url(#r3glass)" opacity=".7"/>${ribs}<rect x="70" y="212" width="90" height="96" rx="8" fill="url(#r3lit)" opacity=".6"/></svg>`;
  },
  /** San Juan de Gaztelugatxe: скалистый остров в море, мостик-лестница зигзагом, эрмита на вершине. */
  gaztelu: () =>
    `<svg viewBox="0 0 140 220"><ellipse cx="62" cy="76" rx="62" ry="64" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-dasharray="7 6"/>${lowpoly(120, [MEADOW, ROCK, ROCK2], 2, 16)}` +
    `<path d="M62 120 L84 140 L64 156 L92 172 L72 188 L140 204" stroke="#000" stroke-opacity=".3" stroke-width="7" fill="none" transform="translate(3 4)"/><path d="M62 120 L84 140 L64 156 L92 172 L72 188 L140 204" stroke="#e7e2d6" stroke-width="6" fill="none" stroke-linejoin="round"/><path d="M62 120 L84 140 L64 156 L92 172 L72 188 L140 204" stroke="#a8a29e" stroke-dasharray="2 2" fill="none"/>` +
    `<rect x="58" y="67" width="22" height="30" fill="#000" opacity=".3"/><rect x="54" y="62" width="22" height="30" fill="#fff"/>${hip(54, 62, 22, 30, "#c4532f")}<rect x="58" y="54" width="12" height="12" fill="#fff"/>${hip(58, 54, 12, 12, "#c2410c")}</svg>`,
  /** Gijón: холм Santa Catalina с бетонным «Elogio del Horizonte». */
  elogio: () =>
    `<svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="86" fill="#5ea544"/><circle cx="90" cy="90" r="86" fill="url(#r3lit)" opacity=".5"/><path d="M10 120Q60 96 90 90T172 70" stroke="#e7d9b8" stroke-width="6" fill="none"/><circle cx="90" cy="90" r="40" fill="none" stroke="#e7d9b8" stroke-width="4"/>` +
    `<path d="M64 70Q90 54 116 70L112 108Q90 120 68 108Z" fill="#000" opacity=".3" transform="translate(9 12)"/><path d="M64 70Q90 54 116 70L112 108Q90 120 68 108Z" fill="#a8a29e"/><path d="M74 78Q90 68 106 78L104 100Q90 108 76 100Z" fill="#5ea544"/><path d="M64 70Q90 54 116 70" stroke="#e7e5e4" stroke-width="3" fill="none"/></svg>`,
  /** Basílica de Covadonga: розовый камень, две башни, апсида. */
  covadonga: () => {
    const p = "#d9a3a0";
    return `<svg viewBox="0 0 100 150"><rect width="100" height="150" rx="10" fill="#8a9a6a"/><path d="M24 124V44A26 26 0 0 1 76 44V124Z" fill="#000" opacity=".28" transform="translate(8 10)"/>${gable(24, 40, 52, 86, p, true)}<path d="M24 44A26 26 0 0 1 76 44Z" fill="${tone(p, 0.15)}"/><rect x="24" y="118" width="24" height="24" fill="#000" opacity=".28"/><rect x="64" y="118" width="24" height="24" fill="#000" opacity=".28"/>${hip(18, 110, 24, 24, p)}${hip(58, 110, 24, 24, p)}<circle cx="30" cy="122" r="2" fill="#fef3c7"/><circle cx="70" cy="122" r="2" fill="#fef3c7"/></svg>`;
  },
};

type Kind = string;
/** Размер [ширина, высота], можно ли обрезать краем экрана (большие постройки, рощи, горы — можно). */
const SIZE: Record<Kind, () => [number, number, boolean]> = {
  tree: () => ((s) => [s, s, false])(rnd(46, 92)),
  bush: () => ((s) => [s, s, false])(rnd(16, 32)),
  flowers: () => ((s) => [s, s, false])(rnd(26, 46)),
  rock: () => ((s) => [s, s * 0.8, false])(rnd(14, 30)),
  bale: () => ((s) => [s, s, false])(rnd(18, 26)),
  sun: () => [rnd(70, 130), rnd(90, 170), true],
  wheat: () => [rnd(80, 140), rnd(110, 200), true],
  arrozal: () => [rnd(90, 150), rnd(110, 200), true],
  palm: () => ((s) => [s, s, true])(rnd(70, 110)),
  olive: () => ((s) => [s, s, true])(rnd(110, 160)),
  naranjos: () => ((s) => [s, s, true])(rnd(110, 160)),
  orange: () => ((s) => [s, s, false])(rnd(34, 50)),
  cypress: () => [28, 28, false],
  pine: () => ((s) => [s, s, false])(rnd(30, 56)),
  house: () => [rnd(60, 112), rnd(46, 80), true],
  church: () => [90, 130, true],
  mill: () => ((s) => [s, s, true])(rnd(84, 110)),
  boat: () => [22, 66, false],
  umbrella: () => [44, 38, false],
  caserio: () => [rnd(84, 116), rnd(58, 80), true],
  horreo: () => ((s) => [s, s, false])(rnd(32, 42)),
  cows: () => ((s) => [s, s, false])(rnd(70, 96)),
  mountain: () => ((s) => [s, s, true])(rnd(170, 330)),
  crag: () => ((s) => [s, s, true])(rnd(50, 110)),
  islet: () => ((s) => [s, s, false])(rnd(44, 84)),
  ibon: () => [rnd(90, 150), rnd(70, 110), true],
  bloque: () => [rnd(84, 140), rnd(70, 130), true],
  illa: () => ((s) => [s, s, true])(rnd(150, 196)),
  parque: () => ((s) => [s, s, true])(rnd(100, 140)),
  barraca: () => [rnd(34, 42), rnd(54, 66), false],
  caseta: () => [rnd(60, 92), rnd(40, 54), false],
  tiovivo: () => ((s) => [s, s, false])(rnd(84, 112)),
  sillas: () => ((s) => [s, s, false])(rnd(100, 130)),
  globos: () => [34, 34, false],
  circo: () => ((s) => [s, s, false])(rnd(180, 220)),
  sagrada: () => [200, 280, false],
  glories: () => [96, 116, false],
  guggen: () => [260, 230, false],
  puppy: () => [72, 90, false],
  arts: () => [170, 320, false],
  gaztelu: () => [140, 220, false],
  elogio: () => [180, 180, false],
  covadonga: () => [100, 150, false],
};
/** Круглое и живое можно крутить как угодно; у построек и гор свет запечён — только чуть-чуть. */
const FREE = new Set<Kind>(["tree", "bush", "flowers", "rock", "bale", "orange", "cypress", "palm", "olive", "naranjos", "pine", "cows", "tiovivo", "sillas", "globos", "mill"]);
const KINDS: Record<Biome, [Kind, number][]> = {
  campo: [["tree", 5], ["bush", 2], ["flowers", 1.5], ["rock", 0.8], ["bale", 1.2], ["sun", 0.8], ["house", 0.4]],
  pueblo: [["house", 7], ["orange", 2], ["cypress", 1.5], ["church", 0.4]],
  costa: [["palm", 4], ["umbrella", 3], ["bush", 1], ["house", 1]],
  mancha: [["olive", 3], ["wheat", 2], ["mill", 1.2], ["bale", 1], ["rock", 0.6], ["house", 0.5]],
  valencia: [["naranjos", 3], ["barraca", 2], ["arrozal", 1.5], ["house", 1.4], ["palm", 1]],
  feria: [["caseta", 4], ["tiovivo", 1.6], ["sillas", 1.2], ["globos", 1.5], ["circo", 0.35], ["tree", 1]],
  barcelona: [["illa", 6], ["tree", 1.5], ["parque", 0.6]],
  pirineos: [["mountain", 3], ["pine", 4], ["crag", 1.5], ["ibon", 0.5], ["rock", 1]],
  bilbao: [["bloque", 5], ["tree", 1.5], ["parque", 1.2]],
  euskadi: [["caserio", 3], ["cows", 1.5], ["tree", 2.5], ["pine", 1], ["crag", 0.8]],
  gijon: [["bloque", 4], ["parque", 1.2], ["tree", 1.2], ["house", 1]],
  asturias: [["horreo", 2.5], ["caserio", 1.6], ["cows", 2.2], ["mountain", 1.6], ["tree", 2], ["pine", 1]],
};
/** Достопримечательности: ставятся первыми, как только зона въехала. */
const LANDMARKS: Partial<Record<Biome, Kind[]>> = {
  pueblo: ["church"],
  mancha: ["mill"],
  valencia: ["arts"],
  feria: ["circo"],
  barcelona: ["sagrada", "glories"],
  bilbao: ["guggen", "puppy"],
  euskadi: ["gaztelu"],
  gijon: ["elogio"],
  asturias: ["covadonga"],
};

/** Текущая зона — домам и коровам, чтобы одеться по-местному. */
let cur: Biome = "campo";

type Deco = { el: HTMLElement; y: number; h: number; x: number; w: number };
type Zone = { b: Biome; el: HTMLElement; tex: HTMLElement; near: number; far: number };
type Ped = { el: HTMLElement; y: number; vy: number; on: boolean; rot: string };
type Cloud = { el: HTMLElement; y: number; x: number; vx: number };

const SHIRT = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#f8fafc", "#0f172a", "#ec4899", "#14b8a6", "#facc15"];
const HAIR = ["#1f2937", "#3f2a1d", "#6b4423", "#a16207", "#d6d3d1", "#111827"];
const PANTS = ["#1e293b", "#334155", "#1e3a8a", "#78350f", "#475569"];

export function scenery(ground: HTMLElement, decoLayer: HTMLElement, sky: HTMLElement) {
  ground.insertAdjacentHTML("beforeend", DEFS);
  let W = 0, H = 0, gap = 0, biome: Biome = "campo", y = 0;
  cur = "campo";
  const decos: Deco[] = [];
  const zones: Zone[] = [];
  const peds: Ped[] = [];
  const clouds: Cloud[] = [];
  let pending: Kind[] = [];
  let pedT = 0, cloudT = 3;
  const pedLayer = h("div.r3-peds");
  decoLayer.prepend(pedLayer);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Тротуар в городе — если обочина достаточно широкая. */
  const walkW = () => (gap >= 70 ? 22 : 0);
  const room = (b: Biome) => gap - (URBAN.has(b) ? walkW() : 0);
  /** Ширина моря у левой обочины (пляж — 26px до дороги или тротуара). */
  const seaW = (b: Biome) => Math.max(0, room(b) - 26);
  /** Какая зона на высоте экрана yy (новые — сверху). */
  const zoneAt = (yy: number): Biome => {
    for (let i = zones.length - 1; i >= 0; i--) if (yy >= zones[i].far && yy <= zones[i].near) return zones[i].b;
    return "campo";
  };

  const dress = (d: Deco, yy: number) => {
    d.y = yy;
    d.el.hidden = gap < 14;
    if (d.el.hidden) return;
    const space = room(biome);
    let leftSide = Math.random() < 0.5;
    let kind: Kind;
    const next = pending[0];
    if (next && gap >= 110 && (next !== "gaztelu" || seaW(biome) >= 100)) {
      kind = pending.shift()!;
      leftSide = kind === "gaztelu" ? true : SEA.has(biome) ? false : leftSide;
    } else if (SEA.has(biome) && leftSide) {
      // Слева море: только лодки, островки и зонтики у кромки.
      const big = seaW(biome) > 36;
      kind = biome === "euskadi" ? (big && Math.random() < 0.35 ? "islet" : "boat") : big && Math.random() < 0.4 ? "boat" : "umbrella";
    } else kind = pick(KINDS[biome]);
    let [w, ht, crop] = SIZE[kind]();
    const inSea = SEA.has(biome) && leftSide && (kind === "boat" || kind === "islet" || kind === "gaztelu");
    if (!crop) {
      // Достопримечательности на широком экране — крупнее.
      const k = Math.min(LANDMARKS[biome]?.includes(kind) ? 1.35 : 1, Math.max(10, (inSea ? seaW(biome) : space) - 8) / w);
      w *= k;
      ht *= k;
    }
    // Обрезаемое может уходить за край экрана, но не на дорогу и не на тротуар.
    const lo = crop ? -w * 0.45 : 4;
    const hi = Math.max(lo, space - w - 4);
    let x = rnd(lo, hi);
    if (inSea) x = kind === "gaztelu" ? Math.max(0, seaW(biome) - w + 6) : rnd(6, Math.max(6, seaW(biome) - w - 8));
    if (kind === "umbrella" && SEA.has(biome) && leftSide) x = Math.max(4, seaW(biome) - w * 0.25);
    const left = leftSide ? x : W - x - w;
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
    const svg = SVG[kind];
    d.el.innerHTML = svg ? svg(Math.round(w), Math.round(ht)) : "";
    const r = kind === "boat" ? rnd(-12, 12) : FREE.has(kind) ? rnd(0, 360) : LANDMARKS[biome]?.includes(kind) ? rnd(-3, 3) : rnd(-6, 6);
    d.el.style.cssText = `left:${f(left)}px;width:${f(w)}px;height:${f(ht)}px;--hue:${Math.round(rnd(-14, 14))}deg;--r:${f(r)}deg`;
  };

  const zone = (b: Biome): Zone => {
    const urban = URBAN.has(b);
    const tex = h("div.r3-ztex", {}, SEA.has(b) ? h("div.r3-sea", {}, h("i")) : null, urban ? h("i.r3-walk.is-l") : null, urban ? h("i.r3-walk.is-r") : null);
    const el = h("div.r3-zone.is-" + b, {}, tex);
    el.style.setProperty("--sea", `${seaW(b)}px`);
    ground.append(el);
    return { b, el, tex, near: 0, far: -Infinity };
  };

  /** Пешеход появляется на тротуаре у верхнего края: идёт вверх или вниз, у кого-то собака, на ярмарке — платья фламенко. */
  const ped = () => {
    const ww = walkW();
    const b = zoneAt(-30);
    if (!ww || !URBAN.has(b)) return;
    let p = peds.find((q) => !q.on);
    if (!p) {
      if (peds.length >= (W > 900 ? 14 : 8)) return;
      p = { el: h("i.r3-ped", { html: '<i class="dr"></i><i class="lg"></i><i class="ar"></i><i class="bd"></i><i class="dg"></i>' }), y: 0, vy: 0, on: false, rot: "" };
      pedLayer.append(p.el);
      peds.push(p);
    }
    const x = Math.random() < 0.5 ? W - gap + rnd(6, ww - 6) : gap - ww + rnd(6, ww - 6);
    const up = Math.random() < 0.5;
    const fl = b === "feria" && Math.random() < 0.45;
    p.on = true;
    p.vy = (up ? -1 : 1) * rnd(14, 30);
    p.y = -24;
    p.rot = up ? "" : " rotate(180deg)";
    p.el.hidden = false;
    p.el.className = "r3-ped" + (fl ? " is-fl" : !fl && Math.random() < 0.15 ? " has-dog" : "");
    p.el.style.cssText = `left:${f(x)}px;--c:${one(SHIRT)};--hc:${one(HAIR)};--p:${one(PANTS)};--s:${f(rnd(0.26, 0.36))}s;--dc:${one(["#e11d48", "#dc2626", "#16a34a", "#1d4ed8", "#facc15", "#f8fafc"])}`;
  };

  /** Тень облака плывёт по земле. */
  const cloud = () => {
    if (calm || clouds.length >= 2) return;
    const s = rnd(260, 460);
    const el = h("i.r3-cloud");
    el.style.cssText = `width:${f(s)}px;height:${f(s * 0.62)}px`;
    decoLayer.append(el);
    clouds.push({ el, y: -s, x: rnd(-s * 0.4, W - s * 0.6), vx: rnd(-14, 14) });
  };

  return {
    layout(w: number, ht: number, rw: number) {
      W = w;
      H = ht;
      gap = (w - rw) / 2;
      ground.style.setProperty("--gap", `${gap}px`);
      ground.style.setProperty("--walk", `${walkW()}px`);
      for (const z of zones) z.el.style.setProperty("--sea", `${seaW(z.b)}px`);
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
    /** Сменить зону: её земля въезжает сверху, декорации сверху — уже новые, первыми — достопримечательности. */
    set(b: Biome) {
      if (b === biome) return;
      zones.at(-1) && zones.at(-1)!.far === -Infinity && (zones.at(-1)!.far = -40);
      biome = cur = b;
      pending = [...(LANDMARKS[b] ?? [])];
      if (b !== "campo") zones.push(zone(b));
    },
    step(dy: number, dt = 1 / 60) {
      y += dy;
      for (const d of decos) {
        d.y += dy;
        if (d.y > H + 20) dress(d, -d.h - Math.random() * 160);
        d.el.style.transform = `translate3d(0,${f(d.y)}px,0) rotate(var(--r))`;
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
        z.el.style.transform = `translate3d(0,${f(top)}px,0)`;
        z.el.style.height = `${f(Math.max(0, bottom - top))}px`;
        const phase = (((y - top) % T) + T) % T;
        z.tex.style.transform = `translate3d(0,${f(phase)}px,0)`;
      }
      if ((pedT -= dt) <= 0) {
        pedT = rnd(0.2, 0.8);
        ped();
      }
      for (const p of peds) {
        if (!p.on) continue;
        p.y += dy + p.vy * dt;
        if (p.y > H + 30 || p.y < -60) {
          p.on = false;
          p.el.hidden = true;
          continue;
        }
        p.el.style.transform = `translate3d(0,${f(p.y)}px,0)${p.rot}`;
      }
      if ((cloudT -= dt) <= 0) {
        cloudT = rnd(9, 18);
        cloud();
      }
      for (let i = clouds.length - 1; i >= 0; i--) {
        const c = clouds[i];
        c.y += dy * 0.9 + 10 * dt;
        c.x += c.vx * dt;
        if (c.y > H + 40) {
          c.el.remove();
          clouds.splice(i, 1);
          continue;
        }
        c.el.style.transform = `translate3d(${f(c.x)}px,${f(c.y)}px,0)`;
      }
    },
    /** Стая птиц через экран: чайки над морем, аисты над югом, стрижи в остальных местах. */
    flock() {
      if (calm) return;
      const type = SEA.has(biome) ? "gull" : biome === "pueblo" || biome === "valencia" || biome === "mancha" ? "stork" : "swift";
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
