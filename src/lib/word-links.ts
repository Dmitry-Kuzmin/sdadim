/**
 * Ссылки на словарь в статьях блога: испанское слово из тренажёра в готовом HTML статьи становится
 * ссылкой на его страницу (/ispanskij-dlya-dgt/slovo/<id>). Ставится при сборке (Prose.astro) — это
 * внутренняя перелинковка для поиска. Подсказку при наведении/тапе рисует WordTip.astro по data-атрибутам.
 *
 * Работает по HTML, а не плагином MDX: процессор MDX в Astro 7 (Satteri) не запускает rehype-плагины.
 *
 * Правила, чтобы текст не превратился в «ёлку»:
 *  - только первое упоминание слова в статье, не больше MAX ссылок на статью и одной — на абзац или пункт;
 *  - только в абзацах, списках, таблицах и цитатах — не в заголовках, ссылках, коде, кнопках и скриптах;
 *  - длинные фразы раньше коротких: «ceda el paso» целиком, а не «paso» внутри неё;
 *  - только слова со своей страницей (hasPage).
 */
import { WORDS, hasPage, wordUrl } from "@/lib/words";

const MAX = 12;
/** Интернационализмы, которые в русском тексте не про испанский. */
const SKIP = new Set(["stop", "taxi", "gps", "abs", "airbag"]);
const TEXT_IN = new Set(["p", "li", "td", "th", "blockquote", "dd", "figcaption"]);
const NEVER_IN = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "button", "kbd", "script", "style", "summary", "svg", "label", "select", "textarea"]);
const VOID = new Set(["br", "img", "hr", "input", "meta", "link", "source", "wbr", "col", "area", "base", "embed", "track", "path", "circle", "rect", "line", "polyline", "polygon", "use"]);

const terms = WORDS.filter((w) => hasPage(w) && w.es.length >= 3 && !SKIP.has(w.es.toLowerCase())).sort((a, b) => b.es.length - a.es.length);
const byLow = new Map(terms.map((w) => [w.es.toLowerCase(), w]));
const RE = new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map((w) => w.es.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}])`, "giu");
const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const clip = (s = "", n = 120) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n)) + "…");

export function linkWords(html: string): string {
  const used = new Set<string>();
  const stack: string[] = [];
  let count = 0;
  /** Уже есть ссылка в текущем абзаце/пункте/ячейке: вторая рядом — это «ёлка». */
  let blockUsed = false;
  const allowed = () => stack.some((t) => TEXT_IN.has(t)) && !stack.some((t) => NEVER_IN.has(t));

  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        const m = part.match(/^<(\/?)([a-zA-Z][\w-]*)/);
        if (!m || part.startsWith("<!")) return part;
        const tag = m[2].toLowerCase();
        if (m[1]) {
          const i = stack.lastIndexOf(tag);
          if (i >= 0) stack.length = i;
        } else if (!VOID.has(tag) && !part.endsWith("/>")) {
          stack.push(tag);
          if (TEXT_IN.has(tag)) blockUsed = false;
        }
        return part;
      }
      if (!part || count >= MAX || blockUsed || !allowed()) return part;
      return part.replace(RE, (hit) => {
        const w = byLow.get(hit.toLowerCase());
        if (!w || used.has(w.id) || count >= MAX || blockUsed) return hit;
        used.add(w.id);
        count++;
        blockUsed = true;
        const data = [`data-ru="${attr(w.ru)}"`, w.d && `data-d="${attr(clip(w.d))}"`, w.img && `data-img="${w.img}"`].filter(Boolean).join(" ");
        return `<a href="${wordUrl(w)}" class="wl" ${data}>${hit}</a>`;
      });
    })
    .join("");
}
