/**
 * SEO — единый источник для <head> всех страниц (рендерится на сервере в Base.astro).
 * Даты, обложки и категории статей берутся из blog-posts.json, здесь — только тексты.
 */
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { getPlans } from "@/lib/plans";
import { FAQ_DATA } from "@/lib/home-faq";

export const SITE_URL = "https://sdadim.eu";
export const SITE_NAME = "Сдадим";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/blog/oshibki-ekzamen-vozhdeniya.jpg`;

export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  jsonLd?: object[];
  article?: { publishedTime: string; modifiedTime: string; section: string };
}

/* ─── Организация и курс ─────────────────────────────────── */

export const LD_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: SITE_NAME,
  alternateName: "Sdadim",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon-s.svg`,
  email: "support@skilyapp.com",
  sameAs: ["https://t.me/skilyapp_bot"],
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: ["Russian"] },
};

const LD_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "ru",
  publisher: { "@id": `${SITE_URL}/#org` },
};

function ldCourse() {
  const plans = getPlans();
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Подготовка к теоретическому экзамену DGT в Испании",
    description:
      "Онлайн-курс на русском: 16 живых уроков, тренажёр с вопросами DGT, испанский для водителей и помощь с документами (Cita Previa, Tasa, Psicotécnico).",
    url: `${SITE_URL}/`,
    inLanguage: "ru",
    provider: { "@id": `${SITE_URL}/#org` },
    offers: plans.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: String(p.price),
      priceCurrency: "EUR",
      category: "Paid",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/#pricing`,
    })),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "P2M",
      inLanguage: "ru",
    },
  };
}

function ldFaq() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: Object.values(FAQ_DATA)
      .flat()
      .map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };
}

const breadcrumbs = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
});

/* ─── Страницы ───────────────────────────────────────────── */

export const HOME_SEO: PageSeo = {
  title: "Водительские права в Испании — теория DGT с первого раза | Сдадим",
  description:
    "Онлайн-курс подготовки к теоретическому экзамену DGT на русском языке. 16 живых уроков, тренажёр с вопросами DGT, помощь с Cita и Tasa. 9 из 10 студентов сдают с первой попытки.",
  canonical: `${SITE_URL}/`,
  ogTitle: "Теория на права в Испании. На русском.",
  ogType: "website",
  jsonLd: [LD_ORGANIZATION, LD_WEBSITE, ldCourse(), ldFaq()],
};

export const BLOG_SEO: PageSeo = {
  title: "Блог о правах в Испании | Сдадим",
  description: "Полезные статьи о получении прав в Испании для русскоязычных: гайды, советы, разбор экзамена DGT, стоимость и документы.",
  canonical: `${SITE_URL}/blog`,
  ogType: "website",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Блог Сдадим",
      url: `${SITE_URL}/blog`,
      inLanguage: "ru",
      publisher: { "@id": `${SITE_URL}/#org` },
      blogPost: blogPosts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.published_at })),
    },
    breadcrumbs([
      { name: "Главная", url: `${SITE_URL}/` },
      { name: "Блог", url: `${SITE_URL}/blog` },
    ]),
  ],
};

