/**
 * Article UI Kit — Sdadim.eu
 *
 * Все компоненты для оформления статей. Импортируй нужные поштучно:
 *   import { ArticleAccordion, ArticleCallout, ArticleBanner } from "@/components/ui/article"
 */

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Info,
  Lightbulb,
  Zap,
  CheckCircle2,
  XCircle,
  Quote,
  Play,
  Users,
  Calendar,
  ExternalLink,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchStreams, nextOpenStream, spotsLeft, type StreamInfo } from "@/lib/course-data";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ACCORDION (аккордеон / спойлер)
// ─────────────────────────────────────────────────────────────────────────────

interface AccordionItem {
  question: string;
  answer: string;
}

interface ArticleAccordionProps {
  items: AccordionItem[];
  title?: string;
}

export function ArticleAccordion({ items, title }: ArticleAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="my-8 not-prose">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{title}</p>
      )}
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 overflow-hidden">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-900 leading-snug">{item.question}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300",
                  open === i && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                open === i ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CALLOUT (врезка / выделение)
// ─────────────────────────────────────────────────────────────────────────────

const calloutConfig = {
  info:    { icon: Info,         bg: "bg-blue-500/8",   border: "border-blue-500/20",   text: "text-blue-700",   label: "Примечание" },
  tip:     { icon: Lightbulb,    bg: "bg-emerald-500/8",border: "border-emerald-500/20",text: "text-emerald-700",label: "Совет" },
  warning: { icon: AlertCircle,  bg: "bg-amber-500/8",  border: "border-amber-500/20",  text: "text-amber-700",  label: "Важно" },
  danger:  { icon: XCircle,      bg: "bg-red-500/8",    border: "border-red-500/20",    text: "text-red-700",    label: "Внимание" },
  success: { icon: CheckCircle2, bg: "bg-emerald-500/8",border: "border-emerald-500/20",text: "text-emerald-700",label: "Хорошо знать" },
};

interface ArticleCalloutProps {
  type?: keyof typeof calloutConfig;
  title?: string;
  children: React.ReactNode;
}

