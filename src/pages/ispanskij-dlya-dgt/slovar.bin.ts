/**
 * Слова для игр тренажёра (клиент — src/components/words/data.ts): gzip + XOR ключом сборки.
 * Чистого JSON больше нет — его забирал любой curl, а Vercel отдавал с CORS «*», так что чужой сайт мог
 * подтягивать словарь прямо из браузера. Это не шифр (ключ в бандле страницы), а цена входа: формат
 * меняется с каждой сборкой, тексты несут водяной знак (src/lib/watermark.ts), а скрипты без браузера
 * отсекает Bot Protection на краю Vercel (см. CLAUDE.md, «Защита словаря»).
 */
import { gzipSync } from "node:zlib";
import { WORDS } from "@/lib/words";

declare const __WORDS_KEY__: string;

export function GET() {
  const key = Buffer.from(__WORDS_KEY__, "base64");
  const buf = gzipSync(JSON.stringify(WORDS));
  for (let i = 0; i < buf.length; i++) buf[i] ^= key[i & 31];
  return new Response(buf, { headers: { "Content-Type": "application/octet-stream" } });
}
