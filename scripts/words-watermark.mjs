// Проверка чужой страницы или файла на водяной знак словаря (src/lib/watermark.ts):
//   npm run words:watermark -- https://чужой-сайт/...   или   -- ./скачанная-страница.html
// Ищет наши русские тексты с нашим рисунком неразрывных пробелов. Совпадение рисунка в строке с 2+ местами —
// почти наверняка копия с sdadim.eu (случайно совпасть ≤ 1/4 на строку, на десятках строк — ноль).
import { readFileSync, existsSync } from "node:fs";
import { mark, slots } from "../src/lib/watermark.ts";

const src = process.argv[2];
if (!src) {
  console.error("Укажите адрес или файл: npm run words:watermark -- <url|файл>");
  process.exit(1);
}
const raw = existsSync(src) ? readFileSync(src, "utf8") : await (await fetch(src, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
// HTML-сущности неразрывного пробела → символ; JSON-экранирование   → символ.
const text = raw.replace(/&nbsp;|&#160;|&#xa0;/gi, " ").replace(/\\u00a0/gi, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const flat = (s) => s.replace(/ /g, " ");
const flatText = flat(text);

const words = JSON.parse(readFileSync(new URL("../src/data/words.json", import.meta.url), "utf8"));
let found = 0, marked = 0;
const hits = [];
for (const w of words) {
  const fields = [["ru", w.ru], ["d", w.d], ["h", w.h], ["ex", w.ex?.ru]];
  for (const [f, s] of fields) {
    if (!s || slots(s) < 2) continue;
    const ours = mark(s, `${w.id}/${f}`);
    if (!flatText.includes(flat(ours))) continue;
    found++;
    if (text.includes(ours)) marked++, hits.length < 5 && hits.push(ours.replace(/ /g, "⍽"));
  }
}
console.log(`Наших текстов на странице: ${found}; из них с нашим рисунком пробелов: ${marked}.`);
if (hits.length) console.log("Примеры (⍽ — неразрывный пробел):\n  " + hits.join("\n  "));
console.log(marked >= 3 ? "→ Копия с sdadim.eu: сохраните страницу (web.archive.org) и вывод скрипта для жалобы."
  : found ? "→ Тексты наши, но пробелы нормализованы: знак стёрт, доказывайте по совпадению текстов и датам." : "→ Наших текстов не найдено.");
