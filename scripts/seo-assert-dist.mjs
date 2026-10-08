#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const MANIFEST_FILE = "content-platform-manifest.json";

const distDir = resolve(process.cwd(), "dist");

function fail(message) {
  console.error(`❌ [sdadim SEO Assert] ${message}`);
  process.exit(1);
}

if (!existsSync(distDir)) {
  fail("dist directory not found.");
}

const manifestPath = resolve(distDir, MANIFEST_FILE);
if (!existsSync(manifestPath)) {
  fail(`Missing discovery manifest: dist/${MANIFEST_FILE}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const requiredFiles = [...manifest.discoveryFiles, "404.html"];
const requiredPages = manifest.pages;

for (const relPath of requiredFiles) {
  const filePath = resolve(distDir, relPath);
  if (!existsSync(filePath)) {
    fail(`Missing required file: dist/${relPath}`);
  }
}

const sitemapXml = readFileSync(resolve(distDir, "sitemap.xml"), "utf8");
const llmsTxt = readFileSync(resolve(distDir, "llms.txt"), "utf8");

const seen = new Map();
const canonicals = new Map();
const titles = new Map();

for (const page of requiredPages) {
  const relPath = page.outputPath;
  const filePath = resolve(distDir, relPath);
  if (!existsSync(filePath)) {
    fail(`Missing prerendered file: dist/${relPath}`);
  }

  const html = readFileSync(filePath, "utf8");
  if (html.length < 2000) {
    fail(`dist/${relPath} is too small (${html.length} bytes).`);
  }

  if (/<div id="root">\s*<\/div>/i.test(html)) {
    fail(`dist/${relPath} contains an empty React root.`);
  }

  if (!/<h1|<main|application\/ld\+json/i.test(html)) {
    fail(`dist/${relPath} has no semantic content markers.`);
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch?.[1]) {
    fail(`dist/${relPath} is missing a <title>.`);
  }

  const canonicalMatch = html.match(/<link rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch?.[1]) {
    fail(`dist/${relPath} is missing a canonical URL.`);
  }

  const title = titleMatch[1].trim();
  const canonical = canonicalMatch[1].trim();

  if (canonical !== page.canonical) {
    fail(`dist/${relPath} has canonical ${canonical}, expected ${page.canonical}.`);
  }

  const previousCanonical = canonicals.get(canonical);
  if (previousCanonical) {
    fail(`dist/${relPath} shares canonical with dist/${previousCanonical}.`);
  }
  canonicals.set(canonical, relPath);

  const previousTitle = titles.get(title);
  if (previousTitle) {
    fail(`dist/${relPath} shares <title> with dist/${previousTitle}.`);
  }
  titles.set(title, relPath);

  if (!sitemapXml.includes(page.canonical)) {
    fail(`dist/sitemap.xml is missing ${page.canonical}.`);
  }

  if (page.llmsRequired && !llmsTxt.includes(page.canonical)) {
    fail(`dist/llms.txt is missing article URL ${page.canonical}.`);
  }

  const normalized = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);

  const previous = seen.get(normalized);
  if (previous) {
    fail(`dist/${relPath} appears identical to dist/${previous}.`);
  }

  seen.set(normalized, relPath);
}

console.log(`✅ [sdadim SEO Assert] dist passed (${requiredPages.length} pages checked).`);
