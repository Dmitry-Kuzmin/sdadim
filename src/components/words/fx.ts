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
};
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
