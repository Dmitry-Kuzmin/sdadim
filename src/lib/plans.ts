/** Тарифы курса. Цены по умолчанию; актуальные подмешиваются из Supabase (getPlans). */

export interface Plan {
  id: string;
  badge?: string;
  name: string;
  subtitle: string;
  oldPrice: number;
  price: number;
  platformMonths: number;
  features: { text: string; included: boolean }[];
  cta: string;
  botParam?: string;
  highlight: boolean;
  accentColor: string;
}

const BASE_PLANS: Plan[] = [
  {
    id: "theory",
    name: "Теория",
    subtitle: "Живой курс + платформа в подарок",
    oldPrice: 199,
    price: 199,
    platformMonths: 3,
    highlight: false,
    accentColor: "zinc",
    cta: "Занять место",
    botParam: "buy_basic",
    features: [
      { text: "16 живых эфиров (2 мес × 2/нед × 2ч)", included: true },
      { text: "Платформа Skilyapp на 3 мес в подарок", included: true },
      { text: "Записи занятий (доступ 30 дней)", included: true },
      { text: "Общий Telegram-чат учеников", included: true },
      { text: "Пошаговые инструкции по сбору документов", included: false },
      { text: "Полное ведение и запись на экзамен (помощь)", included: false },
    ],
  },
  {
    id: "pro",
    badge: "Хит потока",
    name: "С сопровождением",
    subtitle: "Курс + помощь с документами",
    oldPrice: 324,
    price: 259,
    platformMonths: 6,
    highlight: true,
    accentColor: "blue",
    cta: "Занять место",
    botParam: "buy_pro",
    features: [
      { text: "16 живых эфиров (2 мес × 2/нед × 2ч)", included: true },
      { text: "Платформа Skilyapp на 6 мес", included: true },
      { text: "Записи занятий (сохраняются на 6 месяцев)", included: true },
      { text: "Закрытый чат с кураторами и преподавателем", included: true },
      { text: "Испанский для водителей (мини-курс)", included: true },
      { text: "Пошаговые инструкции по сбору документов", included: true },
      { text: "Полное ведение и запись на экзамен (помощь)", included: false },
    ],
  },
  {
    id: "vip",
    badge: "Под ключ",
    name: "VIP",
    subtitle: "Полное ведение до получения прав",
    oldPrice: 437,
    price: 349,
    platformMonths: 12,
    highlight: false,
    accentColor: "violet",
    cta: "Занять место VIP",
    botParam: "buy_vip",
    features: [
      { text: "16 живых эфиров (2 мес × 2/нед × 2ч)", included: true },
      { text: "Платформа Skilyapp на 12 мес (Unlimited)", included: true },
      { text: "Записи занятий (сохраняются на 12 месяцев)", included: true },
      { text: "VIP-чат: личная поддержка 24/7", included: true },
      { text: "Испанский для водителей (мини-курс)", included: true },
      { text: "Индивидуальный разбор твоих документов", included: true },
      { text: "Полное ведение и запись на экзамен (помощь)", included: true },
    ],
  },
];

// Map DB plan id → index in BASE_PLANS
const DB_ID_MAP: Record<string, number> = { theory: 0, basic: 0, pro: 1, vip: 2 };

export interface DbPlanPrices {
  [planId: string]: { price_eur: number; original_price_eur: number | null; payment_link?: string | null };
}

// Merge DB prices into BASE_PLANS (DB wins if available)
export function getPlans(dbPrices?: DbPlanPrices): (Plan & { paymentLink?: string })[] {
  return BASE_PLANS.map((plan, idx) => {
    const dbKey = Object.keys(DB_ID_MAP).find((k) => DB_ID_MAP[k] === idx && dbPrices?.[k]);
    const dbPlan = dbKey && dbPrices?.[dbKey];
    if (dbPlan) {
      return {
        ...plan,
        price: dbPlan.price_eur,
        oldPrice: dbPlan.original_price_eur ?? plan.oldPrice,
        paymentLink: dbPlan.payment_link ?? undefined,
      };
    }
    return plan;
  });
}
