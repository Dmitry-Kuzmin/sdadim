/**
 * Эффекты тренажёра без файлов и библиотек: звуки — синтез Web Audio, озвучка — голос браузера
 * (Web Speech API, испанский Испании), конфетти — один canvas на пару секунд, вибрация на телефоне.
 */
let ctx: AudioContext | null = null;
let muted = false;
export const setMuted = (m: boolean) => (muted = m);

function tone(freq: number, at: number, dur: number, type: OscillatorType = "sine", vol = 0.12) {
  ctx ??= new AudioContext();
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const SOUNDS = {
  ok: () => (tone(660, 0, 0.12), tone(990, 0.08, 0.18)),
  bad: () => (tone(200, 0, 0.22, "square", 0.05), tone(150, 0.1, 0.25, "square", 0.05)),
  tap: () => tone(520, 0, 0.05, "triangle", 0.06),
  combo: () => [660, 830, 990, 1320].forEach((f, i) => tone(f, i * 0.06, 0.14, "triangle", 0.08)),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, "triangle", 0.09)),
  crash: () => (tone(120, 0, 0.35, "sawtooth", 0.07), tone(80, 0.05, 0.4, "square", 0.05)),
  skid: () => noise(0.45, 1900, 0.09),
};

/** Шум через полосовой фильтр — визг шин. */
function noise(dur: number, freq: number, vol: number) {
  ctx ??= new AudioContext();
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = buf;
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 6;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t);
}
export function sfx(name: keyof typeof SOUNDS) {
  if (muted) return;
  try {
    SOUNDS[name]();
  } catch {}
  if (name === "bad" || name === "crash") navigator.vibrate?.(60);
}

let voice: SpeechSynthesisVoice | null | undefined;
const pickVoice = () => {
  const list = window.speechSynthesis?.getVoices() ?? [];
  return list.find((v) => v.lang === "es-ES") ?? list.find((v) => v.lang.startsWith("es")) ?? null;
};
/** Есть ли испанский голос (Chrome грузит голоса асинхронно — ждём до 1,5 с). */
export function hasVoice(): Promise<boolean> {
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve(false);
  voice = pickVoice();
  if (voice) return Promise.resolve(true);
  return new Promise((res) => {
    const done = () => res(!!(voice = pickVoice()));
    synth.addEventListener?.("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}
export function speak(text: string, slow = false) {
  const synth = window.speechSynthesis;
  if (!synth || muted) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[¿?¡!]/g, ""));
  u.lang = "es-ES";
  voice ??= pickVoice();
  if (voice) u.voice = voice;
  u.rate = slow ? 0.6 : 0.9;
  synth.speak(u);
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function confetti() {
  if (reduced()) return;
  const c = document.createElement("canvas");
  c.className = "wt-confetti";
  const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  document.body.append(c);
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const bits = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    s: 5 + Math.random() * 6,
    c: colors[(Math.random() * colors.length) | 0],
  }));
  const start = performance.now();
  const frame = (t: number) => {
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const b of bits) {
      b.vy += 0.35;
      b.vx *= 0.99;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      g.save();
      g.translate(b.x, b.y);
      g.rotate(b.r);
      g.fillStyle = b.c;
      g.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
      g.restore();
    }
    if (t - start < 2600) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}

/** Короткая анимация через Web Animations API — без CSS-классов, которые надо снимать. */
export function shake(el: Element) {
  if (reduced()) return;
  el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-5px)" }, { transform: "translateX(0)" }], { duration: 320 });
}
export function pop(el: Element) {
  if (reduced()) return;
  el.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
}
/** Всплывающая надпись «+20» над элементом. */
export function floatText(host: Element, text: string, cls = "") {
  const s = document.createElement("span");
  s.className = `wt-float ${cls}`;
  s.textContent = text;
  host.append(s);
  setTimeout(() => s.remove(), 900);
}

/** Гул мотора для «Трассы»: тихая пила через фильтр, высота тона — от скорости (0…1). */
export function engine() {
  const none = { set(_k: number) {}, stop() {} };
  if (muted) return none;
  try {
    ctx ??= new AudioContext();
    const a = ctx;
    const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
    o.type = "sawtooth";
    f.type = "lowpass";
    f.frequency.value = 380;
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.022, a.currentTime, 0.4);
    o.connect(f).connect(g).connect(a.destination);
    o.start();
    return {
      set: (k: number) => o.frequency.setTargetAtTime(48 + k * 80, a.currentTime, 0.25),
      stop() {
        g.gain.setTargetAtTime(0, a.currentTime, 0.08);
        setTimeout(() => o.stop(), 400);
      },
    };
  } catch {
    return none;
  }
}

/* ─── Искры и вспышки (как ParticleBurst в SkilyApp / migran, только без React) ─── */

