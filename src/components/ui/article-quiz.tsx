/**
 * ArticleQuizBlock — встраиваемый мини-тест DGT для статей
 *
 * Показывает 3–5 вопросов по теме статьи прямо на странице.
 * После каждого ответа — AI-разбор на русском (почему правильно/неправильно).
 * В конце — счёт и CTA на курс.
 *
 * Использование:
 *   <ArticleQuizBlock questions={ECO_DRIVING_QUESTIONS} title="Проверь себя" />
 */

import { useState } from "react";
import { CheckCircle2, XCircle, Zap, ArrowRight, RotateCcw, BrainCircuit, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: number;
  /** Текст вопроса на испанском (как в DGT) */
  question_es: string;
  /** Перевод вопроса на русский */
  question_ru: string;
  /** URL изображения из базы DGT (опционально) */
  image?: string;
  /** 3 варианта ответа */
  options: string[];
  /** Индекс правильного ответа (0, 1 или 2) */
  correct: number;
  /** AI-разбор на русском (почему именно этот ответ) */
  explanation: string;
  /** Ключевой принцип DGT для этого вопроса */
  principle?: string;
}

interface ArticleQuizBlockProps {
  questions: QuizQuestion[];
  title?: string;
  subtitle?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-600 tabular-nums shrink-0">
        {current + 1}/{total}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ScoreScreen({
  score,
  total,
  onReset,
}: {
  score: number;
  total: number;
  onReset: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  return (
    <div className="text-center py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
      {/* Ring */}
      <div className="relative w-28 h-28 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={passed ? "#10b981" : "#ef4444"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold", passed ? "text-emerald-600" : "text-red-600")}>{pct}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">результат</span>
        </div>
      </div>

      <p className="text-xl font-bold text-slate-900 mb-1">
        {score} из {total} правильно
      </p>
      <p className={cn("text-sm mb-6", passed ? "text-emerald-600" : "text-slate-600")}>
        {pct === 100
          ? "Идеально! Ты готов к экзамену DGT 🎉"
          : pct >= 80
          ? "Отличный результат! Ещё чуть-чуть 💪"
          : pct >= 60
          ? "Хорошо, но есть над чем работать 📚"
          : "Рекомендуем повторить эту тему 🔄"}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Пройти снова
        </button>
        <a
          href="https://t.me/skilyapp_bot?start=course"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        >
          <Zap className="w-3.5 h-3.5" /> 3000+ вопросов на курсе
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ArticleQuizBlock({
  questions,
  title = "Проверь себя — мини-тест DGT",
  subtitle,
}: ArticleQuizBlockProps) {
  const [step, setStep] = useState<"quiz" | "done">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);
  const [showRu, setShowRu] = useState(false);

  const q = questions[current];
  const isCorrect = selected === q.correct;
  const totalScore = scores.filter(Boolean).length;

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    setScores((prev) => [...prev, selected === q.correct]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setStep("done");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setShowExplanation(false);
      setShowRu(false);
    }
  };

  const handleReset = () => {
    setStep("quiz");
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setShowExplanation(false);
    setShowRu(false);
    setScores([]);
  };

  return (
    <div className="my-10 not-prose rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <img src="/favicon-s.svg" alt="Sdadim" className="w-4 h-4 rounded-sm" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Вопросы DGT · Sdadim
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        {step === "quiz" && (
          <div className="mt-3">
            <ProgressBar current={current} total={questions.length} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        {step === "done" ? (
          <ScoreScreen score={totalScore} total={questions.length} onReset={handleReset} />
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={current}>

            {/* Image */}
            {q.image && (
              <div className="rounded-2xl overflow-hidden mb-5 border border-slate-200 max-h-52">
                <img src={q.image} alt="Иллюстрация к вопросу" className="w-full h-52 object-cover" loading="lazy" />
              </div>
            )}

            {/* Question */}
            <div className="mb-1">
              <p className="text-slate-900 font-semibold text-base leading-snug">
                {q.question_es}
              </p>
              <button
                onClick={() => setShowRu(!showRu)}
                className="mt-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
              >
                <ChevronRight className={cn("w-3 h-3 transition-transform", showRu && "rotate-90")} />
                {showRu ? "Скрыть" : "Перевод на русский"}
              </button>
              {showRu && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 animate-in fade-in duration-150">
                  {q.question_ru}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5 mt-5">
              {q.options.map((opt, i) => {
                let state: "default" | "selected" | "correct" | "wrong" | "missed" = "default";
                if (confirmed) {
                  if (i === q.correct) state = "correct";
                  else if (i === selected) state = "wrong";
                } else if (i === selected) {
                  state = "selected";
                }

                return (
                  <button
                    key={i}
                    disabled={confirmed}
                    onClick={() => !confirmed && setSelected(i)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-200",
                      state === "default" && "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                      state === "selected" && "border-blue-500/60 bg-blue-500/10 text-slate-900",
                      state === "correct" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-700",
                      state === "wrong" && "border-red-500/50 bg-red-500/10 text-red-700",
                    )}
                  >
                    <span className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
                      state === "default" && "bg-slate-100 text-slate-500",
                      state === "selected" && "bg-blue-500 text-white",
                      state === "correct" && "bg-emerald-500 text-white",
                      state === "wrong" && "bg-red-500 text-white",
                    )}>
                      {state === "correct" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       state === "wrong"   ? <XCircle className="w-3.5 h-3.5" />    :
                       i + 1}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Result feedback */}
            {confirmed && (
              <div className={cn(
                "mt-5 rounded-2xl border p-4 animate-in fade-in zoom-in-95 duration-200",
                isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/8"
                  : "border-red-500/20 bg-red-500/8"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span className={cn(
                    "text-sm font-bold",
                    isCorrect ? "text-emerald-700" : "text-red-700"
                  )}>
                    {isCorrect ? "Правильно!" : `Неверно. Правильный ответ: ${q.correct + 1}`}
                  </span>
                </div>

                {/* AI Explanation toggle */}
                {!showExplanation ? (
                  <button
                    onClick={() => setShowExplanation(true)}
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-1"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    AI-разбор — почему именно так
                  </button>
                ) : (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <BrainCircuit className="w-3 h-3" /> Разбор
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
                    {q.principle && (
                      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500">
                        <Zap className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong className="text-amber-600">Принцип DGT:</strong> {q.principle}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              {!confirmed ? (
                <button
                  onClick={handleConfirm}
                  disabled={selected === null}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    selected !== null
                      ? "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  Ответить
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {current + 1 < questions.length ? "Следующий вопрос" : "Посмотреть результат"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Официальные вопросы DGT · База 2025</span>
        <a
          href="https://t.me/skilyapp_bot?start=course"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-400 hover:text-slate-700 transition-colors font-medium"
        >
          Sdadim.eu →
        </a>
      </div>
    </div>
  );
}

// ─── Пресет вопросов: Экономичное вождение ────────────────────────────────────

export const ECO_DRIVING_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question_es: "Circular en punto muerto cuesta abajo, con el motor en marcha, respecto a circular con una marcha engranada y el pie levantado del acelerador...",
    question_ru: "Езда на нейтральной передаче под гору с работающим двигателем, по сравнению с ездой на включённой передаче с убранной ногой с газа...",
    options: [
      "...supone un mayor consumo de combustible.",
      "...supone el mismo consumo de combustible.",
      "...supone un menor consumo de combustible.",
    ],
    correct: 0,
    explanation: "На нейтральной передаче двигатель потребляет топливо на поддержание холостого хода (~0,5–1 л/ч). При включённой передаче и убранной ноге с газа электроника полностью закрывает форсунки — расход топлива равен НУЛЮ. Это называется «engine braking» (торможение двигателем). Таким образом, нейтраль под гору обходится ДОРОЖЕ, а не дешевле.",
    principle: "При движении в натяг (включённая передача, нога убрана с газа) — расход = 0. Нейтраль = холостой ход = расход топлива.",
  },
  {
    id: 2,
    question_es: "¿En qué afecta a la eficiencia energética del vehículo llevar los neumáticos con una presión por debajo de la recomendada por el fabricante?",
    question_ru: "Как влияет на энергоэффективность автомобиля давление в шинах ниже рекомендованного производителем?",
    options: [
      "Reduce el consumo de combustible.",
      "No afecta al consumo de combustible.",
      "Aumenta el consumo de combustible.",
    ],
    correct: 2,
    explanation: "Недостаточное давление в шинах увеличивает площадь контакта с дорогой и сопротивление качению. Автомобилю нужно больше усилий (и топлива), чтобы двигаться. При давлении на 0,5 бар ниже нормы расход топлива растёт на 5–10%. Дополнительно: снижается управляемость и увеличивается риск аквапланирования.",
    principle: "Правильное давление шин (по регламенту производителя) снижает потребление топлива до 10% — проверяй ежемесячно на холодных шинах.",
  },
  {
    id: 3,
    question_es: "Para lograr una conducción eficiente, ¿cuándo debe reducirse la velocidad antes de llegar a una curva?",
    question_ru: "Для экономичного вождения, когда следует снижать скорость перед поворотом?",
    options: [
      "Frenando con el pedal hasta la entrada a la curva.",
      "Antes de la curva, levantando el pie del acelerador.",
      "En la propia curva, usando el freno suavemente.",
    ],
    correct: 1,
    explanation: "Главный принцип eco-driving — 'чтение дороги'. Видите поворот заблаговременно → убираете ногу с газа → машина замедляется за счёт торможения двигателем без расхода топлива. Торможение педалью тормоза означает потерю кинетической энергии, которую пришлось 'купить' за топливо. Тормоз = выброшенные деньги.",
    principle: "Смотрите далеко вперёд. Реагируйте убиранием газа, а не нажатием тормоза — сохраняете энергию (и деньги).",
  },
  {
    id: 4,
    question_es: "Circular a mayor velocidad en carretera, ¿cómo afecta al consumo de combustible?",
    question_ru: "Как движение на большей скорости по шоссе влияет на расход топлива?",
    options: [
      "Lo disminuye, porque el motor trabaja menos tiempo.",
      "No varía, es indiferente la velocidad.",
      "Lo aumenta, por la mayor resistencia aerodinámica.",
    ],
    correct: 2,
    explanation: "Аэродинамическое сопротивление растёт пропорционально КВАДРАТУ скорости. При скорости 150 км/ч сопротивление воздуха в 2,25 раза больше, чем при 100 км/ч. Это напрямую увеличивает расход топлива. Пример: авто, которое потребляет 6 л/100 км при 120 км/ч, будет потреблять ~7,5 л/100 км при 150 км/ч.",
    principle: "Физика: F(сопротивление) = k × v². Скорость × 1,5 → сопротивление × 2,25 → расход значительно выше.",
  },
  {
    id: 5,
    question_es: "¿Es correcto apagar el motor del vehículo mientras circula por una pendiente descendente para ahorrar combustible?",
    question_ru: "Правильно ли выключать двигатель автомобиля во время движения под гору для экономии топлива?",
    options: [
      "Sí, porque el motor no consume combustible cuando está apagado.",
      "No, porque se pierde la asistencia a la dirección y a los frenos.",
      "Sí, pero solo en vehículos modernos con tecnología Stop&Start.",
    ],
    correct: 1,
    explanation: "Выключение двигателя во время движения — КРАЙНЕ ОПАСНО. При заглушённом двигателе отключается гидроусилитель руля (руль становится очень тяжёлым) и вакуумный усилитель тормозов (педаль тормоза становится «деревянной», а эффективность торможения резко падает). Это может привести к потере управления. Такие действия запрещены и наказываются штрафом во время экзамена DGT.",
    principle: "Никогда не глушите двигатель на ходу. При движении с включённой передачей без газа — топливо не тратится и так.",
  },
];
