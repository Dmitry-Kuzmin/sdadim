import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { CourseChecklist } from "@/components/ui/course/CourseChecklist";
import { useStreams, usePlanPrices } from "@/hooks/useCourseData";
import { spotsLeft } from "@/lib/course-data";
import { getPlans } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { BOT_URL, botLink, setQuizCode, trackConversion, useQuizCode } from "./content";
import { SectionHead } from "./SectionHead";
import { formatDate, openStreams } from "./streams";

/** Калькулятор и тарифы — один остров: калькулятор подсвечивает подходящий тариф */
export function CalcAndPricing() {
  const dbPrices = usePlanPrices();
  const streams = openStreams(useStreams());
  const quizCode = useQuizCode();
  const [recommended, setRecommended] = useState<string | null>(null);
  const plans = getPlans(dbPrices);

  return (
    <>
      <section id="calc" className="scroll-mt-16 border-t border-slate-100 bg-slate-50/60 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            index="03"
            eyebrow="Подбор тарифа"
            title="Сколько будут стоить права именно вам"
            desc="Пять вопросов — и вы увидите полный бюджет: курс, пошлины, медкомиссию и практику."
          />
          <CourseChecklist
            plans={plans}
            onRecommend={(planId, code) => {
              setRecommended(planId);
              setQuizCode(code);
            }}
            botUrl={BOT_URL}
          />
        </div>
      </section>

      <section id="pricing" className="cv-auto scroll-mt-16 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            index="04"
            eyebrow="Цены"
            title={"Один курс — три уровня поддержки"}
            desc="Во всех тарифах одинаковые 16 живых уроков. Разница — в том, сколько мы делаем за вас."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const dark = plan.highlight;
              const isRec = recommended === plan.id;
              return (
                <div
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  className={cn(
                    "relative flex scroll-mt-24 flex-col rounded-3xl p-7 transition-shadow sm:p-8",
                    dark ? "bg-night text-white ring-1 ring-white/5 shadow-[0_32px_64px_-32px_rgba(15,23,42,0.6)]" : "border border-slate-200 bg-white",
                    isRec && "ring-2 ring-blue-600 ring-offset-4"
                  )}
                >
                  <div className={cn("mb-4 h-6 items-center", isRec || dark ? "flex" : "hidden lg:flex")}>
                    {isRec ? (
                      <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">Подходит вам</span>
                    ) : dark ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">Чаще выбирают</span>
                    ) : null}
                  </div>
                  <h3 className={cn("text-xl font-semibold tracking-tight", dark ? "text-white" : "text-slate-900")}>{plan.name}</h3>
                  <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-slate-500")}>{plan.subtitle}</p>
                  <div className="mt-7 flex items-baseline gap-2">
                    <span className="text-5xl font-semibold tracking-tight tabular-nums">€{plan.price}</span>
                    {plan.oldPrice > plan.price && (
                      <span className={cn("tabular-nums line-through", dark ? "text-white/60" : "text-slate-400")}>€{plan.oldPrice}</span>
                    )}
                  </div>
                  <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-slate-500")}>разовый платёж</p>

                  <ul className={cn("mt-7 flex-1 space-y-3 border-t pt-7", dark ? "border-white/10" : "border-slate-100")}>
                    {plan.features.filter((f) => f.included).map((f) => (
                      <li key={f.text} className={cn("flex gap-3 text-[15px] leading-snug", dark ? "text-white/85" : "text-slate-700")}>
                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", dark ? "text-[#60a5fa]" : "text-blue-600")} strokeWidth={2.5} />
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={botLink(plan.botParam!, quizCode)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={trackConversion}
                    className={cn(
                      "mt-8 flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-colors",
                      dark || isRec ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    )}
                  >
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Ближайшие старты: информативно, дата выбирается при оформлении в боте */}
          {streams.length > 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Ближайшие старты</p>
                  <p className="mt-1 text-sm text-slate-500">Дату выберете при оформлении. Цена фиксируется в момент записи.</p>
                </div>
                <ul className="grid gap-2 sm:grid-cols-3 md:flex md:gap-3">
                  {streams.map((s, i) => (
                    <li
                      key={s.id ?? s.number}
                      className={cn(
                        "flex items-center justify-between gap-5 rounded-2xl px-4 py-3 md:min-w-[170px] md:flex-col md:items-start md:gap-1",
                        i === 0 ? "bg-blue-50 ring-1 ring-blue-200" : "bg-slate-50"
                      )}
                    >
                      <span className="font-semibold text-slate-900">{formatDate(s.start_date)}</span>
                      <span className={cn("text-sm", spotsLeft(s) <= 3 ? "font-medium text-amber-700" : "text-slate-500")}>
                        {spotsLeft(s)} из {s.spots_total} мест
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Оплата и запись — через Telegram-бот. Без скрытых платежей.</p>
            <a
              href={botLink("course_qualify", quizCode)}
              target="_blank"
              rel="noreferrer"
              onClick={trackConversion}
              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
            >
              Нужны индивидуальные занятия? <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
