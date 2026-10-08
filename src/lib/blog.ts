/** Статьи блога из коллекции: сортировка, даты, похожие статьи */
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Опубликованные статьи, свежие первыми — порядок для блога, RSS и главной */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export const postUrl = (p: Post) => `/blog/${p.id}`;
export const cardTitle = (p: Post) => p.data.cardTitle ?? p.data.title;
export const modified = (p: Post) => p.data.updatedAt ?? p.data.publishedAt;

export const ruDate = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\s*г\.$/, "");
