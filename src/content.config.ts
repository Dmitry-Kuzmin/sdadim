/**
 * Статьи блога — MDX в src/content/blog/<slug>.mdx. Frontmatter — единственный источник
 * метаданных: страница, карточки блога, SEO, JSON-LD, sitemap, RSS и llms.txt берут всё отсюда.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Иконки, доступные во frontmatter (мета-строка и сайдбар) — см. src/lib/article-icons.ts */
const icon = z.enum([
  "calendar", "clock", "receipt", "fuel", "check", "alert", "coins", "gauge", "shield-check", "shield-alert", "navigation", "lightbulb", "book",
]);

const sidebarBlock = z.discriminatedUnion("type", [
  /** Оглавление: якоря и подписи — как задумал автор, не обязательно = заголовкам */
  z.object({ type: z.literal("toc"), items: z.array(z.tuple([z.string(), z.string()])), bordered: z.boolean().default(true) }),
  /** Карточка «факт»: заголовок-капс, иконка справа, текст (inline-HTML) */
  z.object({ type: z.literal("fact"), title: z.string(), icon, iconClass: z.string(), html: z.string() }),
  /** Цветная карточка с заголовком, текстом и ссылкой */
  z.object({
    type: z.literal("card"),
    tone: z.enum(["blue", "emerald", "red"]),
    title: z.string(),
    icon: icon.optional(),
    /** Иконка внутри заголовка, а не рядом с ним */
    inlineIcon: z.boolean().default(false),
    html: z.string(),
    /** Доп. классы абзаца (отступ снизу) */
    textClass: z.string().optional(),
    link: z.object({ href: z.string(), text: z.string() }).optional(),
  }),
  /** Крупная цифра */
  z.object({ type: z.literal("stat"), value: z.string(), label: z.string(), note: z.string().optional() }),
  /** Баннер курса */
  z.object({ type: z.literal("banner"), variant: z.enum(["compact", "default", "inline"]).default("compact") }),
]);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    /** H1 статьи */
    title: z.string(),
    /** Короткий заголовок для карточек, хлебных крошек и RSS (по умолчанию = title) */
    cardTitle: z.string().optional(),
    /** <title> и description для поиска */
    seoTitle: z.string(),
    description: z.string(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    /** Анонс в карточках блога, RSS и llms.txt */
    excerpt: z.string(),
    category: z.string(),
    /** Подпись плашки над H1 (по умолчанию = category) */
    chip: z.string().optional(),
    accent: z.enum(["blue", "emerald", "red", "amber"]).default("blue"),
    /** Лид под H1, допускается inline-HTML */
    lead: z.string(),
    cover: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    readingTime: z.number(),
    /** Строка под лидом. Не задана — дата публикации и время чтения */
    meta: z.array(z.object({ icon, text: z.string(), iconClass: z.string().optional() })).optional(),
    sidebar: z.array(sidebarBlock).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
