/** DOM-помощники тренажёра слов. */
import type { Word } from "@/lib/words";

/** Маленький помощник для DOM: h("button.wt-opt", { onclick }, "текст"). */
type Kid = Node | string | null | undefined | false;
export function h<K extends keyof HTMLElementTagNameMap>(sel: K | `${K}.${string}`, props?: Record<string, any>, ...kids: Kid[]): HTMLElementTagNameMap[K];
export function h(sel: string, props?: Record<string, any>, ...kids: Kid[]): HTMLElement;
export function h(sel: string, props: Record<string, any> = {}, ...kids: Kid[]) {
  const [tag, ...cls] = sel.split(".");
  const el = document.createElement(tag);
  if (cls.length) el.className = cls.join(" ");
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "style") el.setAttribute("style", v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const k of kids) if (k != null && k !== false) el.append(k);
  return el;
}
export const imgOf = (w: Word) => (w.img ? `/img/slova/${w.id}.webp` : "");
export const picture = (w: Word, cls = "") => (w.img ? h("img.wt-pic" + (w.img === "sign" ? ".is-sign" : "") + (cls ? "." + cls : ""), { src: imgOf(w), alt: "", decoding: "async" }) : null);
