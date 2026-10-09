#!/usr/bin/env node
/** Обновляет src/data/traffic-fines.json из public.traffic_fines (запасной снимок для сборки без сети) */
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n").map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()])
);
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
const cols = "id,kind,article,severity,description_es,description_ru,fine_eur,fine_max_eur,points,speed_limit,speed_from,speed_to";
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const rows = await fetch(`${url}/rest/v1/traffic_fines?select=${cols}&active=eq.true&order=id`, { headers }).then((r) => r.json());
if (!Array.isArray(rows) || rows.length < 80) throw new Error(`Неожиданный ответ: ${JSON.stringify(rows).slice(0, 200)}`);
const [latest] = await fetch(`${url}/rest/v1/traffic_fines?select=updated_at&active=eq.true&order=updated_at.desc&limit=1`, { headers }).then((r) => r.json());
writeFileSync(new URL("../src/data/traffic-fines.json", import.meta.url), JSON.stringify({ boeUpdated: latest.updated_at.slice(0, 10), rows }, null, 1) + "\n");
console.log(`✓ ${rows.length} штрафов → src/data/traffic-fines.json (BOE: ${latest.updated_at.slice(0, 10)})`);
