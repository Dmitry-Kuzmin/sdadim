/**
 * История: Как я сдавала практику по вождению в Испании — опыт из Малаги
 * SEO: "сдать практику вождения испания", "экзамен вождение малага", "практика dgt опыт",
 *      "испанские права история", "подготовка теория dgt онлайн"
 * Маршрут: /blog/istoriya-sdachi-prav-malaga
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle2 } from "lucide-react";
import {
  ArticleCallout,
  ArticleQuote,
  ArticleList,
  ArticleTable,
  ArticleDivider,
  ArticleStats,
  ArticleBanner,
} from "@/components/ui/article";


// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ArticleStoryMalaga() {

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
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full mb-4">
                История сдачи
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Как я сдавала практику по вождению в Испании: честная история из Малаги
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Теория — онлайн, практика — в местной автошколе, итог — ноль ошибок на экзамене DGT.
                739 евро и полгода времени. Рассказываю всё как есть, без прикрас.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 28 апреля 2025</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 8 мин чтения</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Личный опыт</span>
              </div>
            </div>

            {/* Intro stats */}
            <ArticleStats stats={[
              { value: "739 €", label: "Полная стоимость прав",  note: "всё включено" },
              { value: "0",     label: "Ошибок на экзамене",     note: "с первого раза" },
              { value: "10",    label: "Уроков вождения",        note: "за 5 дней" },
              { value: "6",     label: "Месяцев",                note: "от теории до прав" },
            ]} />

            {/* ── ТЕОРИЯ ОНЛАЙН ── */}
            <h2 id="teoriya" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Теория: онлайн с ИИ, а не в классе
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Теорию я сдала 19 декабря. Готовилась онлайн — с курсом Sdadim. Всё на русском,
              разбито по темам, ИИ-репетитор объясняет каждый вопрос с логикой, а не просто
              выдаёт правильный ответ. Это принципиально: понимаешь правило — запоминаешь навсегда,
              зубришь — забываешь через неделю.
            </p>

            <ArticleCallout type="info" title="Почему онлайн — это удобнее автошколы">
              Никаких фиксированных расписаний. Занимаешься когда удобно — 20 минут в кафе или
              час перед сном. ИИ запоминает твои ошибки и гоняет именно по слабым темам.
              Теорию я сдала с первого раза.
            </ArticleCallout>

            {/* ── АВТОШКОЛА ── */}
            <h2 id="avtoshkola" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Выбор автошколы: принцип «ближе к дому»
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              На практику решила записаться после нового года — но немного затянула. В итоге
              пошла в начале февраля. Выбирала по простому принципу: что ближе к дому.
              К счастью, буквально в соседней парадной оказалась автошкола с хорошими отзывами
              на Google. Сдавала в Малаге.
            </p>

            {/* ── ПРОЦЕСС ── */}
            <h2 id="process" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Как всё шло: 10 уроков за 5 дней
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              В автошколе обещали записать на экзамен через 2 недели. Прошло 2 недели — тишина.
              Зашла сама в начале марта. Забавно: зашла в понедельник днём, а уже в этот же вечер
              меня пригласили на урок на следующее утро в 9:10. Отменила работу и пошла.
            </p>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Инструктор по-английски не говорила совсем. Со своим A2 я понимала примерно половину.
              После урока включила переводчик и поняла главное: раз умею водить — заниматься
              будем прямо перед экзаменом.
            </p>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Прошли неделя, две, три — снова тишина. Написала в начале апреля: экзамен 28 апреля.
              Нужно успеть вкататься. 10 уроков за 5 дней — двойные занятия, иногда трижды в день.
            </p>

            <ArticleQuote
              text="Сначала чувствовала себя немного потерянной: инструктор не давала времени подумать. Но постепенно стала врубаться в логику испанского вождения."
              author="Автор истории"
              role="Малага, апрель 2025"
            />

            <ArticleDivider label="Что отличает вождение в Испании" />

            {/* ── ОТЛИЧИЯ ── */}
            <h2 id="otlichiya" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Главные отличия от вождения в России
            </h2>

            <ArticleList type="check" items={[
              "Пешеходы — абсолютный приоритет. Если пешеход только подходит к зебре — останавливайтесь. Не пропустил: минус 10 баллов из 8, то есть провал.",
              "Doble stop: сначала полная остановка на стоп-линии (считаешь 3 секунды), потом выезжаешь чуть вперёд, чтобы видеть полосы — и снова смотришь.",
              "Нельзя стоять на пешеходном переходе — даже в пробке. Перед переходом ждёшь, не блокируешь его.",
              "Круговое движение: въезд в правый ряд, выезд тоже из правого. На выезде — поворотник и взгляд в правое зеркало.",
              "Знаки 30 км/ч — строго. В испанских городах их очень много, следи внимательно.",
            ]} />

            <ArticleCallout type="warning" title="Самая частая ошибка на экзамене">
              Не пропустить пешехода — это автоматический провал (Eliminatoria).
              Даже если пешеход просто стоит у зебры и смотрит в телефон — лучше остановиться.
            </ArticleCallout>

            <ArticleDivider label="Словарь для экзамена" />

            {/* ── СЛОВАРЬ ── */}
            <h2 id="slovar" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Полезные слова на экзамене
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Мне пригодилось ровно четыре: прямо, направо, налево и «припаркуйся».
              Но лучше знать всё заранее:
            </p>

            <ArticleTable
              headers={["Испанский", "Русский"]}
              rows={[
                ["Seguir recto / continuar recto", "Ехать прямо"],
                ["Girar a la derecha", "Повернуть направо"],
                ["Girar a la izquierda", "Повернуть налево"],
                ["Aparcar / estacionar", "Припарковаться"],
                ["Rotonda / glorieta", "Круговое движение"],
                ["Intermitente", "Поворотник"],
                ["Más despacio", "Помедленнее"],
                ["Más rápido", "Побыстрее"],
                ["Repita, por favor", "Повторите, пожалуйста"],
                ["Dar la vuelta", "Развернуться"],
                ["Cambiar de carril", "Сменить полосу"],
                ["Nos incorporamos", "Вливаемся в поток"],
                ["Parar / detener el coche", "Остановиться"],
                ["Vamos en dirección…", "Едем в направлении…"],
              ]}
              caption="Команды, которые даёт экзаменатор DGT во время практики"
            />

            <ArticleDivider label="День экзамена" />

            {/* ── ЭКЗАМЕН ── */}
            <h2 id="ekzamen" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Сам экзамен: 23 минуты и ноль ошибок
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              В 7:40 я уже была у здания DGT. Инструктор опаздывала — успела поискать туалет
              по округе (само здание до старта закрыто). В 8 инспектор сел в машину, дал
              настроить зеркала и кресло. Я сразу сказала, что плохо говорю по-испански — он кивнул.
            </p>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Маршрут: в сторону больницы — стандартный, мы его многократно объезжали.
              Минут 7 туда, остальные 16 — команды «направо», «налево», «прямо».
              Инспектор параллельно о чём-то беседовал с инструктором, я ничего не понимала —
              просто ехала.
            </p>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Вернулись к DGT. «Aparcar» — припарковала у обочины. Инспектор вышел. Инструктор
              обнимала меня и повторяла <span className="text-emerald-600 font-semibold">muy bien</span>.
              Официальный результат пришёл вечером: <strong className="text-slate-900">ноль ошибок</strong>.
            </p>

            <ArticleCallout type="success" title="Сюрприз: ноль ошибок">
              Хотя в начале маршрута я точно чуть превысила скорость, и был момент, когда не
              успела перестроиться до сплошной. Видимо, пронесло. Судя по всему, небольшие
              погрешности, которые не создают опасности, иногда остаются без штрафных баллов.
            </ArticleCallout>

            {/* ── АВТОМАТ ── */}
            <h2 id="avtomat" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Автомат или механика?
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Сразу решила сдавать на автомате. В России 10 лет назад отучилась на механике,
              год поездила — и больше не садилась. За следующие 10 лет активного вождения
              в разных странах ни разу не возникло ситуации, где механика была бы необходима.
            </p>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Аргумент «механика дешевле в аренду» не убедил: разница 10–20 евро в день
              не стоит дискомфорта. В личное пользование тоже буду брать автомат.
            </p>

            <ArticleDivider label="Итоговые расходы" />

            {/* ── СТОИМОСТЬ ── */}
            <h2 id="stoimost" className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24">
              Сколько стоят права в Испании: реальные цифры
            </h2>

            <ArticleTable
              headers={["Статья расходов", "Сумма"]}
              rows={[
                ["Автошкола (матрикула + 10 уроков на автомате + запись на экзамен)", "580 €"],
                ["Госпошлина за права (tasas DGT)", "94 €"],
                ["Медицинская справка (informe médico)", "40 €"],
                ["Онлайн-курс теории + платформа Sdadim", "25 €"],
                ["Итого", "739 €"],
              ]}
              caption="Полная стоимость получения водительских прав в Испании категории B (автомат), Малага 2025"
            />

            <p className="text-[15px] text-slate-700 leading-[1.85] mt-4 mb-8">
              Полгода и 739 евро — и испанские права в кармане. Если бы занималась теорией
              в автошколе, а не онлайн, цена и время были бы выше.
            </p>

            {/* Финальный CTA */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 lg:p-10 text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                Готовитесь к теории DGT?
              </h3>
              <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
                Sdadim объясняет правила на понятном русском языке. ИИ-репетитор разбирает
                каждый вопрос с логикой, а не просто выдаёт правильный ответ. Большинство
                учеников сдают теорию с первого раза уже через 2–3 недели.
              </p>
              <a
                href="https://t.me/skilyapp_bot?start=course"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] w-full sm:w-auto text-lg"
              >
                Начать подготовку бесплатно
              </a>
            </div>

            <ArticleBanner variant="compact" basePrice={199} />

          </main>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">

              {/* TOC */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Содержание</p>
                <nav className="space-y-2 text-sm">
                  {[
                    ["#teoriya",    "Подготовка теории онлайн"],
                    ["#avtoshkola", "Выбор автошколы"],
                    ["#process",    "Процесс обучения"],
                    ["#otlichiya",  "Отличия от вождения в РФ"],
                    ["#slovar",     "Словарь для экзамена"],
                    ["#ekzamen",    "День экзамена"],
                    ["#avtomat",    "Автомат или механика"],
                    ["#stoimost",   "Итоговые расходы"],
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

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-slate-900 font-bold text-sm mb-2">Сдала теорию с первого раза</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Благодаря онлайн-курсу Sdadim: объяснения на русском, ИИ-репетитор,
                  симулятор экзамена — без автошколы и фиксированного расписания.
                </p>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
