/**
 * Факты для текстов: год, пошлины DGT, сверка. Одно место — правка здесь меняет все статьи.
 * В MDX: <Year />, <Tasa k="exam" />, <Fine id="a76.g" />; во frontmatter — {YEAR}.
 */
import { TASA_DGT, TASAS, eur } from "@/lib/license-costs";

/** Год сборки. Сайт пересобирается при каждом деплое — в январе год меняется сам */
export const YEAR = new Date().getFullYear();

/** Год, на который сверены пошлины DGT (каталог тасс обновляется в январе, новый PGE) */
export const TASAS_CHECKED_YEAR = 2026;

export const TASA = {
  /** 2.1 — экзамены на права, действует до двух провалов */
  exam: TASA_DGT,
  /** 2.3 — обмен без экзаменов */
  canje: TASAS.canje,
  /** 1.5 — смена владельца машины */
  transfer: TASAS.transfer,
  /** 4.1 — отчёт DGT о машине */
  informe: TASAS.informe,
  /** 1.1 — первая регистрация машины */
  matriculacion: TASAS.matriculacion,
  /** 4.3 — продление прав */
  renewal: TASAS.renewal,
  /** 4.4 — дубликат прав */
  duplicate: TASAS.duplicate,
} as const;

export type TasaKey = keyof typeof TASA;
export const tasaText = (k: TasaKey) => eur(TASA[k]);

/** Пошлины текстом для MDX-пропсов: `пошлина ${T.exam}` → «пошлина 94,05 €» */
export const T = Object.fromEntries(Object.keys(TASA).map((k) => [k, tasaText(k as TasaKey)])) as Record<TasaKey, string>;

/** Подстановки во frontmatter: {YEAR} → год, {TASA.exam} → «94,05 €» */
export const withFacts = (s: string) =>
  s.replaceAll("{YEAR}", String(YEAR)).replace(/\{TASA\.(\w+)\}/g, (m, k: string) => (k in T ? T[k as TasaKey] : m));

if (YEAR > TASAS_CHECKED_YEAR) {
  console.warn(`\n⚠️  [facts] Пошлины DGT сверены на ${TASAS_CHECKED_YEAR} год, а сейчас ${YEAR}. Сверьте каталог тасс DGT и обновите src/lib/license-costs.ts + TASAS_CHECKED_YEAR.\n`);
}