const OK = ["#14b8a6", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
const BAD = ["#f43f5e", "#e11d48", "#fb7185", "#fda4af", "#fecaca"];
const GOLD = ["#f59e0b", "#fbbf24", "#fde047", "#fb923c", "#fff7ed"];
let layer: HTMLElement | null = null;
const fxLayer = () => {
  if (!layer?.isConnected) {
    layer = document.createElement("div");
    layer.className = "wt-fx";
    document.body.append(layer);
  }
  return layer;
};
const center = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
};
const dot = (c: string, size: number) => {
  const d = document.createElement("i");
  d.style.cssText = `width:${size}px;height:${size}px;background:${c};box-shadow:0 0 ${size * 2}px ${c}`;
  fxLayer().append(d);
  return d;
};

/**
 * Искры от ответа — точный перенос ParticleBurst из migran/SkilyApp (там framer-motion).
 * С `to` искры вылетают кольцом вокруг ответа, зависают у вершины дуги и срываются к цели
 * (сегмент прогресса, счёт): плавность — на каждом отрезке пути отдельно, как keyframes во framer.
 * Без `to` — разлетаются салютом. tone: ok — зелёные, bad — красные, gold — серия и рекорды.
 */
const EASE = "cubic-bezier(.22,.7,.3,1)";
export function burst(from: Element, ok: boolean | "gold", to?: Element | null, n = 20) {
  if (reduced() || !from.isConnected) return;
  const s = center(from);
  const t = to?.isConnected ? center(to) : null;
  const colors = ok === "gold" ? GOLD : ok ? OK : BAD;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 20 + Math.random() * 24;
    const x0 = s.x + Math.cos(a) * r, y0 = s.y + Math.sin(a) * r;
    const size = 4 + Math.random() * 4;
    const d = dot(colors[i % colors.length], size);
    const dur = 450 + Math.random() * 200;
    const delay = i * 14 + Math.random() * 30;
    const [x1, y1, x2, y2] = t
      ? [(x0 + t.x) / 2 + (Math.random() - 0.5) * 80, Math.min(y0, t.y) - 30 - Math.random() * 50, t.x + (Math.random() - 0.5) * 16, t.y + (Math.random() - 0.5) * 4]
      : [x0 + Math.cos(a) * 46, y0 + Math.sin(a) * 46 - 18, x0 + Math.cos(a) * (80 + Math.random() * 60), y0 + Math.sin(a) * (80 + Math.random() * 60) + 40];
    const at = (x: number, y: number, k: number) => `translate(${x}px,${y}px) translate(-50%,-50%) scale(${k})`;
    d.animate(
      [
        { transform: at(x0, y0, 0.4), easing: EASE },
        { transform: at(x1, y1, 1.1), easing: EASE, offset: 0.25 },
        { transform: at(x2, y2, 0.2) },
      ],
      { duration: dur, delay, fill: "both" },
    ).onfinish = () => d.remove();
    d.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }], { duration: dur, delay, fill: "both" });
  }
  // Цель «вспыхивает», когда до неё долетели искры.
  if (to && t) to.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.7) saturate(1.3)" }, { filter: "brightness(1)" }], { duration: 420, delay: 420 });
}

/** Расходящееся кольцо вокруг элемента — подтверждение ответа. */
export function ring(el: Element, ok: boolean | "gold") {
  if (reduced() || !el.isConnected) return;
  const r = el.getBoundingClientRect();
  const d = document.createElement("i");
  d.className = "is-ring";
  const c = ok === "gold" ? "#f59e0b" : ok ? "#10b981" : "#f43f5e";
  d.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-color:${c};border-radius:${getComputedStyle(el).borderRadius}`;
  fxLayer().append(d);
  d.animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: "scale(1.12)", opacity: 0 }], { duration: 500, easing: "ease-out" }).onfinish = () => d.remove();
}

/** Число «докручивается» до значения (итоги игры). */
export function countUp(el: HTMLElement, to: number, ms = 900, fmt = (n: number) => String(Math.round(n))) {
  if (reduced() || to === 0) return void (el.textContent = fmt(to));
  let t0 = 0;
  const step = (t: number) => {
    t0 ||= t;
    const k = Math.max(0, Math.min(1, (t - t0) / ms));
    el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Бейдж серии с огоньком (с 2 подряд): уровни seed → mild → warm → hot, «пульс» при росте. */
export function streak(el: HTMLElement, n: number) {
  const prev = Number(el.dataset.n || 0);
  el.dataset.n = String(n);
  el.dataset.tier = n >= 10 ? "hot" : n >= 6 ? "warm" : n >= 3 ? "mild" : n >= 2 ? "seed" : "";
  el.innerHTML = n >= 2 ? `<b aria-hidden="true">🔥</b><span>${n}</span>` : "";
  el.setAttribute("aria-label", n >= 2 ? `Серия: ${n} подряд` : "");
  if (n > prev && n >= 2) pop(el);
}
