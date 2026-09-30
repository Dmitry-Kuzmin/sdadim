import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/components/ui/pricing-cards";
import { MARKET, TASA_DGT, tasasNeeded } from "@/lib/license-costs";

/* ─────────────────────────────────────────────
   Подбор тарифа + калькулятор полной стоимости прав
   ───────────────────────────────────────────── */

type PlanId = "theory" | "pro" | "vip";

interface Choice {
  label: string;
  hint?: string;
  risk: number;
  flag?: "tourist" | "eu";
  lessons?: "none" | "few" | "many";
}

interface Question {
  id: string;
  title: string;
  note?: string;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    id: "residence",
    title: "Какой у вас статус в Испании?",
    note: "DGT допускает к экзамену только с ВНЖ или долгосрочной визой",
    choices: [
      { label: "ВНЖ (TIE)", risk: 0 },
      { label: "Студенческая виза", hint: "от 6 месяцев", risk: 0 },
      { label: "Международная защита", hint: "tarjeta roja", risk: 0 },
      { label: "Документы в процессе", risk: 1 },
      { label: "Пока туристическая виза", risk: 1, flag: "tourist" },
    ],
  },
  {
    id: "license",
    title: "Есть ли у вас водительские права?",
    choices: [
      { label: "Нет, сдаю с нуля", risk: 0 },
      { label: "Есть, не из ЕС", hint: "Россия, Беларусь, Казахстан…", risk: 0 },
      { label: "Есть права страны ЕС", hint: "их не нужно пересдавать", risk: 0, flag: "eu" },
    ],
  },
  {
    id: "spanish",
    title: "Как у вас с испанским?",
    note: "Экзамен проходит на испанском, словари запрещены",
    choices: [
      { label: "Почти не знаю", hint: "A0–A1", risk: 2 },
      { label: "Базовый", hint: "A2–B1", risk: 1 },
      { label: "Свободно читаю", hint: "B2 и выше", risk: 0 },
    ],
  },
  {
    id: "rules",
    title: "Знакомы с испанскими ПДД?",
    note: "Приоритеты на кольце, Carril VAO, вопросы с двойным отрицанием",
    choices: [
      { label: "Да, изучал(а)", risk: 0 },
      { label: "Частично", risk: 1 },
      { label: "Нет, знаю только свои", risk: 2 },
    ],
  },
  {
    id: "lessons",
    title: "Сколько уроков вождения понадобится?",
    note: "Практику мы не проводим — учтём её только в общем бюджете",
    choices: [
      { label: "Уже умею водить", hint: "≈ 2 урока", risk: 0, lessons: "none" },
      { label: "Немного практики", hint: "≈ 8 уроков", risk: 0, lessons: "few" },
      { label: "Учусь с нуля", hint: "≈ 20 уроков", risk: 0, lessons: "many" },
    ],
  },
];

const REASONS: Record<PlanId, string> = {
  vip: "Испанский — главный барьер на экзамене. В VIP есть мини-курс языка для водителей и личное ведение до записи в DGT.",
  pro: "Есть пара пробелов — куратор поможет их закрыть и проведёт через документы.",
  theory: "Хорошая база и испанский. Живых уроков и тренажёра будет достаточно.",
};

function recommend(risk: number, spanishRisk: number): PlanId {
  if (spanishRisk === 2 || risk >= 5) return "vip";
  if (risk >= 2) return "pro";
  return "theory";
}

/* Оценочные цифры — средние по рынку, не оферта. Формулы и цены — @/lib/license-costs (общие со статьёй и migran.es) */
const LESSONS: Record<NonNullable<Choice["lessons"]>, number> = { none: 2, few: 8, many: 20 };

