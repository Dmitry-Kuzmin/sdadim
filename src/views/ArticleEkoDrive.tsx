/**
 * Статья: Экономичное вождение — 13 техник
 * SEO: "экономичное вождение", "как сэкономить топливо", "вопросы DGT расход топлива"
 * Маршрут: /blog/ekonomichnoe-vozhdenie
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Fuel, Gauge } from "lucide-react";
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
  ArticleComparison,
  ArticleSpoiler,
} from "@/components/ui/article";
import { ArticleQuizBlock, ECO_DRIVING_QUESTIONS } from "@/components/ui/article-quiz";


// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ArticleEkoDrive() {

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
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full mb-4">
                Подготовка к DGT
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Экономичное вождение: 13 техник для снижения расхода топлива на&nbsp;20–30%
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Многие водители сливают деньги в буквальном смысле — через педаль газа. Разбираем научно
                обоснованные техники eco-driving, которые легко применить сегодня, и объясняем, почему
                «советы бывалых» про нейтралку — опасная чушь. Всё это — обязательная тема на&nbsp;экзамене&nbsp;DGT.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 1 апреля 2025</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 9 мин чтения</span>
                <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> Тема DGT: économie de carburant</span>
              </div>
            </div>

            {/* Cover */}
            <ArticleImage
              src="/assets/blog/ekonomichnoe-vozhdenie.jpg"
              alt="Экономичное вождение на испанской трассе при закате"
              caption="Техника eco-driving особенно важна на шоссе, где аэродинамическое сопротивление съедает до 40% топлива"
              fullWidth
            />

            {/* Intro stats */}
            <ArticleStats stats={[
              { value: "20–30%", label: "Экономия топлива", note: "при правильной технике" },
              { value: "10%",    label: "Давление шин",     note: "спущенные = +10% расхода" },
              { value: "20%",    label: "Засорённый фильтр",note: "растёт расход при грязном фильтре" },
              { value: "25%",    label: "Кондиционер",      note: "экономия vs опущенные окна на трассе" },
            ]} />

            <ArticleCallout type="tip" title="Почему это важно для экзамена DGT">
              Тема экономичного и экологичного вождения входит в официальную программу экзамена DGT.
              В базе вопросов около <strong>40 вопросов про эко-вождение</strong> — вы точно столкнётесь с ними на тесте.
              Понимание логики, а не зазубривание ответов, даст вам правильный ответ в любой формулировке.
            </ArticleCallout>

            {/* Нативная реклама #1 — компактная, незаметная */}
            <ArticleBanner variant="compact" basePrice={199} />

            <ArticleDivider label="12 техник экономичного вождения" />

            {/* ── ТЕХНИКА 1 ── */}
            <h2 id="plavniy-razgon" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              1. Плавный разгон — педаль как кран топлива
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Думайте о педали акселератора как о кране. Чем сильнее нажимаете — тем шире открываете
              поток топлива в двигатель. Резкий разгон с места потребляет в 3–4 раза больше топлива, чем плавный.
            </p>

            <ArticleCallout type="info">
              Оптимальная зона работы двигателя — <strong>1600–2500 об/мин</strong>. Бензиновому двигателю
              нижняя граница — около 2000 об/мин, дизельному — около 1500. Езда на слишком низких оборотах
              (детонация) тоже <em>увеличивает</em> расход.
            </ArticleCallout>

            <ArticleList type="check" items={[
              "Разгоняйтесь не более чем наполовину хода педали",
              "Плавно увеличивайте нажатие — не «бросайте» газ резко",
              "Переключайтесь на повышенную передачу как только позволяют обороты",
              "При трогании на светофоре — первые 5 секунд особенно важны",
            ]} />

            {/* ── ТЕХНИКА 2 ── */}
            <h2 id="chtenie-dorogi" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              2. «Чтение дороги» — взгляд вдаль
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Это фундаментальная техника, которой владеют единицы. Суть проста: смотрите далеко вперёд —
              на 10–15 секунд движения, — а не на капот автомобиля. Это позволяет предвидеть ситуации
              и <strong>реагировать двигателем, а не тормозом</strong>.
            </p>

            <ArticleQuote
              text="Если вы видите красный сигнал за 200 метров — уберите ногу с газа, и машина сама замедлится. Тормоз = потеря кинетической энергии, которую вы купили за топливо."
              author="Принцип eco-driving"
              role="одобрен DGT Испании"
            />

            <p className="text-[15px] text-slate-700 leading-[1.85] mt-4 mb-4">
              Практический эффект: при «чтении дороги» среднестатистический водитель тормозит на 40% реже,
              что напрямую снижает расход и износ тормозных колодок.
            </p>

            {/* ── ТЕХНИКА 3 ── */}
            <h2 id="skatyvanie-inertsiya" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              3. Инерция — бесплатные километры
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Когда машина едет по инерции при включённой передаче и убранной ноге с газа — двигатель
              <strong> не потребляет топливо</strong>. Электроника перекрывает форсунки полностью.
              Это называется «режим торможения двигателем» (engine braking).
            </p>

            <ArticleCallout type="warning" title="Распространённая ошибка">
              Многие тормозят «на всякий случай» на развязках и съездах с шоссе. Если дорога свободна
              и скорость безопасна — просто уберите ногу с газа. Машина замедлится сама, а топливо не потратится.
            </ArticleCallout>

            <ArticleTabs tabs={[
              {
                label: "Пример: шоссе",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>Вы едете 120 км/ч по шоссе. Впереди медленная фура.</p>
                    <p><strong className="text-red-600">❌ Неправильно:</strong> жмёте тормоз, сбрасывая скорость до 90 км/ч → потеряли кинетическую энергию, купленную за топливо.</p>
                    <p><strong className="text-emerald-600">✓ Правильно:</strong> увидели фуру за 500 м → убрали ногу с газа → машина сама замедлилась до нужной скорости без тормоза.</p>
                  </div>
                ),
              },
              {
                label: "Пример: светофор",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>Едете 50 км/ч в городе, видите красный через 150 м.</p>
                    <p><strong className="text-red-600">❌ Неправильно:</strong> продолжаете ехать до последнего, потом бьёте по тормозам.</p>
                    <p><strong className="text-emerald-600">✓ Правильно:</strong> сразу убираете газ, машина катится до светофора. Если за это время включается зелёный — не нужно даже полностью останавливаться.</p>
                  </div>
                ),
              },
              {
                label: "Пример: спуск",
                content: (
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>Крутой спуск на горном серпантине.</p>
                    <p><strong className="text-red-600">❌ Неправильно:</strong> выжимаете сцепление и едете на нейтрали — двигатель тратит топливо на холостой ход, и нет engine braking.</p>
                    <p><strong className="text-emerald-600">✓ Правильно:</strong> держите включённую пониженную передачу без газа — двигатель не потребляет топливо и тормозит одновременно.</p>
                  </div>
                ),
              },
            ]} />

            {/* ── ТЕХНИКА 4 ── */}
            <h2 id="skorost" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              4. Скорость и аэродинамика: почему 120 ≠ 150
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              На трассе аэродинамическое сопротивление растёт <strong>в квадрате от скорости</strong>.
              Это значит, что при увеличении скорости со 100 до 150 км/ч сопротивление воздуха
              растёт в 2,25 раза. Не линейно — экспоненциально.
            </p>

            <ArticleTable
              headers={["Скорость", "Расход (пример)", "Сопротивление", "Разница"]}
              rows={[
                ["90 км/ч",  "4,8 л/100 км", "базовое",       "−17% к норме"],
                ["100 км/ч", "5,5 л/100 км", "+23% к 90",     "норма"],
                ["120 км/ч", "6,0 л/100 км", "+78% к 90",     "+9% к норме"],
                ["130 км/ч", "6,8 л/100 км", "+108% к 90",    "+24% к норме"],
                ["150 км/ч", "7,5 л/100 км", "+178% к 90",    "+36% к норме"],
              ]}
              caption="Данные усреднены для автомобиля класса C с двигателем 1.5л. Реальные значения зависят от модели."
            />

            <ArticleCallout type="success" title="Практический вывод">
              Снижение скорости со 130 до 110 км/ч на загородной трассе экономит около <strong>1,2 л / 100 км</strong>.
              При пробеге 15 000 км/год это <strong>180 литров</strong> — или около <strong>€270 в год</strong> при цене €1,5/л.
            </ArticleCallout>

            {/* Нативная реклама #2 — в середине длинной статьи */}
            <ArticleBanner variant="default" basePrice={199} />

            {/* ── МИФЫ ── */}
            <h2 id="mify" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              5. Мифы «бывалых» водителей — разбираем по пунктам
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-6">
              Интернет полон «советов», которые не только не экономят, но и опасны. Проверяем каждый.
            </p>

            <ArticleAccordion
              title="Популярные мифы об экономии топлива"
              items={[
                {
                  question: "«На нейтрали под гору — экономишь топливо»",
                  answer: "МИФ. На нейтральной передаче двигатель вынужден поддерживать холостой ход и потребляет 0,5–1,0 л/100 км. При включённой передаче и убранной ноге с газа форсунки закрыты полностью — расход = 0. Плюс на нейтрали нет торможения двигателем, поэтому придётся тормозить педалью — это износ колодок и безопасность.",
                },
                {
                  question: "«Глуши двигатель на спуске»",
                  answer: "ОПАСНО. Никогда не выключайте двигатель во время движения. Без работающего двигателя пропадает гидроусилитель руля (нужно в разы больше усилий для поворота) и усилитель тормозов (педаль становится «деревянной», а эффективность торможения падает критически). Это нарушение ПДД и прямая угроза жизни.",
                },
                {
                  question: "«Всегда езди на самой высокой передаче»",
                  answer: "МИФ. Слишком высокая передача при низких оборотах — это «натяжение» двигателя (детонация). Двигатель работает неэффективно и потребляет больше. Правило: переключайтесь на следующую передачу при достижении 2000–2500 об/мин, но не раньше, чем машина нормально едет.",
                },
                {
                  question: "«Выключай кондиционер, чтобы сэкономить»",
                  answer: "ЧАСТИЧНО ВЕРНО: только на малых скоростях. В городе при скорости до 60 км/ч — да, открытые окна эффективнее. На трассе (выше 80 км/ч) открытые окна создают аэродинамическое сопротивление, которое потребляет БОЛЬШЕ топлива, чем кондиционер. Вывод: в городе — окна, на трассе — кондиционер.",
                },
                {
                  question: "«Заправляйтесь утром — топливо плотнее и его будет больше»",
                  answer: "МИФ. Топливо хранится в подземных резервуарах при постоянной температуре. Разница между утренней и вечерней «плотностью» топлива в баке — менее 0,01%. Никакой практической разницы нет.",
                },
              ]}
            />

            {/* ── ОСТАЛЬНЫЕ ТЕХНИКИ ── */}
            <h2 id="obsluzhivanie" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              6–13. Ещё восемь факторов, которые вы недооцениваете
            </h2>

            <ArticleCardGrid cols={2} cards={[
              {
                icon: "🔧",
                title: "Техобслуживание",
                description: "Грязный воздушный фильтр, изношенные свечи или забитый катализатор могут увеличить расход на 15–20%. Соблюдайте регламент ТО.",
                badge: "+20% расхода",
              },
              {
                icon: "🔵",
                title: "Давление в шинах",
                description: "Спущенные шины (на 0,5 бар ниже нормы) увеличивают расход на 5–10% и ухудшают управляемость. Проверяйте холодные шины раз в месяц.",
                badge: "+10% расхода",
              },
              {
                icon: "🌡️",
                title: "Холодный двигатель",
                description: "Первые 5–10 км после холодного пуска двигатель потребляет в 1,5–2 раза больше. Объединяйте короткие поездки в одну — это экономит и топливо, и ресурс.",
                badge: "×2 расход",
              },
              {
                icon: "🎒",
                title: "Лишний вес",
                description: "Каждые 100 кг дополнительной нагрузки увеличивают расход примерно на 0,6 л/100 км. Uберите из багажника всё лишнее. Снимите багажник на крыше, когда не нужен.",
                badge: "+0,6л/100км",
              },
              {
                icon: "⏹️",
                title: "Stop & Start",
                description: "Система автоматически глушит двигатель на остановках. Если её нет — выключайте двигатель вручную при остановке дольше 60 секунд. Исключение: пробки с постоянным движением.",
                badge: "−8% в городе",
              },
              {
                icon: "🚗",
                title: "Аэродинамика",
                description: "Открытые окна на скорости 90+ км/ч действуют как «воздушный тормоз». На трассе всегда закрывайте окна и пользуйтесь кондиционером — это выгоднее.",
                badge: "Трасса > 80км/ч",
              },
            ]} />

            {/* Гибриды и электромобили */}
            <ArticleDivider label="Гибриды и электромобили" />

            <h2 id="gibrid-elektro" className="text-2xl font-bold text-slate-900 mt-6 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Особенности гибридов и электромобилей
            </h2>

            <ArticleTabs tabs={[
              {
                label: "🔋 Гибрид (HEV / PHEV)",
                content: (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>В гибридах электродвигатель отвечает за начало движения — именно в этот момент ДВС потребляет больше всего. Чтобы не дать ДВС включиться при трогании:</p>
                    <ArticleList type="number" items={[
                      "Трогайтесь очень медленно и плавно — дайте мотору «уехать на электричестве»",
                      "Избегайте резких нажатий педали газа в первые секунды",
                      "Используйте режим EV в городе при наличии заряда",
                      "При торможении отпускайте педаль заранее — рекуперация заряжает батарею",
                    ]} />
                  </div>
                ),
              },
              {
                label: "⚡ Электромобиль (BEV)",
                content: (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>Все вышеперечисленные принципы работают и для электромобилей, но есть особенности:</p>
                    <ArticleList type="check" items={[
                      "Электромобили эффективнее в городе, чем на трассе (в отличие от ДВС)",
                      "Рекуперация при торможении — ваш главный инструмент экономии",
                      "Кондиционер и обогреватель расходуют до 5% запаса хода — используйте предогрев/охлаждение пока на зарядке",
                      "На трассе аэродинамика имеет критическое значение: 130 vs 100 км/ч — разница запаса хода 20–25%",
                    ]} />
                  </div>
                ),
              },
            ]} />

            {/* Сравнение */}
            <ArticleComparison
              headerA="Обычный водитель"
              headerB="Eco-driver"
              rows={[
                { feature: "Разгон от светофора",          a: "Резкий, полный газ",     b: "Плавный, ½ хода педали"   },
                { feature: "Реакция на красный свет",      a: "Тормозит в последний момент", b: "Убирает газ за 150–200 м" },
                { feature: "Скорость на шоссе",            a: "130–150 км/ч",           b: "100–120 км/ч"              },
                { feature: "Спуск с горы",                 a: "Нейтраль / тормоз",      b: "Включённая передача без газа" },
                { feature: "Кондиционер на трассе",        a: "Открытые окна",           b: "Кондиционер + закрытые окна" },
                { feature: "Давление шин",                 a: "Проверяет редко",         b: "Раз в месяц по регламенту" },
                { feature: "Средний расход",               a: "8–10 л/100 км",          b: "5,5–7 л/100 км"            },
              ]}
            />

            <ArticleDivider />

            {/* DGT Quiz hints */}
            <h2 id="voprosy-dgt" className="text-2xl font-bold text-slate-900 mt-6 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Как эта тема встречается в вопросах DGT
            </h2>

            <ArticleCallout type="warning" title="Что спрашивают на экзамене">
              DGT не спрашивает «сколько литров потребляет автомобиль». Вопросы строятся на понимании
              принципов: почему нейтраль на спуске — это плохо, в каком диапазоне оборотов двигатель
              эффективнее, и почему нельзя глушить двигатель во время движения.
            </ArticleCallout>

            <ArticleSpoiler label="Типичные вопросы DGT по теме eco-driving (раскрыть)">
              <div className="space-y-4 text-sm text-slate-600">
                <div>
                  <p className="text-slate-900 font-semibold mb-1">Вопрос: При движении под гору с включённой передачей и убранной ногой с газа двигатель...</p>
                  <p>✓ <strong className="text-emerald-600">Не потребляет топливо</strong> — электроника закрывает форсунки, автомобиль тормозит двигателем.</p>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold mb-1">Вопрос: Использование кондиционера по сравнению с открытыми окнами на скорости более 80 км/ч...</p>
                  <p>✓ <strong className="text-emerald-600">Более экономично</strong> — открытые окна создают аэродинамическое сопротивление.</p>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold mb-1">Вопрос: Шины с давлением ниже рекомендованного...</p>
                  <p>✓ <strong className="text-emerald-600">Увеличивают расход топлива до 10%</strong> и ухудшают торможение.</p>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold mb-1">Вопрос: Можно ли выключить двигатель во время движения, чтобы сэкономить топливо?</p>
                  <p>✓ <strong className="text-red-600">Нет</strong> — это опасно, так как пропадает гидроусилитель руля и усилитель тормозов.</p>
                </div>
              </div>
            </ArticleSpoiler>

            {/* ── МИНИ-ТЕСТ DGT ── */}
            <h2 id="mini-test" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Мини-тест: проверь, понял ли ты тему
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-0">
              Пять реальных вопросов DGT по eco-driving. После каждого ответа — разбор AI-тренера.
              Именно такие формулировки встречаются на экзамене.
            </p>

            <ArticleQuizBlock
              questions={ECO_DRIVING_QUESTIONS}
              title="Тест DGT · Экономичное вождение"
              subtitle="5 реальных вопросов · AI-разбор после каждого ответа"
            />

            {/* Итоговый чеклист */}
            <h2 id="chekList" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Чеклист eco-driver: что сделать прямо сейчас
            </h2>

            <ArticleList type="number" items={[
              "Проверьте давление в шинах (холодные, утром до поездки)",
              "Уберите лишние вещи из багажника",
              "Снимите багажник на крыше, если не используете",
              "Проверьте дату последнего ТО (фильтр, свечи)",
              "Начните смотреть дальше вперёд при вождении — на 10–15 секунд",
              "Убирайте ногу с газа заранее при виде красного светофора или замедляющегося трафика",
              "На трассе держите в диапазоне 100–120 км/ч",
              "Используйте кондиционер вместо открытых окон на скорости выше 80 км/ч",
            ]} />

            {/* Финальный CTA баннер */}
            <ArticleBanner variant="default" basePrice={199} />

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-600 mb-2">Была полезна статья?</p>
              <p className="text-sm text-slate-400">Поделитесь ею с теми, кто готовится к экзамену DGT — они скажут спасибо на экзамене 🙌</p>
            </div>

          </main>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">

              {/* TOC */}
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Содержание</p>
                <nav className="space-y-2 text-sm">
                  {[
                    ["#plavniy-razgon",  "1. Плавный разгон"],
                    ["#chtenie-dorogi",  "2. Чтение дороги"],
                    ["#skatyvanie-inertsiya", "3. Инерция"],
                    ["#skorost",         "4. Скорость и аэродинамика"],
                    ["#mify",            "5. Мифы водителей"],
                    ["#obsluzhivanie",   "6–13. Другие факторы"],
                    ["#gibrid-elektro",  "Гибриды и электромобили"],
                    ["#voprosy-dgt",     "Вопросы DGT"],
                    ["#chekList",        "Чеклист eco-driver"],
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
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <p className="text-slate-900 font-bold text-sm">Готовься к DGT</p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Тема экономичного вождения — лишь один из 20+ разделов экзамена DGT. На нашем курсе
                  мы разбираем каждый с примерами и объяснениями на русском.
                </p>
                <a
                  href="https://t.me/skilyapp_bot?start=course"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Начать подготовку →
                </a>
              </div>

              {/* Stat card */}
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-3xl font-bold text-slate-900 mb-1">9/10</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">студентов сдают с первого раза</p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[11px] text-slate-400">14 успешных потоков · с 2022 года</p>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
