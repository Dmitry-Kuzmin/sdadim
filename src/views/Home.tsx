import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getPlans, type DbPlanPrices } from "@/components/ui/pricing-cards";
import { CourseChecklist } from "@/components/ui/course/CourseChecklist";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns";
import { useCrispChat } from "@/hooks/useCrispChat";
import { fetchPlanPrices, fetchStreams, spotsLeft, type StreamInfo } from "@/lib/course-data";
import { blogPosts } from "@/lib/blog-posts";
import { FAQ_CATEGORIES, FAQ_DATA } from "@/lib/home-faq";
import {
  ArrowRight,
  BookOpen,
  Car,
  Check,
  ChevronDown,
  FileText,
  Languages,
  MessageCircle,
  PlayCircle,
  Smartphone,
  Stethoscope,
  Timer,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Analytics } from "@/lib/posthog";

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */

const BOT_URL = "https://t.me/skilyapp_bot";

const HERO_FACTS = [
  { value: "2 месяца", label: "до экзамена" },
  { value: "16 уроков", label: "вживую, на русском" },
  { value: "9 из 10", label: "сдают с первого раза" },
];

const STEPS = [
  {
    icon: BookOpen,
    title: "Учите теорию",
    time: "≈ 2 месяца",
    desc: "Живые уроки 2 раза в неделю и тренажёр с базой вопросов DGT. Всё объясняем на русском.",
    ours: true,
  },
  {
    icon: Stethoscope,
    title: "Проходите медкомиссию",
    time: "≈ 30 минут",
    desc: "Psicotécnico в медцентре вашего города. Подскажем, куда идти и что взять.",
    ours: false,
  },
  {
    icon: FileText,
    title: "Сдаёте теорию в DGT",
    time: "30 минут",
    desc: "30 вопросов, можно ошибиться не больше 3 раз. Поможем записаться и оплатить пошлину.",
    ours: true,
  },
  {
    icon: Car,
    title: "Практика в автошколе",
    time: "от 1 урока",
    desc: "Вождение и экзамен в городе — в любой местной автошколе. Подскажем, как выбрать.",
    ours: false,
  },
];

const INCLUDED = [
  { icon: Video, title: "Живые уроки на русском", desc: "Преподаватель объясняет логику правил, а не заставляет зубрить ответы." },
  { icon: PlayCircle, title: "Записи всех занятий", desc: "Пропустили урок — посмотрите в любое время." },
  { icon: Smartphone, title: "Тренажёр Skilyapp", desc: "Вопросы DGT с объяснениями и пробный экзамен в телефоне." },
  { icon: Languages, title: "Испанский для водителя", desc: "Разбираем слова и формулировки, на которых ловит экзамен." },
  { icon: FileText, title: "Помощь с документами", desc: "Cita Previa, Tasa DGT, Psicotécnico — по шагам." },
  { icon: MessageCircle, title: "Куратор в Telegram", desc: "Отвечает на вопросы по учёбе и документам." },
];

// TODO: заменить на реальные отзывы (со скриншотами/согласием студентов)
const TESTIMONIALS: Testimonial[] = [
  { text: "Три раза подходила к экзамену с книжкой на испанском — не понимала ничего. Тут прошла за 5 недель и с первого раза.", name: "Ольга", role: "Барселона" },
  { text: "Работаю на стройке, времени нет вообще. Учился по 15–20 минут в обед со смартфона. Сдал. Куратор помог с бумагами в DGT.", name: "Виктор", role: "Мадрид" },
  { text: "Мне 54, боялась, что не потяну. Всё объяснено так просто, что страх ушёл. Сдала: 28 правильных из 30.", name: "Наталья", role: "Аликанте" },
  { text: "Студент, денег в обрез. Автошкола просила 280 € только за теорию. Здесь вышло заметно дешевле, и сдал с первого раза.", name: "Артём", role: "Валенсия" },
  { text: "Переехала с двумя детьми, муж в командировках. Без прав как без рук. Поддержка на русском — прям выдыхаешь.", name: "Марина", role: "Малага" },
  { text: "Украинские права здесь не обменяли, пришлось сдавать с нуля в 38. Думал, провалюсь. Сдал с первого раза.", name: "Олег", role: "Бильбао" },
  { text: "Испанский у меня так себе, но сдала на испанском — учила именно слова из вопросов, а не грамматику.", name: "Светлана", role: "Севилья" },
  { text: "Открываю свой бизнес, нужно ездить к клиентам. Прошёл курс параллельно с работой, без походов в автошколу на теорию.", name: "Дмитрий", role: "Мадрид" },
  { text: "Мне 22, сдала с первого раза. Главное — не пришлось платить автошколе за теорию. Всё ясно, быстро, без воды.", name: "Катя", role: "Барселона" },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(iso + "T00:00:00"));

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const trackConversion = () => {
  const w = window as any;
  if (w.gtag) w.gtag("event", "conversion", { send_to: "AW-18034090184/LGu7CMTx0pMcEMjBqZdD" });
};

