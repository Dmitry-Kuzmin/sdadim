/**
 * Баллы и ограничения новичка по годам — с зачётом иностранного стажа и без.
 * Закон о движении (RDL 6/2015): ст. 63 — 8 баллов новичку, 12 остальным, бонус +2 за 3 года и +1 за следующие 3 (макс. 15);
 * ст. 65.2 — новичок получает 12 после 2 лет без нарушений. Знак L — первый год, алкоголь 0,15 мг/л — первые 2 года.
 */
export interface PointsStep {
  at: number;
  pts: number;
  label: string;
  note: string;
  summary?: boolean;
}

export const POINTS_PLAN: Record<"novice" | "staj", PointsStep[]> = {
  novice: [
    { at: 0, pts: 8, label: "Старт", note: "Знак L на год, алкоголь не больше 0,15 мг/л" },
    { at: 1, pts: 8, label: "Через год", note: "Знак L можно снять" },
    { at: 2, pts: 12, label: "Через 2 года", note: "12 баллов и общий лимит алкоголя 0,25" },
    { at: 8, pts: 15, label: "Через 8 лет", note: "Максимум: +2 через 3 года и +1 ещё через 3" },
  ],
  staj: [
    { at: 0, pts: 12, label: "Сразу", note: "Без знака L, общий лимит алкоголя 0,25" },
    { at: 3, pts: 14, label: "Через 3 года", note: "+2 балла за аккуратность" },
    { at: 6, pts: 15, label: "Через 6 лет", note: "+1 балл — максимум" },
    { at: 6, pts: 15, label: "Выигрыш", note: "На 2 года быстрее и до 12, и до 15 баллов", summary: true },
  ],
};

const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(/\s*г\.$/, "");

/** Карточки шагов — одна разметка для сервера и скрипта */
export function pointsStepsHtml(mode: keyof typeof POINTS_PLAN, start: Date | null): string {
  const years = start ? (Date.now() - start.getTime()) / (365.25 * 86400000) : -1;
  return POINTS_PLAN[mode]
    .map((s) => {
      const reached = !s.summary && start && years >= s.at;
      let when = "";
      if (start && !s.summary) {
        const d = new Date(start);
        d.setFullYear(d.getFullYear() + s.at);
        when = ` · ${fmt(d)}`;
      }
      return `<li class="bg-white p-5"><p class="text-xs font-semibold uppercase tracking-wider ${reached ? "text-emerald-600" : "text-slate-400"}">${s.label}${when}</p><p class="mt-2 text-3xl font-bold tabular-nums ${s.summary ? "text-blue-600" : "text-slate-900"}">${s.summary ? "−2 года" : `${s.pts} <span class=\"text-base font-semibold text-slate-500\">баллов</span>`}</p><p class="mt-1 text-sm leading-snug text-slate-600">${s.note}</p></li>`;
    })
    .join("");
}

export function pointsNowHtml(mode: keyof typeof POINTS_PLAN, start: Date | null): string {
  if (!start) return "Укажите дату — покажем, где вы сейчас.";
  const years = (Date.now() - start.getTime()) / (365.25 * 86400000);
  const cur = POINTS_PLAN[mode].filter((s) => !s.summary && years >= s.at).pop();
  if (!cur) return "Дата в будущем — проверьте год.";
  const extra = mode === "novice" ? `${years < 1 ? ", обязателен знак L" : ""}${years < 2 ? ", лимит алкоголя 0,15 мг/л" : ""}` : "";
  return `Сейчас у вас <strong class="text-slate-900">${cur.pts} баллов</strong>${extra} — если не было нарушений с потерей баллов.`;
}
