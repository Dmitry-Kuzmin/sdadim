/**
 * SEO — единый источник для <head> всех страниц (рендерится на сервере в Base.astro).
 * Тексты, даты и обложки статей — во frontmatter MDX (src/content/blog).
 */
import { cardTitle, getPosts, modified, type Post } from "@/lib/blog";
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
  logo: `${SITE_URL}/logo.png`,
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

export async function blogSeo(): Promise<PageSeo> {
  const posts = await getPosts();
  return {
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
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: cardTitle(p),
          url: `${SITE_URL}/blog/${p.id}`,
          datePublished: p.data.publishedAt.toISOString(),
        })),
      },
      breadcrumbs([
        { name: "Главная", url: `${SITE_URL}/` },
        { name: "Блог", url: `${SITE_URL}/blog` },
      ]),
    ],
  };
}

export function articleSeo(post: Post): PageSeo {
  const d = post.data;
  const url = `${SITE_URL}/blog/${post.id}`;
  const image = abs(d.cover);
  const headline = d.ogTitle ?? cardTitle(post);
  return {
    title: d.seoTitle,
    description: d.description,
    ogTitle: d.ogTitle,
    ogDescription: d.ogDescription,
    canonical: url,
    ogImage: image,
    ogType: "article",
    article: { publishedTime: d.publishedAt.toISOString(), modifiedTime: modified(post).toISOString(), section: d.category },
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline,
        description: d.description,
        image: [image],
        datePublished: d.publishedAt.toISOString(),
        dateModified: modified(post).toISOString(),
        inLanguage: "ru",
        articleSection: d.category,
        wordCount: post.body ? post.body.split(/\s+/).length : undefined,
        timeRequired: `PT${d.readingTime}M`,
        mainEntityOfPage: url,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      LD_ORGANIZATION,
      ...(d.faq.length
        ? [
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ]
        : []),
      breadcrumbs([
        { name: "Главная", url: `${SITE_URL}/` },
        { name: "Блог", url: `${SITE_URL}/blog` },
        { name: cardTitle(post), url },
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
