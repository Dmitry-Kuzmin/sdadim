/**
 * Квиз «Сколько будут стоить права именно вам» на главной: вопросы, подбор тарифа и расчёт.
 * Без React — общий модуль для серверного HTML и клиентского скрипта CourseChecklist.astro.
 * Цены и формулы — @/lib/license-costs (общие со статьёй о ценах и migran.es).
 */
import { MARKET, TASA_DGT, tasasNeeded } from "@/lib/license-costs";

export type PlanId = "theory" | "pro" | "vip";

export interface Choice {
  label: string;
  hint?: string;
  risk: number;
  flag?: "tourist" | "eu";
  lessons?: "none" | "few" | "many";
}

export interface Question {
  id: string;
  title: string;
  note?: string;
  choices: Choice[];
}

export const QUESTIONS: Question[] = [
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

export const REASONS: Record<PlanId, string> = {
  vip: "Испанский — главный барьер на экзамене. В VIP есть мини-курс языка для водителей и личное ведение до записи в DGT.",
  pro: "Есть пара пробелов — куратор поможет их закрыть и проведёт через документы.",
  theory: "Хорошая база и испанский. Живых уроков и тренажёра будет достаточно.",
};

export function recommend(risk: number, spanishRisk: number): PlanId {
  if (spanishRisk === 2 || risk >= 5) return "vip";
  if (risk >= 2) return "pro";
  return "theory";
}

/* Оценочные цифры — средние по рынку, не оферта. Формулы и цены — @/lib/license-costs (общие со статьёй и migran.es) */
export const LESSONS: Record<NonNullable<Choice["lessons"]>, number> = { none: 2, few: 8, many: 20 };

export function costRows(ourPrice: number, spanishRisk: number, risk: number, lessons: Choice["lessons"]) {
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

/**
 * Ответы квиза для бота: "c" + индекс ответа на каждый вопрос (9 — нет ответа).
 * Бот (skilyapp/telegram-bot) разбирает `buy_pro_c01122` и показывает профиль куратору.
 * Порядок вопросов и ответов менять синхронно с QUIZ_LABELS в боте.
 */
export function encodeAnswers(answers: Record<string, Choice>): string {
  return "c" + QUESTIONS.map((q) => {
    const i = answers[q.id] ? q.choices.findIndex((c) => c.label === answers[q.id].label) : -1;
    return i < 0 ? "9" : String(i);
  }).join("");
}


/* ─── Таблица «Сколько стоят права целиком» — одна разметка для сервера и скрипта ─── */

type Cost = ReturnType<typeof costRows>;

const row = (label: string, alone: number, us: number, note?: string, muted?: boolean) =>
  `<span class="py-2 ${muted ? "text-slate-400" : "text-slate-700"}">${label}${note ? `<span class="block text-xs text-slate-400">${note}</span>` : ""}</span>` +
  `<span class="py-2 text-right tabular-nums text-slate-400">€${alone}</span>` +
  `<span class="py-2 text-right tabular-nums ${muted ? "text-slate-400" : "font-medium text-slate-900"}">${us === 0 ? "—" : `€${us}`}</span>`;

/** Строки таблицы; итоги — в элементах data-num, их анимирует скрипт */
export function costTableHtml(cost: Cost): string {
  return (
    `<span></span><span class="pb-3 text-right text-xs font-medium text-slate-400">Автошкола</span><span class="pb-3 text-right text-xs font-medium text-slate-900">С нами</span>` +
    cost.rows.map((r) => row(r.label, r.alone, r.us, r.note)).join("") +
    `<div class="col-span-3 mt-4 mb-1 text-xs text-slate-400">Практика в автошколе — одинаково</div>` +
    cost.practice.map((r) => row(r.label, r.alone, r.us, undefined, true)).join("") +
    `<div class="col-span-3 mt-3 border-t border-slate-200"></div>` +
    `<span class="pt-4 font-semibold text-slate-900">Итого</span>` +
    `<span class="pt-4 text-right text-slate-400${cost.alone > cost.us ? " line-through decoration-slate-300" : ""}"><span class="tabular-nums" data-num="alone">€${cost.alone}</span></span>` +
    `<span class="pt-4 text-right font-semibold text-slate-900"><span class="tabular-nums" data-num="us">€${cost.us}</span></span>`
  );
}

/** Блок под таблицей: экономия или честное «дороже на» */
export function costVerdictHtml(cost: Cost): string {
  if (cost.alone > cost.us)
    return `<div class="mt-6 flex items-baseline justify-between rounded-2xl bg-white p-5 ring-1 ring-slate-200"><span class="text-sm text-slate-600">Экономия</span><span class="text-3xl font-semibold tracking-tight text-emerald-600"><span class="tabular-nums" data-num="diff">€${cost.alone - cost.us}</span></span></div>`;
  const more = cost.us > cost.alone;
  return `<div class="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div class="flex items-baseline justify-between"><span class="text-sm text-slate-600">${more ? "Дороже автошколы на" : "Столько же, сколько автошкола"}</span>${more ? `<span class="text-2xl font-semibold tracking-tight text-slate-900"><span class="tabular-nums" data-num="diff">€${cost.us - cost.alone}</span></span>` : ""}</div><p class="mt-2 text-sm leading-relaxed text-slate-500">Зато на русском, с куратором и помощью с документами — в автошколе теория только на испанском.</p></div>`;
}