export function ArticleCallout({ type = "info", title, children }: ArticleCalloutProps) {
  const { icon: Icon, bg, border, text, label } = calloutConfig[type];
  return (
    <div className={cn("my-8 not-prose rounded-2xl border p-5", bg, border)}>
      <div className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2", text)}>
        <Icon className="w-3.5 h-3.5" />
        {title ?? label}
      </div>
      <div className="text-[15px] text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUOTE (цитата)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleQuoteProps {
  text: string;
  author?: string;
  role?: string;
}

export function ArticleQuote({ text, author, role }: ArticleQuoteProps) {
  return (
    <blockquote className="my-8 not-prose relative">
      <div className="pl-5 border-l-2 border-blue-500">
        <Quote className="w-5 h-5 text-blue-500/40 mb-2" />
        <p className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">{text}</p>
        {author && (
          <footer className="mt-3 flex items-center gap-2">
            <div className="w-5 h-[1px] bg-slate-300" />
            <span className="text-sm text-slate-500">
              {author}
              {role && <span className="text-slate-400"> · {role}</span>}
            </span>
          </footer>
        )}
      </div>
    </blockquote>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TABLE (красивая таблица)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  caption?: string;
}

export function ArticleTable({ headers, rows, caption }: ArticleTableProps) {
  return (
    <div className="my-8 not-prose overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50 transition-colors">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-5 py-3.5 text-slate-700 leading-snug",
                    ci === 0 && "font-medium text-slate-900"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && (
        <p className="text-center text-xs text-slate-400 py-3 border-t border-slate-200">{caption}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TABS (табы для контента)
// ─────────────────────────────────────────────────────────────────────────────

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface ArticleTabsProps {
  tabs: TabItem[];
}

export function ArticleTabs({ tabs }: ArticleTabsProps) {
  const [active, setActive] = useState(0);
  return (
    <div className="my-8 not-prose rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-[1px]",
              active === i
                ? "text-slate-900 border-blue-500"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        {tabs[active].content}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SPOILER (спойлер одиночный)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleSpoilerProps {
  label: string;
  children: React.ReactNode;
}

export function ArticleSpoiler({ label, children }: ArticleSpoilerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-6 not-prose rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
      >
        <ChevronRight
          className={cn("w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200", open && "rotate-90")}
        />
        {label}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-200 pt-4 text-sm text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. LIST (стильный список)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleListProps {
  items: string[];
  type?: "check" | "cross" | "arrow" | "number";
  title?: string;
}

const listIcons = {
  check: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
  cross: <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
  arrow: <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
};

export function ArticleList({ items, type = "check", title }: ArticleListProps) {
  return (
    <div className="my-6 not-prose">
      {title && <p className="text-sm font-bold text-slate-600 mb-3">{title}</p>}
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-snug">
            {type === "number" ? (
              <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
            ) : (
              listIcons[type]
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CARD GRID (карточки)
// ─────────────────────────────────────────────────────────────────────────────

interface Card {
  icon?: string;
  title: string;
  description: string;
  badge?: string;
}

interface ArticleCardGridProps {
  cards: Card[];
  cols?: 2 | 3;
}

export function ArticleCardGrid({ cards, cols = 2 }: ArticleCardGridProps) {
  return (
    <div
      className={cn(
        "my-8 not-prose grid gap-4",
        cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
      )}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl bg-slate-50 p-5 hover:bg-slate-100 transition-all"
        >
          {card.icon && <div className="text-2xl mb-3">{card.icon}</div>}
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-bold text-slate-900 text-sm leading-snug">{card.title}</p>
            {card.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
                {card.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DIVIDER (разделитель)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleDividerProps {
  label?: string;
}

export function ArticleDivider({ label }: ArticleDividerProps) {
  if (!label) {
    return <div className="my-10 not-prose border-t border-slate-200" />;
  }
  return (
    <div className="my-10 not-prose flex items-center gap-4">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. IMAGE (изображение с подписью)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleImageProps {
  src: string;
  alt: string;
  caption?: string;
  fullWidth?: boolean;
}

export function ArticleImage({ src, alt, caption, fullWidth = false }: ArticleImageProps) {
  return (
    <figure className={cn("my-8 not-prose", !fullWidth && "max-w-2xl mx-auto")}>
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <img src={src} alt={alt} className="w-full object-cover" loading="lazy" />
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-slate-400 mt-3 leading-relaxed">{caption}</figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. VIDEO EMBED (YouTube / iframe)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleVideoProps {
  youtubeId?: string;
  src?: string;
  caption?: string;
}

export function ArticleVideo({ youtubeId, src, caption }: ArticleVideoProps) {
  const [playing, setPlaying] = useState(false);
  const url = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
    : src;

  if (!url) return null;

  return (
    <figure className="my-8 not-prose">
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100" style={{ paddingBottom: "56.25%" }}>
        {youtubeId && !playing ? (
          <div className="absolute inset-0">
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="Video preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setPlaying(true)}
                className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
                aria-label="Воспроизвести видео"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            title={caption ?? "Video"}
          />
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-slate-400 mt-3">{caption}</figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. STAT ROW (строка статистики)
// ─────────────────────────────────────────────────────────────────────────────

interface Stat {
  value: string;
  label: string;
  note?: string;
}

interface ArticleStatsProps {
  stats: Stat[];
}

export function ArticleStats({ stats }: ArticleStatsProps) {
  return (
    <div className="my-8 not-prose grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="rounded-2xl bg-slate-50 p-5 text-center">
          <div className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-1">{stat.value}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</div>
          {stat.note && <div className="text-[11px] text-slate-400 mt-1">{stat.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. LINK CARD (карточка-ссылка)
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleLinkCardProps {
  href: string;
  title: string;
  description?: string;
  external?: boolean;
}

export function ArticleLinkCard({ href, title, description, external }: ArticleLinkCardProps) {
  const isExternal = external ?? href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="my-6 not-prose flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all group no-underline block"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{description}</p>}
      </div>
      {isExternal ? (
        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
      ) : (
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
      )}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. BANNER — Умный рекламный баннер с датами и местами
// ─────────────────────────────────────────────────────────────────────────────

interface ArticleBannerProps {
  /** Минимальная цена (fallback, если не удалось загрузить из Supabase) */
  basePrice?: number;
  variant?: "default" | "compact" | "inline";
}

export function ArticleBanner({ basePrice = 199, variant = "default" }: ArticleBannerProps) {
  const [stream, setStream] = useState<StreamInfo | null>(null);

  useEffect(() => {
    fetchStreams(3).then((list) => setStream(nextOpenStream(list)));
  }, []);

  const seatsLeft = stream ? spotsLeft(stream) : null;
  const startDate = stream
    ? new Date(stream.start_date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : null;

  if (variant === "compact") {
    return (
      <div className="my-6 not-prose rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-cyan-600/5 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-bold text-slate-900 text-sm">Записаться на курс теории DGT</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {startDate && (
              <span className="text-[11px] text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Старт {startDate}
              </span>
            )}
            {seatsLeft !== null && seatsLeft <= 5 && (
              <span className="text-[11px] text-amber-600 flex items-center gap-1">
                <Users className="w-3 h-3" /> Осталось {seatsLeft} мест
              </span>
            )}
          </div>
        </div>
        <a
          href="https://t.me/skilyapp_bot?start=course"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shrink-0 no-underline"
        >
          Занять место <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="my-4 not-prose inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/8 text-sm">
        <Zap className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-slate-700">
          Курс теории DGT
          {startDate && <> · Старт <strong className="text-slate-900">{startDate}</strong></>}
          {seatsLeft !== null && seatsLeft <= 8 && (
            <span className="text-amber-600"> · осталось {seatsLeft} мест</span>
          )}
        </span>
        <a
          href="https://t.me/skilyapp_bot?start=course"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 font-semibold no-underline whitespace-nowrap"
        >
          Записаться →
        </a>
      </div>
    );
  }

  // default — большой баннер
  return (
    <div className="my-10 not-prose relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-50 to-white overflow-hidden shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)]">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-7 md:p-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-700 text-xs font-bold mb-5">
          🎓 Онлайн-курс теории DGT
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
              Сдайте теорию с первого раза
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-5 max-w-md">
              Живые уроки с куратором, разбор всех вопросов DGT, документы под ключ и поддержка в чате 24/7.
            </p>

            {/* Stream meta */}
            <div className="flex flex-wrap items-center gap-4">
              {seatsLeft !== null ? (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border",
                  seatsLeft <= 3
                    ? "text-red-700 bg-red-500/10 border-red-500/20"
                    : seatsLeft <= 6
                    ? "text-amber-700 bg-amber-500/10 border-amber-500/20"
                    : "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
                )}>
                  <Users className="w-3.5 h-3.5" />
                  {seatsLeft <= 3
                    ? `Последние ${seatsLeft} места!`
                    : `Свободно ${seatsLeft} мест`}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border text-slate-600 border-slate-200">
                  <Users className="w-3.5 h-3.5" />
                  Узнать о местах
                </div>
              )}

              {startDate && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Старт <strong className="text-slate-900 ml-0.5">{startDate}</strong>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                от <strong className="text-slate-900 ml-0.5">€{basePrice}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0">
            <a
              href="https://t.me/skilyapp_bot?start=course"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] no-underline"
            >
              Занять место →
            </a>
            <a
              href="https://t.me/skilyapp_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors no-underline"
            >
              Бесплатная практика
            </a>
          </div>
        </div>

        {/* 9/10 trust line */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs text-slate-500">
            9 из 10 наших студентов сдают теорию DGT с первого раза
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. COMPARISON TABLE (сравнительная таблица с ✓ ✗)
// ─────────────────────────────────────────────────────────────────────────────

interface ComparisonRow {
  feature: string;
  a: boolean | string;
  b: boolean | string;
}

interface ArticleComparisonProps {
  headerA: string;
  headerB: string;
  rows: ComparisonRow[];
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600/50 mx-auto" />
    );
  }
  return <span className="text-slate-700 text-sm">{value}</span>;
}

export function ArticleComparison({ headerA, headerB, rows }: ArticleComparisonProps) {
  return (
    <div className="my-8 not-prose overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[400px] text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 w-1/2">
              Параметр
            </th>
            <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
              {headerA}
            </th>
            <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-500/5">
              {headerB}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3.5 text-slate-600 font-medium">{row.feature}</td>
              <td className="px-5 py-3.5 text-center">
                <ComparisonCell value={row.a} />
              </td>
              <td className="px-5 py-3.5 text-center bg-blue-500/[0.03]">
                <ComparisonCell value={row.b} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
