import { SITE_URL } from "@/lib/discovery";

export function GET() {
  return new Response(`User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
