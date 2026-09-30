import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlogPost, getRelatedPosts, type BlogPost } from "@/lib/blog-posts";
import {
  Clock,
  ArrowLeft,
  Calendar,
  Share2,
  Twitter,
  Link2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SEO ─────────────────────────────────────────────────────────────────────

function useSEOMeta(post: BlogPost | null) {
  useEffect(() => {
    if (!post) return;
    const prev = {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
    };

    const setMeta = (selector: string, attr: string, val: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, selector.match(/\[(?:name|property)="(.+?)"\]/)?.[1] ?? "");
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    document.title = `${post.title} | Сдадим`;
    setMeta('meta[name="description"]', "name", post.excerpt);
    setMeta('meta[property="og:title"]', "property", post.title);
    setMeta('meta[property="og:description"]', "property", post.excerpt);
    if (post.cover_image) {
      const img = post.cover_image.startsWith("http") ? post.cover_image : `https://sdadim.eu${post.cover_image}`;
      setMeta('meta[property="og:image"]', "property", img);
    }
    setMeta('meta[property="og:url"]', "property", `https://sdadim.eu/blog/${post.slug}`);
    setMeta('meta[property="og:type"]', "property", "article");

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const canonicalUrl = `https://sdadim.eu/blog/${post.slug}`;
    canonical.href = canonicalUrl;

    // JSON-LD
    const ldId = "ld-article";
    document.getElementById(ldId)?.remove();
    const ld = document.createElement("script");
    ld.id = ldId;
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: post.cover_image ? (post.cover_image.startsWith("http") ? post.cover_image : `https://sdadim.eu${post.cover_image}`) : undefined,
      datePublished: post.published_at,
      publisher: { "@type": "Organization", name: "Сдадим", url: "https://sdadim.eu" },
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prev.title;
      document.querySelector('meta[name="description"]')?.setAttribute("content", prev.desc);
      document.querySelector('link[rel="canonical"]')?.remove();
      document.getElementById(ldId)?.remove();
    };
  }, [post]);
}

// ─── TOC from HTML ────────────────────────────────────────────────────────────

