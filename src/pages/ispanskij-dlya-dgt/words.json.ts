/** Слова для игр тренажёра: грузятся по первому клику «Играть» (src/components/words/trainer.ts). */
import { WORDS } from "@/lib/words";

export function GET() {
  return new Response(JSON.stringify(WORDS), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