/** Тексты статей (перенесены из useSEO-хуков компонентов) */
const ARTICLE_TEXT: Record<string, { title: string; description: string; ogTitle?: string; ogDescription?: string }> = {
  "oshibki-ekzamen-vozhdeniya": {
    title: "Все ошибки на экзамене по вождению DGT 2026 — полная таблица штрафных баллов | Сдадим",
    description: "Полная таблица ошибок на практическом экзамене DGT в Испании: leves, deficientes, eliminatorias. Как их избежать и сдать с первого раза (2026).",
    ogTitle: "Все ошибки на экзамене по вождению DGT 2026 — полная таблица штрафных баллов",
    ogDescription: "Официальный перечень ошибок DGT на русском: 14 разделов, 3 уровня тяжести, советы по каждой ситуации.",
  },
  "istoriya-sdachi-prav-malaga": {
    title: "Как я сдавала практику по вождению в Испании: честная история из Малаги | Сдадим",
    description: "Реальная история сдачи практики DGT в Малаге: подготовка теории онлайн, 10 уроков за 5 дней, ноль ошибок на экзамене. Что отличает вождение в Испании и сколько всё стоит.",
    ogDescription: "739 евро, полгода и ноль ошибок. Теория онлайн, практика в малагской автошколе — рассказываю всё как есть.",
  },
  "tseny-na-prava": {
    title: "Сколько стоит получить права в Испании? (Калькулятор 2026) | Сдадим",
    description: "Полный разбор цен на водительские права в Испании в 2026 году: пошлина DGT 94,05€ и когда её платят повторно, автошкола, медкомиссия, пересдачи. Калькулятор бюджета.",
    ogTitle: "Цены на водительские права в Испании 2026 + калькулятор",
  },
  "slovar-dgt": {
    title: "Словарик будущего водителя в Испании: термины DGT на русском | Сдадим",
    description: "Словарь автомобильных терминов Испании: документы (NIE, Tasa), команды экзаменатора (Glorieta, Paso de peatones) и знаки с русским переводом.",
    ogTitle: "Испанский словарь водителя — термины DGT на русском",
  },
  "prakticheskiy-ekzamen": {
    title: "Как сдать практический экзамен по вождению в Испании с первого раза | Сдадим",
    description: "Сдаём практический экзамен DGT с первого раза: вопросы экзаменатора, ловушки на маршруте и психология успешной сдачи (2026).",
    ogDescription: "Полное руководство: от проверки масла до ловушек экзаменатора на маршруте.",
  },
  "poddelnyye-prava-ispaniya": {
    title: "Поддельные права в Испании: тюрьма, штрафы и легальный путь (2026) | Сдадим",
    description: "Чем грозит покупка поддельных прав в Испании: штраф от 12 до 24 месяцев, лишение свободы до 3 лет, отказ страховой. И как получить права легально с первого раза.",
    ogTitle: "Поддельные права в Испании: цена обмана и легальный путь",
  },
  "ekonomichnoe-vozhdenie": {
    title: "Экономичное вождение: 13 техник для снижения расхода топлива | Сдадим",
    description: "13 техник экономичного вождения: педаль газа, инерция, скорость на трассе и мифы бывалых. Разбор вопросов DGT на тему расхода топлива.",
    ogDescription: "Плавный разгон, чтение дороги, инерция, давление в шинах и разбор мифов про нейтралку. Включает вопросы темы DGT.",
  },
};

export function articleSeo(post: BlogPost): PageSeo {
  const text = ARTICLE_TEXT[post.slug] ?? { title: `${post.title} | Сдадим`, description: post.excerpt };
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.cover_image ? abs(post.cover_image) : DEFAULT_OG_IMAGE;
  return {
    ...text,
    canonical: url,
    ogImage: image,
    ogType: "article",
    article: { publishedTime: post.published_at, modifiedTime: post.updated_at, section: post.category },
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: text.ogTitle ?? post.title,
        description: text.description,
        image: [image],
        datePublished: post.published_at,
        dateModified: post.updated_at,
        inLanguage: "ru",
        articleSection: post.category,
        mainEntityOfPage: url,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      LD_ORGANIZATION,
      breadcrumbs([
        { name: "Главная", url: `${SITE_URL}/` },
        { name: "Блог", url: `${SITE_URL}/blog` },
        { name: post.title, url },
      ]),
    ],
  };
}

export const LEGAL_TABS = ["terms", "privacy", "cookies", "subscription", "refund"] as const;
export type LegalTab = (typeof LEGAL_TABS)[number];

const LEGAL_TEXT: Record<LegalTab, { title: string; description: string }> = {
  terms: { title: "Публичная оферта", description: "Публичная оферта и условия оказания образовательных услуг Sdadim.eu." },
  privacy: { title: "Политика конфиденциальности", description: "Политика конфиденциальности Sdadim.eu и правила обработки персональных данных." },
  cookies: { title: "Политика cookies", description: "Политика cookies Sdadim.eu и информация об аналитических технологиях сайта." },
  subscription: { title: "Условия доступа", description: "Условия доступа к материалам, платформе и сопровождению курса Sdadim.eu." },
  refund: { title: "Возврат средств", description: "Правила возврата средств и порядок подачи запроса на возврат в Sdadim.eu." },
};

export function legalSeo(tab: LegalTab): PageSeo {
  return {
    title: `${LEGAL_TEXT[tab].title} | Сдадим`,
    description: LEGAL_TEXT[tab].description,
    canonical: `${SITE_URL}/legal/${tab}`,
    ogType: "website",
  };
}

export const NOT_FOUND_SEO: PageSeo = {
  title: "Страница не найдена | Сдадим",
  description: "Такой страницы нет. Вернитесь на главную или загляните в блог о правах в Испании.",
  canonical: `${SITE_URL}/404`,
  noindex: true,
};
