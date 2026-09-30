import { useState } from "react";
import { coverSrcSet } from "@/lib/covers";
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  ArrowRight,
  Newspaper,
  GraduationCap,
  Lightbulb,
  MapPin,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all",              label: "Все статьи",     icon: Newspaper    },
  { id: "Практика DGT",    label: "Практика DGT",   icon: GraduationCap },
  { id: "Истории сдачи",   label: "Истории сдачи",  icon: Users         },
  { id: "Подготовка к DGT",label: "Подготовка",     icon: Lightbulb     },
  { id: "Финансы",         label: "Финансы",         icon: MapPin        },
  { id: "Закон и Штрафы",  label: "Закон",           icon: BookOpen      },
  { id: "Полезно",         label: "Полезно",         icon: Newspaper     },
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = blogPosts.filter((p) => {
    const matchSearch =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const getCategoryCount = (catId: string) =>
    catId === "all" ? blogPosts.length : blogPosts.filter((p) => p.category === catId).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-10">

          {/* ── Left Sidebar ─────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Блог</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Инструкции и советы о правах в Испании
                </p>
              </div>

              {/* Categories */}
              <nav className="space-y-0.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count = getCategoryCount(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between gap-3",
                        isActive
                          ? "bg-blue-500/10 text-blue-700 border-l-2 border-blue-500"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                        <span>{cat.label}</span>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full tabular-nums",
                        isActive ? "bg-blue-500/15 text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* CTA mini */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-slate-900 font-semibold text-sm mb-1">Готовиться к DGT?</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  Тренируйте тесты с полной базой вопросов DGT в SkilyApp.
                </p>
                <a
                  href="https://t.me/skilyapp_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Попробовать бесплатно <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </aside>

          {/* ── Main ─────────────────────────────────────── */}
          <main className="lg:col-span-3 xl:col-span-4">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="search"
                placeholder="Поиск статей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-slate-50 transition-all"
              />
              <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
                ⌘K
              </kbd>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 font-semibold mb-1">Статьи не найдены</p>
                <p className="text-slate-400 text-sm">Попробуйте изменить запрос или категорию</p>
              </div>
            )}

            {/* Grid */}
            {filtered.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filtered.map((post, i) => (
                    <a
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 overflow-hidden"
                    >
                      {/* Cover */}
                      {post.cover_image ? (
                        <div className="h-44 overflow-hidden">
                          <img
                            src={post.cover_image}
                            srcSet={coverSrcSet(post.cover_image)}
                            sizes="(min-width: 768px) 440px, 100vw"
                            alt={post.title}
                            width={1600}
                            height={1000}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            // Первые две обложки — на первом экране (LCP), остальные лениво
                            loading={i < 2 ? "eager" : "lazy"}
                            fetchPriority={i === 0 ? "high" : "auto"}
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-blue-600/8 to-cyan-600/4 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-blue-500/20" />
                        </div>
                      )}

                      <div className="flex flex-col flex-1 p-6">
                        {/* Meta */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {post.reading_time} мин
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="font-bold text-slate-900 text-[17px] leading-snug mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-slate-500 text-[13px] leading-relaxed flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString("ru-RU", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <span className="flex items-center gap-1 text-[12px] text-slate-500 group-hover:text-blue-600 transition-colors font-medium">
                            Читать <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-12 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 p-8 text-center">
                  <p className="text-slate-900 font-bold text-xl mb-2">Готовы сдать теорию DGT?</p>
                  <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                    Присоединяйтесь к курсу с живыми уроками или тренируйтесь самостоятельно в SkilyApp.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="https://t.me/skilyapp_bot?start=course"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                    >
                      Записаться на курс →
                    </a>
                    <a
                      href="https://t.me/skilyapp_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100 border border-slate-200 text-slate-900 font-semibold text-sm transition-colors"
                    >
                      Тренировать тесты бесплатно
                    </a>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
