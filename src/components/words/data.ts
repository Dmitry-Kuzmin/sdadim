/** Слова для игр: снимает XOR и gzip с /ispanskij-dlya-dgt/slovar.bin (сервер — src/pages/ispanskij-dlya-dgt/slovar.bin.ts). */
import type { Word } from "@/lib/words";

declare const __WORDS_KEY__: string;

async function fetchWords(): Promise<Word[]> {
  const key = Uint8Array.from(atob(__WORDS_KEY__), (c) => c.charCodeAt(0));
  const buf = new Uint8Array(await (await fetch("/ispanskij-dlya-dgt/slovar.bin")).arrayBuffer());
  for (let i = 0; i < buf.length; i++) buf[i] ^= key[i & 31];
  return JSON.parse(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
}

let wordsP: Promise<Word[]> | null = null;
export const loadWords = () => {
  wordsP ??= fetchWords();
  wordsP.catch(() => (wordsP = null));
  return wordsP;
};
