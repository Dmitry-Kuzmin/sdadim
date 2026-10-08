/** Список страниц для проверки сборки (scripts/seo-assert-dist.mjs) */
import { discoveryPages, SITE_URL } from "@/lib/discovery";

export const DISCOVERY_FILES = ["robots.txt", "sitemap.xml", "news-sitemap.xml", "rss.xml", "llms.txt", "llms-full.txt", "content-platform-manifest.json"];

export async function GET() {
  const { pages, posts } = await discoveryPages();
  return Response.json({
    siteName: "sdadim",
    siteUrl: SITE_URL,
    generatedAt: new Date().toISOString(),
    discoveryFiles: DISCOVERY_FILES,
    counts: { pages: pages.length, posts: posts.length },
    pages,
  });
}
