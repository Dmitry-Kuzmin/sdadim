#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getPublishedBlogPosts } from "./blog-data.mjs";

export const SITE_URL = "https://sdadim.eu";
export const BUILD_DATE = new Date().toISOString().slice(0, 10);
export const MANIFEST_FILE = "content-platform-manifest.json";
export const DISCOVERY_FILES = [
  "robots.txt",
  "sitemap.xml",
  "news-sitemap.xml",
  "rss.xml",
  "llms.txt",
  "llms-full.txt",
  MANIFEST_FILE,
];

export const CORE_PAGES = [
  {
    route: "/",
    outputPath: "index.html",
    canonical: `${SITE_URL}/`,
    changefreq: "daily",
    priority: "1.0",
    kind: "home",
  },
  {
    route: "/blog",
    outputPath: "blog.html",
    canonical: `${SITE_URL}/blog`,
    changefreq: "daily",
    priority: "0.9",
    kind: "blog-index",
  },
  {
    route: "/legal/terms",
    outputPath: "legal/terms.html",
    canonical: `${SITE_URL}/legal/terms`,
    changefreq: "monthly",
    priority: "0.4",
    kind: "legal",
  },
  {
    route: "/legal/privacy",
    outputPath: "legal/privacy.html",
    canonical: `${SITE_URL}/legal/privacy`,
    changefreq: "monthly",
    priority: "0.4",
    kind: "legal",
  },
  {
    route: "/legal/cookies",
    outputPath: "legal/cookies.html",
    canonical: `${SITE_URL}/legal/cookies`,
    changefreq: "monthly",
    priority: "0.3",
    kind: "legal",
  },
  {
    route: "/legal/subscription",
    outputPath: "legal/subscription.html",
    canonical: `${SITE_URL}/legal/subscription`,
    changefreq: "monthly",
    priority: "0.3",
    kind: "legal",
  },
  {
    route: "/legal/refund",
    outputPath: "legal/refund.html",
    canonical: `${SITE_URL}/legal/refund`,
    changefreq: "monthly",
    priority: "0.3",
    kind: "legal",
  },
];

function normalizePost(post) {
  const slug = String(post.slug || "").trim();
  return {
    slug,
    title: String(post.title || "").trim(),
    excerpt: String(post.excerpt || "").trim(),
    cover_image: post.cover_image || "",
    published_at: post.published_at || BUILD_DATE,
    updated_at: post.updated_at || post.published_at || BUILD_DATE,
    category: post.category || "Статьи",
    reading_time: post.reading_time || 5,
  };
}

function buildArticlePage(post, index) {
  return {
    route: `/blog/${post.slug}`,
    outputPath: `blog/${post.slug}.html`,
    canonical: `${SITE_URL}/blog/${post.slug}`,
    changefreq: "weekly",
    priority: "0.85",
    kind: "article",
    llmsRequired: index < 20,
    slug: post.slug,
    title: post.title,
    description: post.excerpt,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    category: post.category,
  };
}

export async function buildContentPlatformManifest() {
  const posts = (await getPublishedBlogPosts()).map(normalizePost).filter((post) => post.slug);
  const pages = [...CORE_PAGES, ...posts.map(buildArticlePage)];

  return {
    siteName: "sdadim",
    siteUrl: SITE_URL,
    generatedAt: new Date().toISOString(),
    discoveryFiles: DISCOVERY_FILES,
    counts: {
      pages: pages.length,
      posts: posts.length,
    },
    pages,
    prerenderRoutes: [...pages.map((page) => page.route), "/404"],
    posts,
  };
}

export function readManifestFrom(baseDir) {
  const filePath = resolve(baseDir, MANIFEST_FILE);
  return JSON.parse(readFileSync(filePath, "utf8"));
}
