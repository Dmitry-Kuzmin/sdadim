# Сдадим (sdadim.eu) — справочник для агентов

Онлайн-курс подготовки к теории DGT на русском. **Astro 7 · Tailwind 3 · MDX · TypeScript · Vercel.**
Фреймворков на клиенте нет: весь интерактив — маленькие ванильные `<script>` в компонентах.
React не возвращать — сайт целиком статический HTML (главная ≈ 5 КБ JS gzip).

```
npm run dev     # localhost:4321
npm run build   # сборка + SEO-проверка + битые ссылки/якоря + IndexNow (только прод)
```

## Статьи блога — `src/content/blog/<slug>.mdx`

Frontmatter — единственный источник: страница, карточки, SEO, JSON-LD, sitemap, RSS, llms.txt
(схема и комментарии — `src/content.config.ts`). Каркас статьи (шапка, мета, сайдбар, «Читайте также») —
`src/layouts/ArticleLayout.astro`, в MDX только текст и блоки.

- Абзацы и `##` — обычный Markdown; заголовок с якорем для оглавления — `<h2 id="slug">Текст</h2>`.
- Блоки кита без импорта: `Figure Callout CardGrid Divider Banner Accordion List Stats Table Quote Tabs/TabPanel Spoiler Comparison LinkCard Video Quiz`
  (`src/components/article/`). Свой виджет статьи — `src/components/widgets/*.astro` + `import` в MDX.
- Текст внутри `<p>`, `<h3>`, `<a>`… пишите **в одну строку**: многострочный MDX оборачивает в лишний `<p>`.
- Сайдбар — блоки `sidebar:` во frontmatter (toc, fact, card, stat, banner).
- Обложка: HTML-шаблон `scripts/covers/<slug>.html` → `npm run covers -- <slug>` → `public/assets/blog/<slug>.jpg`.

## Главная и данные

| Что | Где |
|---|---|
| Секции главной | `src/components/home/` |
| Тексты, шаги, отзывы | `src/data/home/content.ts` |
| FAQ (и FAQPage-схема) | `src/lib/home-faq.ts` |
| Тарифы (цены из Supabase поверх) | `src/lib/plans.ts`, `src/lib/course-data.ts` |
| Квиз подбора тарифа | `src/lib/course-quiz.ts` (порядок ответов синхронно с ботом) |
| Цены прав, пошлина DGT | `src/lib/license-costs.ts` (синхронно с migran.es) |
| SEO, JSON-LD | `src/lib/seo.ts`; sitemap/RSS/llms — `src/pages/*.ts` |

Классы Tailwind из `.mdx` тоже сканируются (`tailwind.config.ts`). Тёмная тема — через CSS-переменные,
`dark:`-варианты не нужны.
