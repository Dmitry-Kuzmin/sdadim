/**
 * Статичные секции главной: рендерятся в HTML при сборке, JS на клиент не уходит.
 * Интерактив — в Islands.tsx; острова вставляются через слоты (badge, card, nextStart, actions).
 */
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns";
import { blogPosts } from "@/lib/blog-posts";
import { cn } from "@/lib/utils";
import { HERO_FACTS, INCLUDED, STEPS, TESTIMONIALS } from "./content";
import { botLink } from "./links";
import { SectionHead } from "./SectionHead";

export function Hero({ badge, card }: { badge?: ReactNode; card?: ReactNode }) {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,#000_20%,transparent_75%)]" />
      <div aria-hidden className="pointer-events-none absolute -top-16 right-[-10%] h-[520px] w-[620px] rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div>
          {/* Место под плашку потока занято заранее — без сдвига вёрстки, когда придут данные */}
          <div className="mb-7 min-h-[32px]">{badge}</div>
          <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-6xl lg:text-[4rem] text-balance">
            Теория на права в Испании. <span className="text-slate-400">На русском.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 text-pretty">
            Онлайн-курс подготовки к экзамену DGT: объясняем правила простым языком, учим нужным испанским словам
            и помогаем с документами.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-8px_rgba(37,99,235,0.6)] transition-colors hover:bg-blue-700"
            >
              Выбрать тариф <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#calc"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Рассчитать стоимость прав
            </a>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-7 sm:gap-6">
            {HERO_FACTS.map((f) => (
              <div key={f.value}>
                <dt className="whitespace-nowrap text-lg font-semibold tracking-tight text-slate-900 tabular-nums sm:text-2xl">{f.value}</dt>
                <dd className="mt-1 text-[13px] leading-snug text-slate-500 sm:text-sm">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        {card}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="cv-auto scroll-mt-16 border-t border-slate-100 bg-slate-50/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          index="01"
          eyebrow="Как проходит"
          title="Четыре шага до испанских прав"
          desc="Мы готовим к теории и ведём по документам. Практику вы проходите в местной автошколе."
        />
        <ol className="relative grid gap-0 lg:grid-cols-4 lg:gap-4">
          {/* линия-таймлайн: вертикальная на мобиле, горизонтальная на десктопе */}
          <div aria-hidden className="absolute bottom-8 left-[19px] top-8 w-px bg-slate-200 lg:hidden" />
          <div aria-hidden className="absolute left-8 right-8 top-[19px] hidden h-px bg-slate-200 lg:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 pb-8 last:pb-0 lg:block lg:pb-0">
              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums",
                  s.ours ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-500"
                )}
              >
                {i + 1}
              </span>
              <div className="lg:mt-6 lg:pr-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-[17px] font-semibold text-slate-900">{s.title}</h3>
                  {s.ours && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">с нами</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-400">{s.time}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Included() {
  return (
    <section className="cv-auto py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead index="02" eyebrow="Что входит" title={"Всё для экзамена — в одном месте"} />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((f) => (
            <div key={f.title} className="bg-white p-6 sm:p-8">
              <f.icon className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
              <h3 className="mt-5 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="cv-auto border-t border-slate-100 bg-slate-50/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          index="05"
          eyebrow="Отзывы"
          title="Уже сдали с нами"
          desc="Барселона, Мадрид, Малага, Бильбао — разный возраст и уровень испанского."
        />
        <div className="grid max-h-[640px] grid-cols-1 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] md:grid-cols-2 lg:grid-cols-3">
          <TestimonialsColumn testimonials={TESTIMONIALS.slice(0, 3)} duration={28} />
          <TestimonialsColumn testimonials={TESTIMONIALS.slice(3, 6)} duration={34} className="hidden md:block" />
          <TestimonialsColumn testimonials={TESTIMONIALS.slice(6, 9)} duration={24} className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

export function Blog() {
  return (
    <section className="cv-auto border-t border-slate-100 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <SectionHead index="07" eyebrow="Блог" title="Полезно почитать" />
          <a href="/blog" className="mb-14 hidden shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:inline-flex">
            Все статьи <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <a key={post.slug} href={`/blog/${post.slug}`} className="group">
              {post.cover_image && (
                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/60">
                  <img
                    src={post.cover_image}
                    alt=""
                    width={1600}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <p className="mt-4 text-xs font-medium text-slate-500">{post.category} · {post.reading_time} мин</p>
              <h3 className="mt-2 font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">{post.title}</h3>
            </a>
          ))}
        </div>
        <a href="/blog" className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-blue-600 sm:hidden">
          Все статьи <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

/** Дата старта и код квиза в ссылке подставляются скриптом страницы (index.astro) */
export function FinalCta() {
  return (
    <section className="cv-auto px-4 pb-24 sm:px-6 md:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-night px-6 py-16 text-center sm:px-12 md:py-24">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/40 blur-3xl" />
        <h2 className="relative text-3xl font-semibold tracking-tight text-white md:text-5xl text-balance">Права — через два месяца</h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/60">
          <span data-next-start>Новый поток стартует каждый месяц.</span> Есть вопросы — ответим в Telegram.
        </p>
        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffffff] px-6 py-3.5 text-base font-semibold text-[#0f172a] transition-colors hover:bg-[#e2e8f0]"
          >
            Выбрать тариф <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={botLink("course_qualify", null)}
            data-bot-param="course_qualify"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Задать вопрос
          </a>
        </div>
      </div>
    </section>
  );
}
