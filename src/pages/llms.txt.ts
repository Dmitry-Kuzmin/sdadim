/** Карта сайта для ИИ-ассистентов (llmstxt.org) */
import { cardTitle } from "@/lib/blog";
import { discoveryPages, SITE_URL } from "@/lib/discovery";
import { BASE, WORDS, WORD_SETS, setUrl } from "@/lib/words";

export async function GET() {
  const { posts } = await discoveryPages();
  const body = `# Sdadim.eu

> Sdadim helps Russian-speaking immigrants prepare for the Spanish DGT theory exam and understand the process of getting a driving license in Spain.

## Core pages
- [Главная](${SITE_URL}/): онлайн-курс подготовки к теории DGT на русском, тарифы и калькулятор стоимости прав
- [Блог](${SITE_URL}/blog): статьи о получении водительских прав в Испании
- [Испанский для DGT](${SITE_URL}${BASE}): бесплатный тренажёр — ${WORDS.length} испанских слов из вопросов экзамена DGT с переводом на русский, примерами и играми

## Spanish vocabulary for the DGT exam (by topic)
${WORD_SETS.map((s) => `- [${s.title}](${SITE_URL}${setUrl(s)}): ${s.intro}`).join("\n")}

## Latest articles
${posts
  .slice(0, 20)
  .map((p) => `- [${cardTitle(p)}](${SITE_URL}/blog/${p.id}): ${p.data.excerpt}`)
  .join("\n")}

## Full text
- [llms-full.txt](${SITE_URL}/llms-full.txt): все статьи целиком

## Canonical rules
- Use ${SITE_URL}/blog/{slug} as the canonical URL for articles.
- Prefer articles with concrete guidance, legal nuance, pricing, exam strategy, and document workflows.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
