/**
 * Данные курса (цены, потоки) из Supabase — единый источник правды с ботом.
 * Без supabase-js: два простых SELECT через REST (PostgREST), −50 КБ JS на главной.
 */
import type { DbPlanPrices } from "@/lib/plans";

const URL = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type StreamInfo = {
  id?: string;
  number: number;
  start_date: string;
  spots_total: number;
  spots_enrolled: number;
  status?: string;
};

async function rest<T>(path: string): Promise<T | null> {
  if (!URL || !KEY) return null;
  try {
    const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function fetchPlanPrices(): Promise<DbPlanPrices | null> {
  const rows = await rest<{ id: string; price_eur: number; original_price_eur: number | null; payment_link: string | null }[]>(
    "course_plans?select=id,price_eur,original_price_eur,payment_link&active=eq.true"
  );
  if (!rows) return null;
  return Object.fromEntries(rows.map((p) => [p.id, p]));
}

/** Ближайшие потоки, начиная с сегодняшнего дня */
export async function fetchStreams(limit = 3): Promise<StreamInfo[]> {
  const today = new Date().toISOString().split("T")[0];
  return (
    (await rest<StreamInfo[]>(
      `course_streams?select=id,status,number,start_date,spots_total,spots_enrolled&start_date=gte.${today}&order=start_date.asc&limit=${limit}`
    )) ?? []
  );
}

export const spotsLeft = (s: StreamInfo) =>
  s.status === "finished" || s.status === "closed" ? 0 : Math.max(0, s.spots_total - s.spots_enrolled);

/** Первый поток со свободными местами */
export const nextOpenStream = (streams: StreamInfo[]) => streams.find((s) => spotsLeft(s) > 0) ?? null;

/* На главной данные нужны нескольким островам — запрос на страницу один, результат общий */
let streamsReq: Promise<StreamInfo[]> | null = null;
let pricesReq: Promise<DbPlanPrices | null> | null = null;
export const loadStreams = () => (streamsReq ??= fetchStreams(3));
export const loadPlanPrices = () => (pricesReq ??= fetchPlanPrices());
