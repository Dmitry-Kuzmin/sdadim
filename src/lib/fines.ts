/**
 * Штрафы DGT — общий источник со SkilyApp: таблица public.traffic_fines в Supabase,
 * которую функция traffic-fines-sync (репозиторий skilyapp) раз в неделю сверяет с BOE.
 * Сборка берёт живые данные; без сети — снимок src/data/traffic-fines.json
 * (обновить: npm run fines:snapshot). В статьях — компонент <Fine id="a76.g" />.
 */
import snapshot from "@/data/traffic-fines.json";

export interface FineRow {
  id: string;
  kind: "infraction" | "speed";
  article: string;
  severity: "leve" | "grave" | "muy_grave";
  description_es: string;
  description_ru: string | null;
  fine_eur: number;
  fine_max_eur: number | null;
  points: number;
  speed_limit: number | null;
  speed_from: number | null;
  speed_to: number | null;
}

export interface FinesData {
  /** Когда таблицу последний раз сверили с BOE */
  boeUpdated: string;
  rows: FineRow[];
  live: boolean;
}

const COLUMNS = "id,kind,article,severity,description_es,description_ru,fine_eur,fine_max_eur,points,speed_limit,speed_from,speed_to";

let cache: Promise<FinesData> | null = null;

/** Один запрос на сборку; никогда не падает — откатывается на снимок */
export function loadFines(): Promise<FinesData> {
  return (cache ??= (async () => {
    const fallback = { ...(snapshot as Omit<FinesData, "live">), live: false };
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) return fallback;
    try {
      const headers = { apikey: key, Authorization: `Bearer ${key}` };
      const [rows, latest] = await Promise.all([
        fetch(`${url}/rest/v1/traffic_fines?select=${COLUMNS}&active=eq.true&order=id`, { headers }).then((r) => r.json()),
        fetch(`${url}/rest/v1/traffic_fines?select=updated_at&active=eq.true&order=updated_at.desc&limit=1`, { headers }).then((r) => r.json()),
      ]);
      if (!Array.isArray(rows) || rows.length < 80) return fallback;
      return { rows, boeUpdated: String(latest?.[0]?.updated_at ?? fallback.boeUpdated).slice(0, 10), live: true };
    } catch {
      return fallback;
    }
  })());
}

export async function getFine(id: string): Promise<FineRow> {
  const row = (await loadFines()).rows.find((r) => r.id === id);
  if (!row) throw new Error(`Нет штрафа «${id}» в traffic_fines — проверьте id (см. src/data/traffic-fines.json)`);
  return row;
}

/** 1000 → «1 000 €» */
export const fineEur = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} €`;

/** «6 баллов», «3 балла», «1 балл» */
export const pointsWord = (n: number) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? "балл" : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? "балла" : "баллов";
};

/** Таблица на всю сборку — загружается один раз */
export const FINES = await loadFines();

/** Текст штрафа для MDX-пропсов: `${fine("a76.g")}` → «200 € и −6 баллов» */
export function fine(id: string, show: "both" | "fine" | "points" = "both"): string {
  const f = FINES.rows.find((r) => r.id === id);
  if (!f) throw new Error(`Нет штрафа «${id}» в traffic_fines — проверьте id (см. src/data/traffic-fines.json)`);
  const money = f.fine_max_eur ? `${fineEur(f.fine_eur)}–${fineEur(f.fine_max_eur)}` : fineEur(f.fine_eur);
  const pts = `${f.points} ${pointsWord(f.points)}`;
  if (show === "fine") return money;
  if (show === "points") return pts;
  return f.points ? `${money} и −${pts}` : `${money}, без потери баллов`;
}