function costRows(ourPrice: number, spanishRisk: number, risk: number, lessons: Choice["lessons"]) {
  // С какой попытки обычно сдают теорию без подготовки при таком профиле; с курсом — с первой
  const theoryTryAlone = risk >= 5 ? 3 : risk >= 2 ? 2 : 1;
  const tasasAlone = tasasNeeded(theoryTryAlone, 1);
  const rows = [
    { label: "Подготовка к теории", alone: MARKET.schoolTheory, us: ourPrice, note: "автошкола" },
    ...(spanishRisk === 2 ? [{ label: "Курс испанского", alone: MARKET.spanishCourse, us: 0, note: "входит в VIP" }] : []),
    {
      label: "Пошлина DGT",
      alone: Math.round(TASA_DGT * tasasAlone),
      us: Math.round(TASA_DGT),
      note: theoryTryAlone > 1 ? `без подготовки теория ≈ с ${theoryTryAlone}-й попытки` : undefined,
    },
    { label: "Psicotécnico", alone: MARKET.medical, us: MARKET.medical },
  ];
  const lessonCost = LESSONS[lessons ?? "none"] * MARKET.lesson;
  const practice = [
    { label: "Запись в автошколу", alone: MARKET.matricula, us: MARKET.matricula },
    { label: "Уроки вождения", alone: lessonCost, us: lessonCost },
    { label: "Экзамен по вождению", alone: MARKET.examPresentation, us: MARKET.examPresentation },
  ];
  const sum = (r: { alone: number; us: number }[], k: "alone" | "us") => r.reduce((a, x) => a + x[k], 0);
  return {
    rows,
    practice,
    alone: sum(rows, "alone") + sum(practice, "alone"),
    us: sum(rows, "us") + sum(practice, "us"),
  };
}

function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 450, 1);
      const v = Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3)));
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">€{shown}</span>;
}

interface Props {
  plans: (Plan & { paymentLink?: string })[];
  onRecommend: (planId: PlanId, quizCode: string) => void;
  botUrl: string;
}

/**
 * Ответы квиза для бота: "c" + индекс ответа на каждый вопрос (9 — нет ответа).
 * Бот (skilyapp/telegram-bot) разбирает `buy_pro_c01122` и показывает профиль куратору.
 * Порядок вопросов и ответов менять синхронно с QUIZ_LABELS в боте.
 */
function encodeAnswers(answers: Record<string, Choice>): string {
  return "c" + QUESTIONS.map((q) => {
    const i = answers[q.id] ? q.choices.findIndex((c) => c.label === answers[q.id].label) : -1;
    return i < 0 ? "9" : String(i);
  }).join("");
}

