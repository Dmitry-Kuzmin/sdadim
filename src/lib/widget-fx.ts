/**
 * Микроанимации и общие контролы виджетов статей (стили — src/components/widgets/widgets.css).
 * Всё уважает prefers-reduced-motion: без анимации значения просто подставляются.
 */

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Перезапускает CSS-анимацию класса (wx-bump, wx-in, wx-shake) */
export function replay(el: Element | null, cls = "wx-bump") {
  if (!el || reduced()) return;
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

/**
 * Плавно «докручивает» число в элементе до `to`. Первый вызов ставит значение без анимации.
 * `fmt` — форматирование промежуточных значений (евро, баллы…).
 */
export function tween(el: HTMLElement, to: number, fmt: (n: number) => string = (n) => String(Math.round(n)), ms = 520) {
  const prev = el.dataset.v;
  el.dataset.v = String(to);
  cancelAnimationFrame(Number(el.dataset.raf ?? 0));
  if (prev === undefined || Number(prev) === to || reduced()) {
    el.textContent = fmt(to);
    return;
  }
  const from = Number(prev);
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = fmt(k < 1 ? from + (to - from) * (1 - Math.pow(1 - k, 3)) : to);
    if (k < 1) el.dataset.raf = String(requestAnimationFrame(step));
  };
  el.dataset.raf = String(requestAnimationFrame(step));
  replay(el);
}

/** Текст, который меняется с лёгким «пульсом» — только если правда изменился */
export function setText(el: HTMLElement, text: string, anim = true) {
  if (el.textContent === text) return;
  el.textContent = text;
  if (anim) replay(el);
}

/**
 * Группа role="radio" кнопок: выбор кликом и стрелками, бегунок у .wx-seg.
 * Возвращает функцию, которая выбирает кнопку программно.
 */
export function radios(group: HTMLElement, onPick: (btn: HTMLButtonElement) => void) {
  const btns = [...group.querySelectorAll<HTMLButtonElement>(":scope > [role=radio], :scope [role=radio]")];
  const thumb = group.classList.contains("wx-seg") ? group.appendChild(Object.assign(document.createElement("span"), { className: "wx-seg-thumb" })) : null;
  const place = () => {
    const cur = btns.find((b) => b.getAttribute("aria-checked") === "true");
    if (!thumb || !cur) return;
    thumb.style.width = `${cur.offsetWidth}px`;
    thumb.style.transform = `translateX(${cur.offsetLeft}px)`;
  };
  const pick = (b: HTMLButtonElement, fire = true) => {
    btns.forEach((x) => {
      x.setAttribute("aria-checked", String(x === b));
      x.tabIndex = x === b ? 0 : -1;
    });
    place();
    if (fire) onPick(b);
  };
  btns.forEach((b, i) => {
    b.tabIndex = b.getAttribute("aria-checked") === "true" ? 0 : -1;
    b.addEventListener("click", () => pick(b));
    b.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = btns[(i + d + btns.length) % btns.length];
      n.focus();
      pick(n);
    });
  });
  if (thumb) {
    thumb.style.transition = "none";
    place();
    requestAnimationFrame(() => {
      thumb.style.transition = "";
      group.dataset.ready = "";
    });
    new ResizeObserver(place).observe(group);
  }
  return (b: HTMLButtonElement) => pick(b, false);
}

/** Заливка .wx-range до текущего значения */
export function rangeFill(input: HTMLInputElement) {
  const min = Number(input.min || 0), max = Number(input.max || 100);
  input.style.setProperty("--p", `${((Number(input.value) - min) / (max - min || 1)) * 100}%`);
}

/** Один раз вызывает cb, когда элемент появился на экране (для анимаций «при прокрутке») */
export function onVisible(el: Element, cb: () => void, threshold = 0.35) {
  if (reduced() || !("IntersectionObserver" in window)) return cb();
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { threshold }
  );
  io.observe(el);
}

/** 1308.05 → «1 308,05 €» — тот же формат, что во всём сайте */
export { eur as euro } from "@/lib/license-costs";

/** «1 балл», «3 балла», «6 баллов» */
export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many;
};

export const DAY = 86400000;
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const parseDate = (v: string) => (v ? new Date(v + "T00:00:00") : null);
/** «10 мая 2027» */
export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  d.toLocaleDateString("ru-RU", opts).replace(/\s*г\.$/, "");
export const addMonths = (d: Date, m: number) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() + m);
  return r;
};
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);
