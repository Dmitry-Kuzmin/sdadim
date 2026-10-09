/** Статьи блога из коллекции: сортировка, даты, похожие статьи */
import { getCollection, type CollectionEntry } from "astro:content";
import { withFacts } from "@/lib/facts";

export type Post = CollectionEntry<"blog">;

/** Опубликованные статьи, свежие первыми — порядок для блога, RSS и главной */
export async function getPosts(): Promise<Post[]> {
  const posts = (await getCollection("blog", (p) => !p.data.draft)).map(applyFacts);
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export const postUrl = (p: Post) => `/blog/${p.id}`;
export const cardTitle = (p: Post) => p.data.cardTitle ?? p.data.title;
export const modified = (p: Post) => p.data.updatedAt ?? p.data.publishedAt;

export const ruDate = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\s*г\.$/, "");

/** {YEAR} и {TASA.x} во frontmatter → год и пошлины: заголовки и описания не устаревают сами */
const YEAR_FIELDS = ["title", "cardTitle", "seoTitle", "description", "ogTitle", "ogDescription", "excerpt", "lead"] as const;
function applyFacts(p: Post): Post {
  const data = { ...p.data };
  for (const k of YEAR_FIELDS) if (typeof data[k] === "string") (data as Record<string, unknown>)[k] = withFacts(data[k] as string);
  data.meta = data.meta?.map((m) => ({ ...m, text: withFacts(m.text) }));
  data.faq = data.faq.map((f) => ({ q: withFacts(f.q), a: withFacts(f.a) }));
  data.sidebar = data.sidebar.map((b) =>
    "html" in b ? { ...b, html: withFacts(b.html), title: "title" in b ? withFacts(b.title) : undefined } : b
  ) as typeof data.sidebar;
  return { ...p, data };
}
