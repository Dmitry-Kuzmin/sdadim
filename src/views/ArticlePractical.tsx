/**
 * Статья: Как сдать практический экзамен по вождению с первого раза
 * SEO: "практический экзамен вождение испания", "как сдать с первого раза", "советы", "экзаменатор", "ловушки"
 * Маршрут: /blog/prakticheskiy-ekzamen
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle2, Navigation } from "lucide-react";
import {
  ArticleAccordion,
  ArticleCallout,
  ArticleQuote,
  ArticleTabs,
  ArticleList,
  ArticleCardGrid,
  ArticleDivider,
  ArticleImage,
  ArticleStats,
  ArticleBanner,
} from "@/components/ui/article";


// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ArticlePractical() {

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
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full mb-4">
                Практика DGT
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Как сдать практический экзамен по вождению с первого раза: секреты и ловушки
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Получение водительских прав в Испании — это не только важный шаг, но и серьёзное испытание нервов. Многие заваливают тест не из-за неумения водить, а из-за психологического давления и хитрых задач экзаменатора. Разбираем алгоритм успешной сдачи.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 3 апреля 2025</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 10 мин чтения</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Проверено инструкторами Sdadim</span>
              </div>
            </div>

            {/* Cover */}
            <ArticleImage
              priority
              src="/assets/blog/prakticheskiy-ekzamen.jpg"
              alt="Вид из салона машины во время экзамена по вождению в Испании"
              caption="Инспектор с планшетом всегда оценивает не только технику, но и уверенность ваших действий."
              fullWidth
            />

            {/* Intro stats */}
            <ArticleStats stats={[
              { value: "30-45", label: "Минут экзамена", note: "стандартная длительность" },
              { value: "48%",   label: "Сдают сразу",    note: "в среднем по стране" },
              { value: "10",    label: "Лёгких ошибок (Leves)", note: "максимальный лимит" },
              { value: "1",     label: "Грубая ошибка",   note: "Eliminatoria = сразу провал" },
            ]} />

            <ArticleDivider label="До запуска двигателя (Comprobaciones previas)" />

            {/* ── РАЗДЕЛ 1: ВОПРОСЫ ── */}
            <h2 id="voprosy-ekzamenatora" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              1. Неожиданный допрос до старта
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Экзамен начинается ещё до того, как вы пристегнули ремень. Экзаменатор может (и имеет право) попросить вас показать базовые элементы автомобиля. Если вы путаетесь на этом этапе — нервозность обеспечена.
            </p>

            <ArticleTabs tabs={[
              {
                label: "Под капотом",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>Экзаменатор спросит: <strong className="text-slate-900">"¿Dónde está la varilla del aceite?"</strong> (Где щуп для масла?).</p>
                    <ArticleList type="check" items={[
                      "Знать, где капот и как его открыть из салона",
                      "Знать цвет щупа уровня масла (обычно желтый или оранжевый)",
                      "Показать бачок омывающей жидкости (жидкость для стекол)",
                      "Показать бачок с охлаждающей жидкостью (Антифриз)",
                    ]} />
                  </div>
                ),
              },
              {
                label: "Свет и датчики",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>Экзаменатор попросит: <strong className="text-slate-900">"Encienda las luces de cruce"</strong> (Включите ближний свет).</p>
                    <ArticleList type="check" items={[
                      "Безошибочно переключать габариты (posición), ближний (cruce) и дальний (carretera)",
                      "Знать, как включить противотуманки (niebla)",
                      "Знать, как включить аварийку (luces de emergencia)",
                    ]} />
                  </div>
                ),
              },
              {
                label: "Управление",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>Могут попросить: <strong className="text-slate-900">"Desbloquee el volante"</strong> (Разблокируйте руль).</p>
                    <p>Вы должны уметь одной рукой покачивать руль, а другой плавно поворачивать ключ в замке зажигания, чтобы снять блокировку рулевой колонки.</p>
                  </div>
                ),
              },
            ]} />


            {/* ── РАЗДЕЛ 2: ПСИХОЛОГИЯ ── */}
            <h2 id="nastroy-i-posadka" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              2. Рутина, которая спасает нервы
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Нервозность — ваш главный враг. Если вы чувствуете, что дрожат колени — попросите: <strong className="text-emerald-600">"Un momento, por favor, estoy un poco nervioso"</strong>. Вам дадут выдохнуть, это абсолютно нормально.
            </p>
            
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Далее, чтобы всё прошло гладко, проведите ритуал настроек рабочего места (оценивается экзаменатором!):
            </p>

            <ArticleCardGrid cols={3} cards={[
              {
                icon: "🪑",
                title: "Сиденье",
                description: "Спина ровно, при выжатом сцеплении нога должна оставаться чуть согнутой.",
              },
              {
                icon: "🪞",
                title: "Зеркала",
                description: "Настраиваем салонное (всё заднее окно) и боковые (лишь край своей машины).",
              },
              {
                icon: "🔒",
                title: "Ремень",
                description: "Только после настроек зеркал. Если тронетесь без ремня — Elimintaoria (провал).",
              },
            ]} />

            {/* Баннер курса внутри */}
            <ArticleBanner variant="compact" basePrice={199} />

            <ArticleDivider label="На дороге (Circulación)" />

            {/* ── РАЗДЕЛ 3: МАРШРУТ ── */}
            <h2 id="staruem" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              3. Заводим авто и стартуем
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Правильный запуск показывает уверенность: выжмите сцепление (если механика), убедитесь что коробка в "нейтрали", ручник затянут. Перед тем как тронуться, обязательно посмотрите в левое зеркало и <strong>поверните голову</strong> (мертвая зона!). Экзаменатор очень следит за движением вашей шеи, а не только глаз.
            </p>

            <ArticleQuote
              text="Отсутствие поворота головы при перестроении или старте — одна из самых частых причин получения пунктов 'Falta Deficiente' на экзамене в Испании."
              author="Sdadim"
              role="Совет от автошколы"
            />

            {/* ── РАЗДЕЛ 4: ЛОВУШКИ ── */}
            <h2 id="lovushki" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              4. Остерегайтесь «Ловушек» экзаменатора
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Инспекторы (Examinadores) могут давать инструкции, которые формально приведут к нарушению ПДД. Их задача — проверить, слепо ли вы подчиняетесь или думаете своей головой.
            </p>

            <ArticleAccordion
              title="Частые ловушки (Las trampas del examinador)"
              items={[
                {
                  question: "\"Припаркуйтесь вон там, где есть место\"",
                  answer: "Место может быть зоной для инвалидов (синяя/белая разметка и знак), автобусной остановкой или Vado Permanente (выезд из гаража). Ваша реакция: \"Там парковаться запрещено, я проеду дальше и найду легальное место\".",
                },
                {
                  question: "\"На следующем перекрестке поверните направо\"",
                  answer: "Вы подъезжаете и видите знак «Въезд запрещен» (кирпич) или обязательное движение только прямо/налево. Ваша реакция: игнорируете команду инструктора и едете по знакам, сказав \"Туда нельзя, знак запрещает\".",
                },
                {
                  question: "\"Перестройтесь в левый ряд\"",
                  answer: "Вы пытаетесь перестроиться через сплошную линию (línea continua). Это грубая ошибка! Подождите, пока линия не станет прерывистой (discontinua) и только тогда выполняйте маневр.",
                },
              ]}
            />

            {/* ── РАЗДЕЛ 5: ПРАКТИКА И ОШИБКИ ── */}
            <h2 id="sistemnaya-podgotovka" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              5. Главное правило: не спешите (Sin prisa)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Экзаменатор оценивает не скорость, а плавность и предсказуемость. Одна из самых частых ошибок — поспешное выкатывание на перекрестки и круговые (Glorietas) без полного контроля происходящего.
            </p>
            
            <ArticleList type="cross" items={[
              "Остановка не доезжая линии СТОП. Нужно останавливаться БУКВАЛЬНО перед самой линией.",
              "Проезд пешеходного перехода, когда пешеход только поставил ногу на зебру.",
              "Превышение скорости. (В Испании строгий лимит: 30 км/ч в городе, 50 км/ч на широких проспектах).",
            ]} />
            
            <p className="text-[15px] text-slate-700 leading-[1.85] mt-4 mb-4">
              <strong>Совет Sdadim:</strong> Лучший способ подготовиться — изучить маршруты, где будет проходить экзамен именно в вашем городе (Zona de examen). Спросите о них инструктора автошколы — он знает типовые маршруты.
            </p>

            <ArticleDivider />

            {/* Финальный CTA */}
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-500/10 border border-blue-500/20 rounded-2xl p-6 lg:p-10 text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Сначала — теория с первого раза</h3>
              <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
                Систематическая подготовка — залог успеха. Мы понимаем, насколько важно сдать с первого раза. Получите теорию на понятном русском языке, интерактивного ИИ-репетитора и поддержку от начала и до самого получения прав.
              </p>
              <a
                href="https://t.me/skilyapp_bot?start=course"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto text-lg"
              >
                <Navigation className="w-5 h-5 -ml-1" />
                Начать обучение в Sdadim
              </a>
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
                    ["#voprosy-ekzamenatora",  "Допрос до старта"],
                    ["#nastroy-i-posadka",     "Посадка и нервы"],
                    ["#staruem",               "Запуск авто"],
                    ["#lovushki",              "Ловушки инспектора"],
                    ["#sistemnaya-podgotovka",  "Частные ошибки"],
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
              

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