/* ─────────────────────────────────────────────
   BUILDING BLOCKS
   ───────────────────────────────────────────── */

function SectionHead({ index, eyebrow, title, desc }: { index: string; eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-10 max-w-2xl md:mb-14">
      <p className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="tabular-nums text-blue-600">{index}</span>
        <span className="h-px w-6 bg-slate-300" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl text-balance">{title}</h2>
      {desc && <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg text-pretty">{desc}</p>}
    </div>
  );
}

/** Пример вопроса DGT — сразу показывает, чем мы занимаемся */
function ExamQuestionCard() {
  const [picked, setPicked] = useState<number | null>(null);
  const options = [
    "Los vehículos que ya circulan por la glorieta",
    "Los vehículos que quieren entrar en la glorieta",
    "El vehículo que llega por la derecha",
  ];
  const correct = 0;

  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
      {/* стопка «листов» за карточкой */}
      <div aria-hidden className="absolute inset-x-6 -bottom-3 top-3 rounded-3xl border border-slate-200 bg-white/70" />
      <div aria-hidden className="absolute inset-x-12 -bottom-6 top-6 rounded-3xl border border-slate-200 bg-white/40" />

      <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_32px_64px_-32px_rgba(15,23,42,0.25)] sm:p-7">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span className="tabular-nums">Вопрос 12 / 30</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 tabular-nums">
            <Timer className="h-3.5 w-3.5" /> 18:42
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[40%] rounded-full bg-slate-900" />
        </div>

        <p className="mt-6 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
          En una glorieta, ¿quién tiene prioridad de paso?
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <Languages className="h-4 w-4 shrink-0 text-blue-600" />
          На круговом движении — у кого приоритет?
        </p>

        <div className="mt-5 space-y-2">
          {options.map((opt, i) => {
            const isPicked = picked === i;
            const showCorrect = picked !== null && i === correct;
            const showWrong = isPicked && i !== correct;
            return (
              <button
                key={opt}
                onClick={() => setPicked(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors sm:px-4",
                  showCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : showWrong
                      ? "border-rose-300 bg-rose-50 text-rose-950"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                    showCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-slate-50 text-slate-500"
                  )}
                >
                  {showCorrect ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-[44px] text-sm leading-relaxed">
          {picked === null ? (
            <p className="text-slate-400">Попробуйте ответить ↑</p>
          ) : (
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">{picked === correct ? "Верно. " : "Не совсем. "}</span>
              Приоритет у тех, кто уже едет по кругу. На уроке разбираем, почему — и где тут ловушка.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-[15px] font-medium text-slate-900 sm:text-base">{q}</span>
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 transition-transform", open && "rotate-180")}>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </span>
      </button>
      {open && <p className="pb-6 pr-4 text-[15px] leading-relaxed text-slate-600 whitespace-pre-line sm:pr-12">{a}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */

const CourseLanding = () => {
  const [dbPrices, setDbPrices] = useState<DbPlanPrices | undefined>(undefined);
  const [streams, setStreams] = useState<StreamInfo[]>([]);
  const [faqTab, setFaqTab] = useState<keyof typeof FAQ_CATEGORIES>("process");
  const [recommended, setRecommended] = useState<string | null>(null);
  const [quizCode, setQuizCode] = useState<string | null>(null);
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  // Цены и потоки из БД — единый источник правды с ботом
  useEffect(() => {
    fetchPlanPrices().then((p) => p && setDbPrices(p));
    fetchStreams(3).then(setStreams);
  }, []);

  useCrispChat();

  useEffect(() => {
    Analytics.landingViewed();
  }, []);

  // Мобильная CTA-панель: видна после hero и прячется, пока на экране тарифы
  useEffect(() => {
    const vis = { hero: true, pricing: false };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === heroRef.current) vis.hero = e.isIntersecting;
        if (e.target === pricingRef.current) vis.pricing = e.isIntersecting;
      });
      setShowBar(!vis.hero && !vis.pricing);
    });
    if (heroRef.current) io.observe(heroRef.current);
    if (pricingRef.current) io.observe(pricingRef.current);
    return () => io.disconnect();
  }, []);

  const handleRecommend = useCallback((planId: string, code: string) => {
    setRecommended(planId);
    setQuizCode(code);
  }, []);
  // Прошёл калькулятор — ответы уходят в бот с любой кнопкой тарифа
  const withQuiz = (param: string) => (quizCode ? `${param}_${quizCode}` : param);

  const plans = getPlans(dbPrices);
  const minPrice = Math.min(...plans.map((p) => p.price));
  const openStreams = streams.filter((s) => spotsLeft(s) > 0);
  const next = openStreams[0] ?? null;
  const nextLine = next ? `Старт ${formatDate(next.start_date)} · осталось ${spotsLeft(next)} мест` : null;

  const goPricing = (location: string) => {
    Analytics.ctaClicked(location);
    scrollTo("pricing");
  };

  return (
    <div className="bg-white text-slate-900">
      <main>
        {/* ─── Hero ─── */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,#000_20%,transparent_75%)]" />
          <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[-10%] h-[520px] w-[620px] rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
            <div>
              {nextLine && (
                <button
                  onClick={() => goPricing("hero_badge")}
                  className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-3 text-[13px] font-medium text-slate-700 shadow-sm backdrop-blur transition-colors hover:border-slate-300"
                >
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">Поток {next!.number}</span>
                  {nextLine}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              )}
              <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-6xl lg:text-[4rem] text-balance">
                Теория на права в Испании. <span className="text-slate-400">На русском.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 text-pretty">
                Онлайн-курс подготовки к экзамену DGT: объясняем правила простым языком, учим нужным испанским словам
                и помогаем с документами.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => goPricing("hero")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-8px_rgba(37,99,235,0.6)] transition-colors hover:bg-blue-700"
                >
                  Выбрать тариф <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollTo("calc")}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  Рассчитать стоимость прав
                </button>
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
            <ExamQuestionCard />
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section id="how" className="scroll-mt-16 border-t border-slate-100 bg-slate-50/60 py-20 md:py-28">
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

        {/* ─── What's included ─── */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead index="02" eyebrow="Что входит" title={"Всё для экзамена\u00a0— в одном месте"} />
            <div className="grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((f) => (
                <div
                  key={f.title}
                  className="bg-white p-6 sm:p-8"
                >
                  <f.icon className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
                  <h3 className="mt-5 font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Calculator ─── */}
        <section id="calc" className="scroll-mt-16 border-t border-slate-100 bg-slate-50/60 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead
              index="03"
              eyebrow="Подбор тарифа"
              title="Сколько будут стоить права именно вам"
              desc="Пять вопросов — и вы увидите полный бюджет: курс, пошлины, медкомиссию и практику."
            />
            <CourseChecklist plans={plans} onRecommend={handleRecommend} botUrl={BOT_URL} />
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section id="pricing" ref={pricingRef} className="scroll-mt-16 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead
              index="04"
              eyebrow="Цены"
              title={"Один курс\u00a0— три уровня поддержки"}
              desc="Во всех тарифах одинаковые 16 живых уроков. Разница — в том, сколько мы делаем за вас."
            />

            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => {
                const dark = plan.highlight;
                const isRec = recommended === plan.id;
                return (
                  <div
                    key={plan.id}
                    id={`plan-${plan.id}`}
                    className={cn(
                      "relative flex scroll-mt-24 flex-col rounded-3xl p-7 transition-shadow sm:p-8",
                      dark ? "bg-night text-white ring-1 ring-white/5 shadow-[0_32px_64px_-32px_rgba(15,23,42,0.6)]" : "border border-slate-200 bg-white",
                      isRec && "ring-2 ring-blue-600 ring-offset-4"
                    )}
                  >
                    <div className={cn("mb-4 h-6 items-center", isRec || dark ? "flex" : "hidden lg:flex")}>
                      {isRec ? (
                        <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">Подходит вам</span>
                      ) : dark ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">Чаще выбирают</span>
                      ) : null}
                    </div>
                    <h3 className={cn("text-xl font-semibold tracking-tight", dark ? "text-white" : "text-slate-900")}>{plan.name}</h3>
                    <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-slate-500")}>{plan.subtitle}</p>
                    <div className="mt-7 flex items-baseline gap-2">
                      <span className="text-5xl font-semibold tracking-tight tabular-nums">€{plan.price}</span>
                      {plan.oldPrice > plan.price && (
                        <span className={cn("tabular-nums line-through", dark ? "text-white/40" : "text-slate-400")}>€{plan.oldPrice}</span>
                      )}
                    </div>
                    <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-slate-500")}>разовый платёж</p>

                    <ul className={cn("mt-7 flex-1 space-y-3 border-t pt-7", dark ? "border-white/10" : "border-slate-100")}>
                      {plan.features.filter((f) => f.included).map((f) => (
                        <li key={f.text} className={cn("flex gap-3 text-[15px] leading-snug", dark ? "text-white/85" : "text-slate-700")}>
                          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", dark ? "text-[#60a5fa]" : "text-blue-600")} strokeWidth={2.5} />
                          {f.text}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`${BOT_URL}?start=${withQuiz(plan.botParam!)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => { Analytics.ctaClicked(`pricing_${plan.id}`); trackConversion(); }}
                      className={cn(
                        "mt-8 flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-colors",
                        dark || isRec
                          ? "bg-blue-600 text-white hover:bg-blue-500"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      )}
                    >
                      {plan.cta} <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Ближайшие старты: информативно, дата выбирается при оформлении в боте */}
            {openStreams.length > 0 && (
              <div className="mt-6 rounded-3xl border border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Ближайшие старты</p>
                    <p className="mt-1 text-sm text-slate-500">Дату выберете при оформлении. Цена фиксируется в момент записи.</p>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-3 md:flex md:gap-3">
                    {openStreams.map((s, i) => (
                      <li
                        key={s.id ?? s.number}
                        className={cn(
                          "flex items-center justify-between gap-5 rounded-2xl px-4 py-3 md:min-w-[170px] md:flex-col md:items-start md:gap-1",
                          i === 0 ? "bg-blue-50 ring-1 ring-blue-200" : "bg-slate-50"
                        )}
                      >
                        <span className="font-semibold text-slate-900">{formatDate(s.start_date)}</span>
                        <span className={cn("text-sm", spotsLeft(s) <= 3 ? "font-medium text-amber-700" : "text-slate-500")}>
                          {spotsLeft(s)} из {s.spots_total} мест
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>Оплата и запись — через Telegram-бот. Без скрытых платежей.</p>
              <a
                href={`${BOT_URL}?start=${withQuiz("course_qualify")}`}
                target="_blank"
                rel="noreferrer"
                onClick={trackConversion}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
              >
                Нужны индивидуальные занятия? <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="border-t border-slate-100 bg-slate-50/60 py-20 md:py-28">
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

        {/* ─── FAQ ─── */}
        <section id="faq" className="scroll-mt-16 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 [&>*]:min-w-0">
            <div>
              <SectionHead index="06" eyebrow="Вопросы" title="Частые вопросы" />
              <div className="-mx-4 -mt-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide lg:mx-0 lg:mt-0 lg:flex-col lg:items-start lg:overflow-visible lg:px-0">
                {(Object.keys(FAQ_CATEGORIES) as (keyof typeof FAQ_CATEGORIES)[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFaqTab(key)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors lg:rounded-lg lg:px-3",
                      faqTab === key ? "bg-inverse text-on-inverse" : "border border-slate-200 text-slate-600 hover:text-slate-900 lg:border-transparent"
                    )}
                  >
                    {FAQ_CATEGORIES[key]}
                  </button>
                ))}
              </div>
            </div>
            <div key={faqTab} className="border-t border-slate-200 lg:mt-2">
              {FAQ_DATA[faqTab].map((item) => (
                <FaqItem key={item.question} q={item.question} a={item.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Blog ─── */}
        <section className="border-t border-slate-100 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-6">
              <SectionHead index="07" eyebrow="Блог" title="Полезно почитать" />
              <Link to="/blog" className="mb-14 hidden shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:inline-flex">
                Все статьи <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                  {post.cover_image && (
                    <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/60">
                      <img
                        src={post.cover_image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <p className="mt-4 text-xs font-medium text-slate-500">{post.category} · {post.reading_time} мин</p>
                  <h3 className="mt-2 font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">{post.title}</h3>
                </Link>
              ))}
            </div>
            <Link to="/blog" className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-blue-600 sm:hidden">
              Все статьи <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="px-4 pb-24 sm:px-6 md:pb-28">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-night px-6 py-16 text-center sm:px-12 md:py-24">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/40 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-tight text-white md:text-5xl text-balance">
              Права — через два месяца
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/60">
              {nextLine ? `${nextLine}.` : "Новый поток стартует каждый месяц."} Есть вопросы — ответим в Telegram.
            </p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => goPricing("final")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffffff] px-6 py-3.5 text-base font-semibold text-[#0f172a] transition-colors hover:bg-[#e2e8f0]"
              >
                Выбрать тариф <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={`${BOT_URL}?start=${withQuiz("course_qualify")}`}
                target="_blank"
                rel="noreferrer"
                onClick={trackConversion}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Задать вопрос
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Mobile sticky CTA ─── */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden",
          showBar ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">от €{minPrice}</p>
            {next && <p className="truncate text-xs text-slate-500">старт {formatDate(next.start_date)}</p>}
          </div>
          <button
            onClick={() => goPricing("sticky_bar")}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Выбрать тариф
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseLanding;
