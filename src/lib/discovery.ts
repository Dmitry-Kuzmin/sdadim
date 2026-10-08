/**
 * Карта сайта для поисковиков и ИИ: sitemap, RSS, llms.txt и manifest для scripts/seo-assert-dist.mjs.
 * Всё строится из коллекции статей при сборке — ничего не нужно обновлять руками.
 */
import { getPosts, cardTitle, modified, type Post } from "@/lib/blog";
import { LEGAL_TABS } from "@/lib/seo";

export const SITE_URL = "https://sdadim.eu";
export const BUILD_DATE = new Date().toISOString().slice(0, 10);

export interface DiscoveryPage {
  route: string;
  outputPath: string;
  canonical: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
  lastmod: string;
  kind: "home" | "blog-index" | "legal" | "article";
  llmsRequired?: boolean;
}

const LEGAL_PRIORITY: Record<string, string> = { terms: "0.4", privacy: "0.4", cookies: "0.3", subscription: "0.3", refund: "0.3" };

export async function discoveryPages(): Promise<{ pages: DiscoveryPage[]; posts: Post[] }> {
  const posts = await getPosts();
  const newest = posts.map((p) => modified(p)).sort((a, b) => b.getTime() - a.getTime())[0];
  const blogLastmod = newest ? newest.toISOString().slice(0, 10) : BUILD_DATE;
  const pages: DiscoveryPage[] = [
    { route: "/", outputPath: "index.html", canonical: `${SITE_URL}/`, changefreq: "daily", priority: "1.0", lastmod: BUILD_DATE, kind: "home" },
    { route: "/blog", outputPath: "blog.html", canonical: `${SITE_URL}/blog`, changefreq: "daily", priority: "0.9", lastmod: blogLastmod, kind: "blog-index" },
    ...LEGAL_TABS.map((t) => ({
      route: `/legal/${t}`,
      outputPath: `legal/${t}.html`,
      canonical: `${SITE_URL}/legal/${t}`,
      changefreq: "monthly" as const,
      priority: LEGAL_PRIORITY[t],
      lastmod: "2025-04-01",
      kind: "legal" as const,
    })),
    ...posts.map((p, i) => ({
      route: `/blog/${p.id}`,
      outputPath: `blog/${p.id}.html`,
      canonical: `${SITE_URL}/blog/${p.id}`,
      changefreq: "weekly" as const,
      priority: "0.85",
      lastmod: modified(p).toISOString().slice(0, 10),
      kind: "article" as const,
      llmsRequired: i < 20,
    })),
  ];
  return { pages, posts };
}

export const xml = (v = "") => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Текст статьи для llms-full.txt: MDX без импортов, JSX-блоков и разметки */
export function plainText(post: Post): string {
  return (post.body ?? "")
    .replace(/^import .*$/gm, "")
    .replace(/<[A-Z][\s\S]*?\/>/g, "")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\{[^{}]*\}/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export { cardTitle };
