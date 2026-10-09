/**
 * Стоимость прав в Испании — единая логика для всех калькуляторов sdadim.eu
 * (квиз на главной — CourseChecklist, статья /blog/tseny-na-prava — ArticleCosts).
 *
 * СИНХРОННО с migran.es:
 *   - пошлина DGT          → migran/src/data/facts/spain.ts (tasas.dgtExam)
 *   - средние цены рынка   → migran/src/data/driving.ts (DRIVING_DEFAULTS)
 *   - формула пошлин       → migran/src/components/tools/DrivingBudgetCalculator.astro
 * Меняете цифру здесь — поменяйте и там.
 */

/** Tasa 2.1 «Pruebas de aptitud» на 2026 год (каталог тасс DGT). */
export const TASA_DGT = 94.05;

/**
 * Другие пошлины DGT на 2026 год — каталог тасс DGT (sedeclave.dgt.gob.es/IWPT_INTER7/pdf/catalogoPrecioTasas.pdf),
 * сверено 08.10.2026. Обновляются в январе вместе с TASA_DGT.
 */
export const TASAS = {
  /** 2.3 — обмен иностранных прав без экзаменов (и возврат прав после потери баллов) */
  canje: 28.87,
  /** 1.5 — смена владельца машины (transferencia) */
  transfer: 55.7,
  /** 4.1 — отчёт DGT о машине и прочие справки */
  informe: 8.67,
  /** 1.1 — первая регистрация машины в Испании (matriculación) */
  matriculacion: 99.77,
} as const;

/** Средние цены по Испании — примерные, у каждой автошколы свои. */
export const MARKET = {
  /** Запись в автошколу (matrícula) — платят и за практику, даже если теорию учили не там */
  matricula: 100,
  /** Пакет теории в автошколе */
  schoolTheory: 250,
  /** Урок вождения, 45 мин */
  lesson: 40,
  /** Выставление на экзамен по вождению (машина + инструктор), за КАЖДУЮ попытку */
  examPresentation: 70,
  /** Медкомиссия (psicotécnico) */
  medical: 45,
  /** Курс испанского для водителей на стороне */
  spanishCourse: 200,
} as const;

/**
 * Сколько пошлин DGT понадобится.
 * RD 818/2009, art. 50.2: tasa 2.1 даёт две convocatorias = две НЕУДАЧИ.
 * Сданный экзамен попытку не тратит (теория с 1-го раза → 2 попытки на вождение).
 * Автошколы называют это «3 convocatorias (2 suspensos)».
 *
 * @param theoryTry   с какой попытки сдана теория (1 = с первой)
 * @param drivingTry  с какой попытки сдано вождение
 */
export function tasasNeeded(theoryTry: number, drivingTry: number): number {
  const fails = Math.max(0, theoryTry - 1) + Math.max(0, drivingTry - 1);
  return 1 + Math.floor(fails / 2);
}

export interface CostRow {
  label: string;
  value: number;
  note?: string;
}

export interface BudgetInput {
  /** Подготовка к теории: цена курса Сдадим или пакета автошколы */
  theory: { label: string; price: number };
  lessons: number;
  theoryTry: number;
  drivingTry: number;
  extra?: CostRow[];
}

/** Полный бюджет: подготовка + государство + автошкола. Одна формула для всех экранов. */
export function budget({ theory, lessons, theoryTry, drivingTry, extra = [] }: BudgetInput) {
  const nTasas = tasasNeeded(theoryTry, drivingTry);
  const rows: CostRow[] = [
    { label: theory.label, value: theory.price },
    ...extra,
    { label: nTasas > 1 ? `Пошлина DGT × ${nTasas}` : "Пошлина DGT", value: round(TASA_DGT * nTasas), note: "Tasa 2.1" },
    { label: "Медкомиссия", value: MARKET.medical, note: "psicotécnico" },
    { label: "Запись в автошколу", value: MARKET.matricula, note: "matrícula" },
    { label: `Уроки вождения, ${lessons} шт.`, value: lessons * MARKET.lesson },
    {
      label: drivingTry > 1 ? `Выставление на экзамен × ${drivingTry}` : "Выставление на экзамен",
      value: MARKET.examPresentation * drivingTry,
      note: "машина автошколы",
    },
  ];
  return { rows, nTasas, total: round(rows.reduce((s, r) => s + r.value, 0)) };
}

export const round = (n: number) => Math.round(n * 100) / 100;

/** 1308.05 → «1 308,05 €», 1300 → «1 300 €» */
export const eur = (n: number) => {
  const v = round(n);
  const d = Number.isInteger(v) ? 0 : 2;
  return `${v.toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d })} €`;
};
