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

/** Карточки шагов — одна разметка для сервера и скрипта (стили — PointsTimeline.astro) */
export function pointsStepsHtml(mode: keyof typeof POINTS_PLAN, start: Date | null): string {
  const years = start ? (Date.now() - start.getTime()) / (365.25 * 86400000) : -1;
  const plan = POINTS_PLAN[mode];
  const cur = start ? plan.filter((s) => !s.summary && years >= s.at).pop() : undefined;
  return plan
    .map((s, i) => {
      const reached = !s.summary && start && years >= s.at;
      let when = "";
      if (start && !s.summary) {
        const d = new Date(start);
        d.setFullYear(d.getFullYear() + s.at);
        when = fmt(d);
      }
      const pips = s.summary ? "" : `<span class="pt-pips" aria-hidden="true">${Array.from({ length: 15 }, (_, k) => `<i${k < s.pts ? ' class="on"' : ""}></i>`).join("")}</span>`;
      const state = s === cur ? " is-now" : reached ? " is-done" : "";
      return `<li class="pt-step${s.summary ? " pt-sum" : ""}${state}" style="--i:${i}"><p class="pt-when">${reached ? '<span class="pt-ok" aria-label="пройдено"></span>' : ""}${s.label}</p>${when ? `<p class="pt-date">${when}</p>` : ""}<p class="pt-pts">${s.summary ? "−2 года" : `${s.pts} <small>баллов</small>`}</p>${pips}<p class="pt-note">${s.note}</p></li>`;
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
