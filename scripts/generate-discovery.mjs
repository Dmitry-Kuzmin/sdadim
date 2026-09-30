#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { BUILD_DATE, MANIFEST_FILE, SITE_URL, buildContentPlatformManifest } from "./content-platform.mjs";

const PUBLIC_DIR = resolve(process.cwd(), "public");

function ensureDirectory(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function writePublicFile(fileName, content) {
  const filePath = resolve(PUBLIC_DIR, fileName);
  ensureDirectory(filePath);
  writeFileSync(filePath, content, "utf8");
  console.log(`[Discovery] Wrote public/${fileName}`);
}

function xmlEscape(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRssDate(dateString) {
  return new Date(dateString).toUTCString();
}

function toNewsDate(dateString) {
  return new Date(dateString).toISOString();
}

function buildSitemap(manifest) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${manifest.pages
  .map(
    (page) => `  <url>
    <loc>${xmlEscape(page.canonical)}</loc>
    <lastmod>${page.publishedAt?.slice(0, 10) || BUILD_DATE}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function buildNewsSitemap(posts) {
  const recentThreshold = Date.now() - 1000 * 60 * 60 * 24 * 2;
  const recentPosts = posts.filter((post) => {
    const publishedAt = new Date(post.published_at).getTime();
    return Number.isFinite(publishedAt) && publishedAt >= recentThreshold;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentPosts
  .map(
    (post) => `  <url>
    <loc>${xmlEscape(`${SITE_URL}/blog/${post.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Sdadim Blog</news:name>
        <news:language>ru</news:language>
      </news:publication>
      <news:publication_date>${toNewsDate(post.published_at)}</news:publication_date>
      <news:title>${xmlEscape(post.title)}</news:title>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function buildRss(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sdadim Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Русскоязычный блог о правах и экзамене DGT в Испании.</description>
    <language>ru</language>
${posts
  .map(
    (post) => `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${xmlEscape(post.excerpt || "")}</description>
      <pubDate>${toRssDate(post.published_at)}</pubDate>
      <category>${xmlEscape(post.category || "Статьи")}</category>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;
}

function buildLlmsTxt(posts) {
  return `# Sdadim.eu

Sdadim helps Russian-speaking immigrants prepare for the Spanish DGT theory exam and understand the process of getting a driving license in Spain.

## Core pages
- [Главная](${SITE_URL}/): онлайн-курс подготовки к теории DGT на русском, тарифы и калькулятор стоимости прав
- [Блог](${SITE_URL}/blog): статьи о получении водительских прав в Испании

## Latest articles
${posts
  .slice(0, 20)
  .map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt || ""}`)
  .join("\n")}

## Canonical rules
- Use ${SITE_URL}/blog/{slug} as the canonical URL for articles.
- Prefer articles with concrete guidance, legal nuance, pricing, exam strategy, and document workflows.
`;
}

function buildLlmsFullTxt(posts) {
  return `# Sdadim.eu full index

## About
Sdadim is a Russian-language educational project focused on passing the DGT exam in Spain and understanding the document flow, theory, practical exam, and common mistakes.

## Articles
${posts
  .map(
    (post) => `### ${post.title}
URL: ${SITE_URL}/blog/${post.slug}
Published: ${post.published_at}
Category: ${post.category || "Статьи"}
Summary: ${post.excerpt || ""}`
  )
  .join("\n\n")}
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml
`;
}

async function main() {
  const manifest = await buildContentPlatformManifest();
  const posts = manifest.posts;

  if (posts.length === 0) {
    throw new Error("No published blog posts found for sdadim.eu discovery generation.");
  }

  writePublicFile("sitemap.xml", buildSitemap(manifest));
  writePublicFile("news-sitemap.xml", buildNewsSitemap(posts));
  writePublicFile("rss.xml", buildRss(posts));
  writePublicFile("llms.txt", buildLlmsTxt(posts));
  writePublicFile("llms-full.txt", buildLlmsFullTxt(posts));
  writePublicFile("robots.txt", buildRobots());
  writePublicFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`[Discovery] Completed. Posts processed: ${posts.length}`);
}

main().catch((error) => {
  console.error("[Discovery]", error);
  process.exit(1);
});