interface Heading {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(html: string): Heading[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const els = doc.querySelectorAll("h2, h3");
    return Array.from(els).map((el) => ({
      id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "",
      text: el.textContent ?? "",
      level: parseInt(el.tagName[1]),
    })).filter((h) => h.id && h.text);
  } catch {
    return [];
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto px-4 sm:px-6 py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-5 bg-slate-100 rounded w-24" />
          <div className="h-11 bg-slate-100 rounded w-3/4" />
          <div className="h-11 bg-slate-100 rounded w-1/2" />
          <div className="h-5 bg-slate-100 rounded w-40" />
          <div className="space-y-3 pt-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-4 bg-slate-100 rounded ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 h-48" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    setPost(getBlogPost(slug));
    setRelated(getRelatedPosts(slug));
    setLoading(false);
  }, [slug]);

  useSEOMeta(post);

  // Share handlers
  const shareUrl = `https://sdadim.eu/blog/${slug}`;
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title ?? "")}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };
  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post?.title, url: shareUrl });
    } else {
      handleCopyLink();
    }
  };

  if (loading) return <Skeleton />;

  if (!post) {
    return (
      <main className="pt-16 pb-20 px-4 text-center">
        <p className="text-slate-500 mb-6">Статья не найдена.</p>
        <Link to="/blog" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          ← Вернуться в блог
        </Link>
      </main>
    );
  }

  const publishedDate = new Date(post.published_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const headings = extractHeadings(post.content);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          {/* ── Main Article ────────────────────────────────────── */}
          <main className="lg:col-span-8">

            {/* Back nav */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Все статьи
            </Link>

            {/* Article header */}
            <div className="mb-8">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                {post.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {publishedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.reading_time} мин чтения
                </span>
              </div>
            </div>

            {/* Mobile: TOC + Share */}
            <div className="lg:hidden space-y-3 mb-8">
              {/* Share row */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {post.reading_time} мин чтения
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Поделиться</span>
                  <button
                    onClick={handleTwitter}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Поделиться"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile TOC */}
              {headings.length > 0 && (
                <div className="rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setTocOpen(!tocOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Содержание</span>
                    {tocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {tocOpen && (
                    <nav className="px-4 pb-4 space-y-2 max-h-56 overflow-y-auto border-t border-slate-200 pt-3">
                      {headings.map((h, i) => (
                        <a
                          key={i}
                          href={`#${h.id}`}
                          onClick={() => setTocOpen(false)}
                          className={cn(
                            "block text-sm transition-colors hover:text-slate-900",
                            h.level === 3
                              ? "ml-4 text-slate-500 hover:text-slate-700"
                              : "text-slate-600 font-medium"
                          )}
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              )}
            </div>

            {/* Cover image */}
            {post.cover_image && (
              <div className="rounded-2xl overflow-hidden mb-10">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full object-cover max-h-[420px]"
                />
              </div>
            )}

            {/* Article content */}
            <div
              className="prose prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3
                prose-h2:border-b prose-h2:border-slate-200
                prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-slate-700 prose-p:leading-[1.85] prose-p:text-[15px]
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 prose-strong:font-semibold
                prose-ul:text-slate-700 prose-ol:text-slate-700
                prose-li:marker:text-blue-600 prose-li:leading-relaxed prose-li:text-[15px]
                prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5
                prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 prose-blockquote:py-1
                prose-table:text-slate-700 prose-thead:border-slate-200 prose-tr:border-slate-200
                prose-th:text-slate-900 prose-th:font-semibold
                prose-code:text-blue-700 prose-code:bg-blue-500/10 prose-code:rounded prose-code:px-1"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-600 mb-4">Поделиться статьёй</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleTwitter}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                    copied
                      ? "border-green-500/40 bg-green-500/10 text-green-600"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                  )}
                >
                  <Link2 className="w-4 h-4" />
                  {copied ? "Скопировано!" : "Копировать ссылку"}
                </button>
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="mt-14 pt-12 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Читайте также</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {related.map((r) => (
                    <article
                      key={r.id}
                      className="group cursor-pointer rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all p-5"
                      onClick={() => navigate(`/blog/${r.slug}`)}
                    >
                      <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full mb-3 inline-block">
                        {r.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {r.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{r.excerpt}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {r.reading_time} мин
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-14 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 overflow-hidden">
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-700 text-xs font-semibold mb-4">
                  🎓 Онлайн-курс теории DGT
                </div>
                <p className="text-slate-900 font-bold text-xl mb-2">Сдайте теорию с первого раза</p>
                <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                  Живые уроки с куратором, разбор всех вопросов DGT, чат поддержки и практика через SkilyApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://t.me/skilyapp_bot?start=course"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                  >
                    Записаться на курс →
                  </a>
                  <a
                    href="https://t.me/skilyapp_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-100 border border-slate-200 text-slate-900 font-semibold text-sm transition-colors"
                  >
                    Практиковать тесты бесплатно
                  </a>
                </div>
              </div>
            </div>
          </main>

          {/* ── Right Sidebar ─────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              {/* Meta card */}
              <div className="rounded-xl bg-slate-50 p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{post.reading_time} мин чтения</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{publishedDate}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Поделиться</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTwitter}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Twitter"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors",
                          copied
                            ? "border-green-500/40 bg-green-500/10 text-green-600"
                            : "border-slate-200 bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                        )}
                        title={copied ? "Скопировано!" : "Копировать ссылку"}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNativeShare}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Поделиться"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOC */}
              {headings.length > 0 && (
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Содержание</p>
                  <nav className="space-y-2">
                    {headings.map((h, i) => (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        className={cn(
                          "block text-sm transition-colors hover:text-slate-900 leading-snug",
                          h.level === 3
                            ? "ml-3.5 text-slate-400 hover:text-slate-700"
                            : "text-slate-600 font-medium"
                        )}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Mini CTA */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="text-slate-900 font-bold text-sm mb-1.5">Готовьтесь к DGT</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Полная база вопросов DGT, объяснения на русском, тренировки и дуэли в SkilyApp.
                </p>
                <a
                  href="https://t.me/skilyapp_bot?start=course"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Начать подготовку <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
