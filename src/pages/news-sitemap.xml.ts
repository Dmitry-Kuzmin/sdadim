/** Google News: только статьи последних двух суток */
import { cardTitle, getPosts } from "@/lib/blog";
import { SITE_URL, xml } from "@/lib/discovery";

export async function GET() {
  const since = Date.now() - 2 * 24 * 3600 * 1000;
  const posts = (await getPosts()).filter((p) => p.data.publishedAt.getTime() >= since);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${posts
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}/blog/${p.id}</loc>
    <news:news>
      <news:publication><news:name>Sdadim Blog</news:name><news:language>ru</news:language></news:publication>
      <news:publication_date>${p.data.publishedAt.toISOString()}</news:publication_date>
      <news:title>${xml(cardTitle(p))}</news:title>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
