/**
 * Статья: Ошибки подсчёта расходов на права Испании, калькулятор
 * SEO: "стоимость водительских прав испания 2026", "tasa dgt 2", "матрикула автошкола"
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Receipt, Coins, ShieldCheck, Euro } from "lucide-react";
import {
  ArticleAccordion,
  ArticleCallout,
  ArticleCardGrid,
  ArticleDivider,
  ArticleImage,
  ArticleBanner,
} from "@/components/ui/article";
import { cn } from "@/lib/utils";
import { getPlans } from "@/components/ui/pricing-cards";
import { budget, eur, MARKET, round, TASA_DGT } from "@/lib/license-costs";

// ─── SEO ──────────────────────────────────────────────────────────────────────

function useSEO() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Сколько стоит получить права в Испании? (Калькулятор 2026) | Sdadim";

    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, sel.match(/\[(?:name|property)="(.+?)"\]/)?.[1] ?? "");
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    setMeta('meta[name="description"]', "name",
      "Полный разбор цен на водительские права в Испании в 2026 году: пошлина DGT 94,05€ и когда её платят повторно, автошкола, медкомиссия, пересдачи. Калькулятор бюджета."
    );
    setMeta('meta[property="og:title"]', "property", "Цены на водительские права в Испании 2026 + Калькулятор");
    setMeta('meta[property="og:image"]', "property", "https://sdadim.eu/assets/blog/tseny-na-prava.jpg");
    setMeta('meta[property="og:url"]', "property", "https://sdadim.eu/blog/tseny-na-prava");
    setMeta('meta[property="og:type"]', "property", "article");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://sdadim.eu/blog/tseny-na-prava";

    return () => { document.title = prev; };
  }, []);
}

// ─── Calculator Component ──────────────────────────────────────────────────
// Вся математика — в @/lib/license-costs (общая с квизом на главной и migran.es)

const PLANS = getPlans();
const SCHOOL = "school";

function Stepper({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4].map((num) => (
          <button key={num} role="radio" aria-checked={value === num} onClick={() => onChange(num)}
            className={cn("w-10 h-10 rounded-lg text-sm font-bold transition-all", value === num ? "bg-amber-500 text-black" : "bg-slate-100 text-slate-900 hover:bg-slate-200")}>
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

function CostsCalculator() {
  const [theoryChoice, setTheoryChoice] = useState<string>(PLANS[0].id);
  const [lessons, setLessons] = useState(20);
  const [theoryTry, setTheoryTry] = useState(1);
  const [drivingTry, setDrivingTry] = useState(1);

  const plan = PLANS.find((p) => p.id === theoryChoice);
  const theory = plan
    ? { label: `Курс Сдадим, «${plan.name}»`, price: plan.price }
    : { label: "Пакет теории в автошколе", price: MARKET.schoolTheory };

  const current = budget({ theory, lessons, theoryTry, drivingTry });
  const firstTry = budget({ theory, lessons, theoryTry: 1, drivingTry: 1 });
  const retakes = round(current.total - firstTry.total);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 my-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Euro className="w-6 h-6 text-emerald-600" /> Калькулятор стоимости прав 2026
        </h3>
        <p className="text-sm text-slate-600 mt-2">Полный бюджет с пересдачами и повторной пошлиной DGT</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Контролы */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 self-start">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Как готовитесь к теории</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Как готовитесь к теории">
              {[...PLANS.map((p) => ({ id: p.id, label: p.name, price: p.price })), { id: SCHOOL, label: "Автошкола", price: MARKET.schoolTheory }].map((o) => (
                <button key={o.id} role="radio" aria-checked={theoryChoice === o.id} onClick={() => setTheoryChoice(o.id)}
                  className={cn("rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    theoryChoice === o.id ? "border-emerald-500 bg-emerald-500/10 text-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="text-xs text-slate-500">{o.id === SCHOOL ? "≈ " : ""}{o.price} €</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between mb-2">
              <label htmlFor="calc-lessons" className="text-sm font-semibold text-slate-700">Уроки вождения (по 45 мин)</label>
              <span className="text-sm font-bold text-emerald-600 tabular-nums">{lessons}</span>
            </div>
            <input id="calc-lessons" type="range" min="0" max="60" value={lessons}
              onChange={(e) => setLessons(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
            <p className="text-xs text-slate-500 mt-2">Опытному водителю — 2–5 уроков, новичку — от 20.</p>
          </div>

          <Stepper label="С какой попытки теория" hint="Экзамен DGT, 30 вопросов" value={theoryTry} onChange={setTheoryTry} />
          <Stepper label="С какой попытки вождение" hint="Экзамен в городе" value={drivingTry} onChange={setDrivingTry} />

          {current.nTasas > 1 && (
            <div className="text-xs text-red-600 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              ⚠️ Одна пошлина покрывает два провала. У вас их {theoryTry - 1 + drivingTry - 1} — пошлин понадобится {current.nTasas} (+{eur(TASA_DGT * (current.nTasas - 1))}).
            </div>
          )}
        </div>

        {/* Результат */}
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
            <p className="text-sm text-slate-600 mb-1">Итого</p>
            <p className="text-4xl font-bold text-slate-900 tabular-nums">{eur(current.total)}</p>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              {current.rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-4">
                  <span>{r.label}{r.note && <span className="text-slate-400"> · {r.note}</span>}</span>
                  <span className="tabular-nums whitespace-nowrap">{eur(r.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">Всё с первого раза</p>
              <p className="text-xl font-bold text-emerald-600 tabular-nums">{eur(firstTry.total)}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">Пересдачи стоят</p>
              <p className={cn("text-xl font-bold tabular-nums", retakes > 0 ? "text-red-600" : "text-slate-400")}>
                {retakes > 0 ? `+${eur(retakes)}` : "0 €"}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Цены автошколы — средние по Испании: запись {MARKET.matricula} €, урок {MARKET.lesson} €, выставление на экзамен {MARKET.examPresentation} €. Пошлина DGT {eur(TASA_DGT)} — официальная.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────

export default function ArticleCosts() {
  useSEO();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          <main className="lg:col-span-8">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Все статьи
            </Link>

            <div className="mb-8">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full mb-4">
                Финансы
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Сколько реально стоят водительские права в Испании в 2026 году?
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Получение водительских прав в Испании предполагает несколько статей расходов, некоторые из которых можно избежать (привет, матрикула!), а другие зависят от вашей подготовки и дотошности автошколы. Разбираем всё до копейки.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Обновлено 30 сентября 2026</span>
                <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> Актуально на 2026 год</span>
              </div>
            </div>

            <ArticleImage
              src="/assets/blog/tseny-na-prava.jpg"
              alt="Стоимость получения прав в Испании, калькулятор и деньги"
              caption="Официальная пошлина DGT на 2026 год составляет 94.05€. Всё остальное — ценообразование автошкол."
              fullWidth
            />

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200">
              Из чего состоят базовые траты?
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Вам нужно понимать, что в Испании нет системы "заплатил один раз за всё и забыл". У вас будут постоянные мини-траты при каждом шаге. Пройдемся по списку от самых скрытых до самых очевидных.
            </p>

            <ArticleCardGrid cols={2} cards={[
              {
                icon: "📝",
                title: "Матрикула (Matrícula)",
                description: "Своеобразная плата за регистрацию. Она не покрывает обучение, а просто 'открывает доступ'.",
                badge: "От 80€ до 220€",
              },
              {
                icon: "🚘",
                title: "Выставление на экзамен",
                description: "Автошкола везёт вас на экзамен по вождению на своей машине с двойными педалями и инструктором. Платите за КАЖДУЮ попытку.",
                badge: "В среднем 70€ за попытку",
              },
              {
                icon: "🩺",
                title: "Медкомиссия (Psicotécnico)",
                description: "Обязательная справка из медцентра — без неё DGT не допустит к экзамену. Цену назначает центр.",
                badge: "Около 45€",
              },
              {
                icon: "⚖️",
                title: "Tasa DGT (Tasa 2.1)",
                description: "Официальный сбор государства. Действует до второго проваленного экзамена — сданный экзамен попытку не тратит.",
                badge: "Строго 94,05 €",
              },
            ]} />

            <ArticleCallout type="warning" title="Как работает Tasa DGT">
              Пошлина 94,05€ даёт <strong>две convocatorias</strong> — то есть право на два провала (RD 818/2009, art. 50). Сданный экзамен попытку не тратит: теория с 1-го раза → на вождение остаются 2 попытки. Автошколы говорят «3 convocatorias», имея в виду то же самое. Но если вы провалили теорию дважды, для третьей попытки пошлину придётся оплатить заново — ещё 94,05€.
            </ArticleCallout>

            {/* Внедрим калькулятор прямо сюда */}
            <CostsCalculator />

            <ArticleDivider label="Можно ли сэкономить?" />

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-200">
              Как не переплатить "посредникам"?
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Самый большой вычет из вашего кошелька — это бесконечные пошлины за пересдачу (Renovación de Papeles) и матрикула в классических автошколах. Если вы выбрали испанскую автошколу, готовьтесь платить за каждый чих.
            </p>

            <ArticleAccordion
              title="За что мы в Sdadim НЕ берем деньги"
              items={[
                {
                  question: "Есть ли у вас Матрикула?",
                  answer: "Нет. Вы платите только за курс — без регистрационных сборов. Матрикулу за практику берёт автошкола, в которой вы будете водить: сравнивайте школы, где она входит в пакет уроков.",
                },
                {
                  question: "Сколько стоят практические уроки?",
                  answer: "При покупке нашего курса вы получаете 3 урока бесплатно. Остальные вы оплачиваете строго за откатанное время без переплат.",
                },
              ]}
            />
            
            <div className="mt-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-900">Резюме 2026 года</h3>
              </div>
              <p className="text-slate-700 mb-0">
                Новичок, всё с первого раза, 20 уроков вождения, теория с Сдадим: <br/><strong className="text-slate-900 text-xl">около 1 300 €</strong>.
                <br /><br />
                Тот же новичок, теория в автошколе, 40 уроков, теория и вождение с 3-й попытки (3 пошлины DGT): <br/><strong className="text-red-600 text-xl">около 2 500 €</strong>.
              </p>
              <br />
              <p className="text-emerald-600 font-bold">Разница — почти целиком пересдачи и лишние уроки. Поэтому хорошая подготовка к теории до начала практики — самый дешёвый способ не переплатить.</p>
            </div>

          </main>

          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Факт DGT</p>
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm text-slate-700 mb-0">
                  <strong className="text-slate-900">94,05 €</strong> — Tasa 2.1 на экзамены на права в 2026 году. Одна пошлина покрывает два проваленных экзамена; третий провал — новая пошлина.
                </p>
              </div>

              {/* Banner */}
              <ArticleBanner variant="compact" basePrice={199} />

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
