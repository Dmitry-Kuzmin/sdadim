/**
 * Статья: Поддельные права в Испании
 * SEO: "поддельные права испания", "штраф за езду без прав испания", "купить права в испании последствия"
 * Маршрут: /blog/poddelnyye-prava-ispaniya
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  ArticleAccordion,
  ArticleCallout,
  ArticleQuote,
  ArticleTable,
  ArticleTabs,
  ArticleList,
  ArticleCardGrid,
  ArticleDivider,
  ArticleImage,
  ArticleStats,
  ArticleBanner,
  ArticleSpoiler,
} from "@/components/ui/article";


// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ArticleFakeLicense() {

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          {/* ── Main ─────────────────────────────────────────────────── */}
          <main className="lg:col-span-8">

            {/* Breadcrumb */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Все статьи
            </Link>

            {/* Header */}
            <div className="mb-8">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full mb-4">
                Закон и Штрафы
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Поддельные права в Испании: тюрьма, штрафы и единственный легальный путь
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Сегодня в Испании всё чаще встречаются случаи использования поддельных водительских прав. Люди идут на это, чтобы избежать «сложных» экзаменов. Но стоит ли этот шаг свободы и огромных долгов? Разбираем реальные последствия.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 2 апреля 2025</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 7 мин чтения</span>
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-600/70" /> Важная информация</span>
              </div>
            </div>

            {/* Cover */}
            <ArticleImage
              src="/assets/blog/poddelnyye-prava-ispaniya.jpg"
              alt="Поддельные права и наручники на мокром асфальте Испании"
              caption="Вождение с поддельными правами — это не административное, а уголовное преступление по законам Испании."
              fullWidth
            />

            {/* Intro stats */}
            <ArticleStats stats={[
              { value: "До 3 лет", label: "Тюремный срок", note: "статья 392 УК Испании" },
              { value: "24 мес.",    label: "Макс. штраф",     note: "штрафные дни" },
              { value: "0€",    label: "Страховая выплата",note: "отказ в покрытии ДТП" },
              { value: "100%",    label: "Вероятность",      note: "выявления DGT" },
            ]} />

            <ArticleCallout type="danger" title="Коротко о главном">
              В Испании нет понятия «купить права безопасно». Базы DGT (Главного управления дорожного движения) полностью цифровизированы. Любая проверка документов полицией моментально выявит подделку.
            </ArticleCallout>

            {/* Нативная реклама #1 */}
            <ArticleBanner variant="compact" basePrice={199} />

            <ArticleDivider label="Суровая реальность" />

            {/* ── РАЗДЕЛ 1 ── */}
            <h2 id="pochemu-vibyrayut" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Почему люди вообще покупают «левые» права?
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Основные причины, по которым многие (особенно приезжие) решаются на покупку, до банального просты: языковой барьер, страх не сдать теорию на испанском, нежелание тратить время на автошколу. Мошенники в Telegram обещают «завести в базу» и прислать пластик за пару дней.
            </p>

            <ArticleQuote
              text="Меня уверяли, что права 100% проводятся по базе DGT, так как у них 'свои люди' в автошколе. При первой же рутинной проверке Гвардией Сивиль меня заковали в наручники прямо на трассе."
              author="Из судебного архива"
              role="Реальный отзыв пострадавшего"
            />
            
            <p className="text-[15px] text-slate-700 leading-[1.85] mt-4 mb-4">
              Запомните: DGT — одна из самых защищенных структур Испании. Сделать поддельную запись в государственном реестре Испании через «знакомого» — миф, придуманный мошенниками для выкачивания денег.
            </p>

            {/* ── РАЗДЕЛ 2 ── */}
            <h2 id="nakazanie" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Что грозит за поддельные права в Испании?
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              В Испании человек с поддельными правами совершает сразу два преступления. Это не просто штраф, как за превышение скорости, это Уголовный кодекс.
            </p>

            <ArticleTabs tabs={[
              {
                label: "Уголовное наказание",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p><strong className="text-red-600">Преступление: Подделка документов (Falsedad documental)</strong></p>
                    <p>Согласно статье 392 Уголовного кодекса Испании, использование поддельного официального документа (Permiso de conducir) карается:</p>
                    <ArticleList type="cross" items={[
                      "Тюремным заключением сроком от 6 месяцев до 3 лет.",
                      "Штрафом (multa) на срок от 6 до 12 месяцев (сумма зависит от ваших доходов)."
                    ]} />
                  </div>
                ),
              },
              {
                label: "Езда без прав",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p><strong className="text-red-600">Преступление: Вождение без действующей лицензии</strong></p>
                    <p>Так как пластик фальшивый, для закона у вас ПРАВ НЕТ. Статья 384 УК Испании:</p>
                    <ArticleList type="cross" items={[
                      "Тюремное заключение от 3 до 6 месяцев.",
                      "ИЛИ штраф на срок от 12 до 24 месяцев.",
                      "ИЛИ общественные работы от 31 до 90 дней."
                    ]} />
                  </div>
                ),
              },
              {
                label: "Финансовая катастрофа",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p><strong className="text-red-600">Отказ страховой компании при ДТП</strong></p>
                    <p>Если вы попадете в аварию, страховая признает полис недействительным из-за отсутствия у вас лицензии. Все расходы (сотни тысяч евро при наличии пострадавших) лягут лично на вас.</p>
                  </div>
                ),
              },
            ]} />


            {/* ── РАЗДЕЛ 3 ── */}
            <h2 id="kak-legalno" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Единственное решение: легальное получение
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Получить законные испанские права проще, чем разбираться с уголовными делами. Вам не нужно идеально знать испанский — готовиться можно на понятном языке с нашей платформой.
            </p>

            <ArticleCardGrid cols={2} cards={[
              {
                icon: "🧠",
                title: "Теория на русском",
                description: "Понятное объяснение сложной испанской терминологии, ПДД и ловушек DGT.",
                badge: "Легко понять",
              },
              {
                icon: "🚗",
                title: "3 бесплатных урока",
                description: "При записи на полный курс вы получаете стартовую практику для преодоления страха перед авто.",
                badge: "Бонус",
              },
              {
                icon: "📱",
                title: "Тренажер AI",
                description: "Тестирование как на реальном экзамене с разбором ошибок от искусственного интеллекта.",
                badge: "100% эффективность",
              },
              {
                icon: "🛡",
                title: "Официально",
                description: "Вы в базе DGT, вы сдаете экзамен и получаете легальный пластик от государства.",
                badge: "Без риска",
              },
            ]} />

            <ArticleCallout type="success" title="Зачем рисковать?">
              На наших курсах с первого раза сдают 90% студентов. Мы сопровождаем вас на всех этапах: от автошколы и психотеста до экзамена с компьютером DGT.
            </ArticleCallout>

            {/* Нативная реклама #2 */}
            <ArticleBanner variant="default" basePrice={199} />

            <ArticleDivider />

            {/* ── Итоговый чеклист ── */}
            <h2 id="chekList" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Короткий чек-лист здравого смысла
            </h2>

            <ArticleList type="number" items={[
              "Заблокируйте Telegram-ботов, предлагающих «права за 500 евро без экзамена».",
              "Оцените реальную стоимость проблем: тюрьма, долги перед страховой, депортация.",
              "Запишитесь на легальную подготовку — мы поможем всё сдать без стресса."
            ]} />

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-600 mb-2">Знаете кого-то, кто хочет рискнуть?</p>
              <p className="text-sm text-slate-400">Отправьте им эту статью. Возможно, это спасет их от реального срока. 🙌</p>
            </div>

          </main>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">

              {/* TOC */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Содержание</p>
                <nav className="space-y-2 text-sm">
                  {[
                    ["#pochemu-vibyrayut",  "Почему покупают права?"],
                    ["#nakazanie",  "Уголовная ответственность"],
                    ["#kak-legalno", "Получить легально"],
                    ["#chekList",        "Чеклист"],
                  ].map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      className="block text-slate-600 hover:text-slate-900 transition-colors leading-snug"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Mini CTA */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <p className="text-slate-900 font-bold text-sm">Безопасный путь</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Сэкономьте свои нервы и деньги. Подготовьтесь к экзамену DGT на русском языке и сдайте его законно.
                </p>
                <a
                  href="https://t.me/skilyapp_bot?start=course"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Начать учиться прямо сейчас →
                </a>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
