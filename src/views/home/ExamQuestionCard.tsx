import { useState } from "react";
import { Check, Languages, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/** Пример вопроса DGT — сразу показывает, чем мы занимаемся */
export function ExamQuestionCard() {
  const [picked, setPicked] = useState<number | null>(null);
  const options = [
    "Los vehículos que ya circulan por la glorieta",
    "Los vehículos que quieren entrar en la glorieta",
    "El vehículo que llega por la derecha",
  ];
  const correct = 0;

  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
      {/* стопка «листов» за карточкой */}
      <div aria-hidden className="absolute inset-x-6 -bottom-3 top-3 rounded-3xl border border-slate-200 bg-white/70" />
      <div aria-hidden className="absolute inset-x-12 -bottom-6 top-6 rounded-3xl border border-slate-200 bg-white/40" />

      <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_32px_64px_-32px_rgba(15,23,42,0.25)] sm:p-7">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span className="tabular-nums">Вопрос 12 / 30</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 tabular-nums">
            <Timer className="h-3.5 w-3.5" /> 18:42
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[40%] rounded-full bg-slate-900" />
        </div>

        <p className="mt-6 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
          En una glorieta, ¿quién tiene prioridad de paso?
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <Languages className="h-4 w-4 shrink-0 text-blue-600" />
          На круговом движении — у кого приоритет?
        </p>

        <div className="mt-5 space-y-2">
          {options.map((opt, i) => {
            const isPicked = picked === i;
            const showCorrect = picked !== null && i === correct;
            const showWrong = isPicked && i !== correct;
            return (
              <button
                key={opt}
                onClick={() => setPicked(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors sm:px-4",
                  showCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : showWrong
                      ? "border-rose-300 bg-rose-50 text-rose-950"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                    showCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-slate-50 text-slate-500"
                  )}
                >
                  {showCorrect ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-[44px] text-sm leading-relaxed">
          {picked === null ? (
            <p className="text-slate-400">Попробуйте ответить ↑</p>
          ) : (
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">{picked === correct ? "Верно. " : "Не совсем. "}</span>
              Приоритет у тех, кто уже едет по кругу. На уроке разбираем, почему — и где тут ловушка.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