export function CourseChecklist({ plans, onRecommend, botUrl }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const risk = Object.values(answers).reduce((a, c) => a + c.risk, 0);
  const spanishRisk = answers.spanish?.risk ?? 0;
  const isTourist = answers.residence?.flag === "tourist";
  const isEu = answers.license?.flag === "eu";

  const planId = recommend(risk, spanishRisk);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const cost = costRows(plan.price, spanishRisk, risk, answers.lessons?.lessons ?? "none");
  const started = Object.keys(answers).length > 0;
  const quizCode = encodeAnswers(answers);

  useEffect(() => {
    if (done && !isEu) onRecommend(planId, quizCode);
  }, [done, isEu, planId, quizCode, onRecommend]);

  const pick = (c: Choice) => {
    setAnswers((a) => ({ ...a, [q.id]: c }));
    setStep((s) => s + 1);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.18)]">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* ── Вопросы ── */}
        <div className="p-6 sm:p-10">
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition-colors hover:text-slate-900 disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" /> Назад
            </button>
            <span className="tabular-nums text-slate-400">
              {done ? "Готово" : `${step + 1} из ${QUESTIONS.length}`}
            </span>
          </div>
          <div className="mt-4 flex gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={cn("h-1 flex-1 rounded-full transition-colors duration-300", i < step ? "bg-blue-600" : "bg-slate-100")}
              />
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {!done ? (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl text-balance">{q.title}</h3>
                {q.note && <p className="mt-2 text-sm leading-relaxed text-slate-500">{q.note}</p>}
                <div className="mt-6 grid gap-2">
                  {q.choices.map((c) => {
                    const selected = answers[q.id]?.label === c.label;
                    return (
                      <button
                        key={c.label}
                        onClick={() => pick(c)}
                        className={cn(
                          "group flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-all",
                          selected
                            ? "border-blue-600 bg-blue-50/60"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
                        )}
                      >
                        <span>
                          <span className="block text-[15px] font-medium text-slate-900">{c.label}</span>
                          {c.hint && <span className="mt-0.5 block text-sm text-slate-500">{c.hint}</span>}
                        </span>
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 group-hover:border-slate-400"
                          )}
                        >
                          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                {isEu ? (
                  <>
                    <p className="text-sm font-medium text-emerald-700">Хорошая новость</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Экзамен вам, скорее всего, не нужен</h3>
                    <p className="mt-3 leading-relaxed text-slate-600">
                      Права стран ЕС действуют в Испании, их можно обменять без экзаменов. Напишите нам — подскажем, как это сделать.
                    </p>
                    <a
                      href={`${botUrl}?start=course_qualify_${quizCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-inverse px-5 py-3 text-sm font-semibold text-on-inverse hover:bg-inverse/85"
                    >
                      Задать вопрос в Telegram <ArrowRight className="h-4 w-4" />
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-blue-700">Вам подойдёт</p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-3xl font-semibold tracking-tight text-slate-900">{plan.name}</h3>
                      <span className="text-3xl font-semibold tracking-tight text-slate-400 tabular-nums">€{plan.price}</span>
                    </div>
                    <p className="mt-3 leading-relaxed text-slate-600">{REASONS[planId]}</p>
                    {isTourist && (
                      <p className="mt-4 flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-sm leading-relaxed text-amber-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        С туристической визой сдать экзамен DGT нельзя, но готовиться можно уже сейчас — и сдать сразу после получения ВНЖ.
                      </p>
                    )}
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <a
                        href={`${botUrl}?start=${plan.botParam}_${quizCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Записаться · €{plan.price} <ArrowRight className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => document.getElementById(`plan-${planId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Сравнить тарифы
                      </button>
                    </div>
                  </>
                )}
                <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700">
                  <RotateCcw className="h-3.5 w-3.5" /> Пройти заново
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Расчёт ── */}
        <div
          className={cn(
            "border-t border-slate-100 bg-slate-50/70 p-6 sm:p-10 lg:border-l lg:border-t-0",
            !started && "hidden lg:block"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Сколько стоят права целиком</p>

          <div className="mt-6 grid grid-cols-[1fr_auto_auto] gap-x-5 text-sm">
            <span />
            <span className="pb-3 text-right text-xs font-medium text-slate-400">Автошкола</span>
            <span className="pb-3 text-right text-xs font-medium text-slate-900">С нами</span>
            {cost.rows.map((r) => (
              <Row key={r.label} label={r.label} note={r.note} alone={r.alone} us={r.us} />
            ))}
            <div className="col-span-3 mt-4 mb-1 text-xs text-slate-400">Практика в автошколе — одинаково</div>
            {cost.practice.map((r) => (
              <Row key={r.label} label={r.label} alone={r.alone} us={r.us} muted />
            ))}
            <div className="col-span-3 mt-3 border-t border-slate-200" />
            <span className="pt-4 font-semibold text-slate-900">Итого</span>
            <span className={cn("pt-4 text-right text-slate-400", cost.alone > cost.us && "line-through decoration-slate-300")}>
              <AnimatedNumber value={cost.alone} />
            </span>
            <span className="pt-4 text-right font-semibold text-slate-900"><AnimatedNumber value={cost.us} /></span>
          </div>

          {/* Честное сравнение: если с нами дороже — так и говорим, и за что разница */}
          {cost.alone > cost.us ? (
            <div className="mt-6 flex items-baseline justify-between rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <span className="text-sm text-slate-600">Экономия</span>
              <span className="text-3xl font-semibold tracking-tight text-emerald-600"><AnimatedNumber value={cost.alone - cost.us} /></span>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-600">{cost.us > cost.alone ? "Дороже автошколы на" : "Столько же, сколько автошкола"}</span>
                {cost.us > cost.alone && (
                  <span className="text-2xl font-semibold tracking-tight text-slate-900"><AnimatedNumber value={cost.us - cost.alone} /></span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Зато на русском, с куратором и помощью с документами — в автошколе теория только на испанском.
              </p>
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            {started
              ? "Средние цены по Испании, у каждой автошколы свои. Меняются от уровня испанского, знания ПДД и нужной практики."
              : "Ответьте на вопросы — расчёт подстроится под вас."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, note, alone, us, muted }: { label: string; note?: string; alone: number; us: number; muted?: boolean }) {
  return (
    <>
      <span className={cn("py-2", muted ? "text-slate-400" : "text-slate-700")}>
        {label}
        {note && <span className="block text-xs text-slate-400">{note}</span>}
      </span>
      <span className="py-2 text-right tabular-nums text-slate-400">€{alone}</span>
      <span className={cn("py-2 text-right tabular-nums", muted ? "text-slate-400" : "font-medium text-slate-900")}>
        {us === 0 ? "—" : `€${us}`}
      </span>
    </>
  );
}
