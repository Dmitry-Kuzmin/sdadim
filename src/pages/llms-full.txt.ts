/** Все статьи целиком в простом тексте — для ИИ-поиска (GEO) */
import { cardTitle, modified } from "@/lib/blog";
import { discoveryPages, plainText, SITE_URL } from "@/lib/discovery";

export async function GET() {
  const { posts } = await discoveryPages();
  const body = `# Sdadim.eu — полный текст статей

Sdadim is a Russian-language educational project focused on passing the DGT exam in Spain and understanding the document flow, theory, practical exam, and common mistakes.

${posts
  .map(
    (p) => `---

## ${cardTitle(p)}
URL: ${SITE_URL}/blog/${p.id}
Published: ${p.data.publishedAt.toISOString().slice(0, 10)} · Updated: ${modified(p).toISOString().slice(0, 10)}
Category: ${p.data.category}

${p.data.excerpt}

${plainText(p)}`
  )
  .join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
