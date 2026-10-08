import { cardTitle, getPosts, modified } from "@/lib/blog";
import { SITE_URL, xml } from "@/lib/discovery";

export async function GET() {
  const posts = await getPosts();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sdadim Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Русскоязычный блог о правах и экзамене DGT в Испании.</description>
    <language>ru</language>
    <lastBuildDate>${(posts[0] ? modified(posts[0]) : new Date()).toUTCString()}</lastBuildDate>
${posts
  .map(
    (p) => `    <item>
      <title>${xml(cardTitle(p))}</title>
      <link>${SITE_URL}/blog/${p.id}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.id}</guid>
      <description>${xml(p.data.excerpt)}</description>
      <pubDate>${p.data.publishedAt.toUTCString()}</pubDate>
      <category>${xml(p.data.category)}</category>
      <enclosure url="${SITE_URL}${p.data.cover}" type="image/jpeg" length="0" />
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
