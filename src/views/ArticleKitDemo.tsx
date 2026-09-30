import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  ArticleAccordion,
  ArticleCallout,
  ArticleQuote,
  ArticleTable,
  ArticleTabs,
  ArticleSpoiler,
  ArticleList,
  ArticleCardGrid,
  ArticleDivider,
  ArticleImage,
  ArticleVideo,
  ArticleStats,
  ArticleLinkCard,
  ArticleBanner,
  ArticleComparison,
} from "@/components/ui/article";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-2">
        <code className="text-[11px] text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded font-mono">{`<${id.replace(/-/g,"")}/>`}</code>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-3">{title}</h2>
      {children}
    </section>
  );
}

const NAV = [
  { id: "banner",      label: "Banner" },
  { id: "callout",     label: "Callout" },
  { id: "accordion",   label: "Accordion" },
  { id: "spoiler",     label: "Spoiler" },
  { id: "tabs",        label: "Tabs" },
  { id: "quote",       label: "Quote" },
  { id: "list",        label: "List" },
  { id: "table",       label: "Table" },
  { id: "comparison",  label: "Comparison" },
  { id: "cardgrid",    label: "Card Grid" },
  { id: "stats",       label: "Stats" },
  { id: "linkcard",    label: "Link Card" },
  { id: "image",       label: "Image" },
  { id: "video",       label: "Video" },
  { id: "divider",     label: "Divider" },
];

export default function ArticleKitDemo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky nav */}
      <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="shrink-0 px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
        {/* Header */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Блог
        </Link>

        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full">
            Для авторов
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mt-4 mb-3">Article UI Kit</h1>
          <p className="text-slate-600 leading-relaxed">
            15 готовых компонентов для оформления статей. Все адаптивны, анимированы и работают в тёмной теме.
            Импортируй нужные из <code className="text-blue-700 text-sm">@/components/ui/article</code>.
          </p>
        </div>

        <div className="space-y-16">

          {/* BANNER */}
          <Section id="banner" title="Banner — умный рекламный баннер">
            <p className="text-sm text-slate-500 mb-4">Автоматически подтягивает дату старта и число мест из Supabase. Три варианта: <code className="text-blue-700">default</code>, <code className="text-blue-700">compact</code>, <code className="text-blue-700">inline</code>.</p>
            <ArticleBanner variant="default" basePrice={199} />
            <ArticleBanner variant="compact" basePrice={199} />
            <div className="mt-4">
              <ArticleBanner variant="inline" basePrice={199} />
            </div>
            <pre className="mt-4 text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`import { ArticleBanner } from "@/components/ui/article";

// В середине статьи:
<ArticleBanner variant="compact" />

// В конце статьи:
<ArticleBanner variant="default" basePrice={199} />

// Inline, рядом с текстом:
<ArticleBanner variant="inline" />`}</pre>
          </Section>

          <ArticleDivider />

          {/* CALLOUT */}
          <Section id="callout" title="Callout — врезка / выделение">
            <p className="text-sm text-slate-500 mb-4">5 типов: <code className="text-blue-700">info · tip · warning · danger · success</code></p>
            <ArticleCallout type="info">Это полезная информация, которую стоит выделить из основного текста.</ArticleCallout>
            <ArticleCallout type="tip" title="Лайфхак">Записывайтесь за 2 недели до старта — так вы получите доступ к закрытому Telegram-чату потока.</ArticleCallout>
            <ArticleCallout type="warning">Данные в базе вопросов DGT обновляются каждые 6 месяцев. Проверяйте актуальность.</ArticleCallout>
            <ArticleCallout type="danger">Без прохождения Psicotécnico вас не допустят к экзамену. Не откладывайте!</ArticleCallout>
            <ArticleCallout type="success">Студенты с ежедневной практикой 20 минут сдают с первого раза в 9 из 10 случаев.</ArticleCallout>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleCallout type="warning" title="Важно знать">
  Текст врезки...
</ArticleCallout>`}</pre>
          </Section>

          <ArticleDivider />

          {/* ACCORDION */}
          <Section id="accordion" title="Accordion — аккордеон / FAQ">
            <ArticleAccordion
              title="Часто задаваемые вопросы"
              items={[
                { question: "Сколько времени занимает подготовка к теории?", answer: "В среднем 3–4 недели при ежедневной практике по 30 минут. За это время вы пройдёте всю базу из 3000 вопросов DGT и успеете сделать достаточно тренировочных тестов." },
                { question: "Можно ли сдать теорию без знания испанского?", answer: "Да, экзамен доступен на русском языке. На официальном сайте Tráfico вы можете выбрать язык при записи — это один из 12 доступных языков." },
                { question: "Что происходит, если не сдал с первого раза?", answer: "Вы можете пересдать через 30 дней. Студентам нашего курса мы предоставляем бессрочный доступ к материалам и поддержку куратора до успешной сдачи." },
              ]}
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleAccordion
  title="FAQ"
  items={[
    { question: "...", answer: "..." },
  ]}
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* SPOILER */}
          <Section id="spoiler" title="Spoiler — одиночный раскрываемый блок">
            <ArticleSpoiler label="Полный список документов для Cita Previa">
              <ul className="space-y-1.5 text-slate-600">
                <li>• Паспорт или NIE (оригинал + копия)</li>
                <li>• Эмпадрональенто (прописка)</li>
                <li>• Результат Psicotécnico</li>
                <li>• Квитанция об оплате тасы (tasas 790)</li>
                <li>• 2 фотографии паспортного формата</li>
              </ul>
            </ArticleSpoiler>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleSpoiler label="Полный список документов">
  <p>Контент внутри...</p>
</ArticleSpoiler>`}</pre>
          </Section>

          <ArticleDivider />

          {/* TABS */}
          <Section id="tabs" title="Tabs — табы">
            <ArticleTabs
              tabs={[
                {
                  label: "Категория B",
                  content: (
                    <div className="text-sm text-slate-600 space-y-2">
                      <p>Стандартные права категории B (легковой автомобиль). Экзамен: 30 вопросов, максимум 3 ошибки.</p>
                      <p>Минимальный возраст: <strong className="text-slate-900">18 лет</strong>.</p>
                    </div>
                  ),
                },
                {
                  label: "Категория A",
                  content: (
                    <div className="text-sm text-slate-600 space-y-2">
                      <p>Права на мотоцикл. Сначала нужно получить A2, через 2 года можно получить A.</p>
                      <p>Минимальный возраст: <strong className="text-slate-900">20 лет (A2)</strong> и <strong className="text-slate-900">24 года (A)</strong>.</p>
                    </div>
                  ),
                },
                {
                  label: "Категория AM",
                  content: (
                    <div className="text-sm text-slate-600 space-y-2">
                      <p>Мопед до 50cc и микромобильность. Самый простой экзамен.</p>
                      <p>Минимальный возраст: <strong className="text-slate-900">15 лет</strong>.</p>
                    </div>
                  ),
                },
              ]}
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleTabs
  tabs={[
    { label: "Категория B", content: <p>...</p> },
    { label: "Категория A", content: <p>...</p> },
  ]}
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* QUOTE */}
          <Section id="quote" title="Quote — цитата">
            <ArticleQuote
              text="За 3 недели занятий я не просто выучила вопросы — я поняла логику испанских правил. Сдала с первого раза, набрав только 1 ошибку из 30."
              author="Анна Котова"
              role="Мадрид, поток #12"
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleQuote
  text="..."
  author="Имя Фамилия"
  role="Должность"
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* LIST */}
          <Section id="list" title="List — стильный список">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">check</p>
                <ArticleList type="check" items={["На русском языке", "Живые уроки", "Куратор 24/7", "Документы под ключ"]} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">cross</p>
                <ArticleList type="cross" items={["Без знания испанского", "Без практики", "Без поддержки"]} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">arrow</p>
                <ArticleList type="arrow" items={["Шаг 1: Psicotécnico", "Шаг 2: Cita Previa", "Шаг 3: Экзамен"]} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">number</p>
                <ArticleList type="number" items={["Изучи теорию", "Пройди тесты", "Сдай экзамен"]} />
              </div>
            </div>
            <pre className="mt-4 text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleList
  type="check"  // check | cross | arrow | number
  title="Что входит"
  items={["Пункт A", "Пункт B"]}
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* TABLE */}
          <Section id="table" title="Table — красивая таблица">
            <ArticleTable
              headers={["Этап", "Срок", "Стоимость", "Обязательно"]}
              rows={[
                ["Psicotécnico", "30 мин", "€40–60", "✓ Да"],
                ["Cita Previa (запись)", "Online", "Бесплатно", "✓ Да"],
                ["Тасы (госпошлина)", "Online", "€88.89", "✓ Да"],
                ["Теоретический экзамен", "30 мин", "включена в тасу", "✓ Да"],
                ["Практические уроки", "10–20 уроков", "€30–45/урок", "Минимум 1"],
              ]}
              caption="Актуально для 2024–2025 года. Цены могут отличаться в зависимости от региона."
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleTable
  headers={["Этап", "Срок", "Стоимость"]}
  rows={[["Psicotécnico", "30 мин", "€40–60"]]}
  caption="Подпись таблицы"
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* COMPARISON */}
          <Section id="comparison" title="Comparison — сравнительная таблица">
            <ArticleComparison
              headerA="Автошкола"
              headerB="Sdadim"
              rows={[
                { feature: "Язык обучения", a: "Испанский", b: "Русский" },
                { feature: "Живые уроки", a: false, b: true },
                { feature: "Куратор", a: false, b: true },
                { feature: "Помощь с документами", a: false, b: true },
                { feature: "Доступ 24/7", a: false, b: true },
                { feature: "Цена", a: "€350+", b: "от €199" },
              ]}
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleComparison
  headerA="Автошкола"
  headerB="Sdadim"
  rows={[
    { feature: "Язык", a: "Испанский", b: "Русский" },
    { feature: "Куратор", a: false, b: true },
  ]}
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* CARD GRID */}
          <Section id="cardgrid" title="Card Grid — карточки">
            <ArticleCardGrid
              cols={3}
              cards={[
                { icon: "📚", title: "3 000+ вопросов", description: "Вся официальная база DGT с объяснениями на русском языке.", badge: "DGT 2025" },
                { icon: "🎓", title: "Живые уроки", description: "Еженедельные онлайн-занятия с куратором по Zoom.", badge: "Группа" },
                { icon: "🤖", title: "AI-помощник", description: "Задавай вопросы в чат и получай ответы за 30 секунд.", badge: "24/7" },
              ]}
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleCardGrid
  cols={3}  // 2 | 3
  cards={[
    { icon: "📚", title: "...", description: "...", badge: "DGT" },
  ]}
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* STATS */}
          <Section id="stats" title="Stats — блок статистики">
            <ArticleStats
              stats={[
                { value: "9/10", label: "Сдают с первого раза", note: "статистика 2024" },
                { value: "3 000", label: "Вопросов в базе", note: "официальная DGT" },
                { value: "€199", label: "Начальная цена", note: "тариф «Группа»" },
                { value: "14", label: "Потоков прошло", note: "с 2022 года" },
              ]}
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleStats
  stats={[
    { value: "9/10", label: "Сдают с первого раза", note: "2024" },
  ]}
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* LINK CARD */}
          <Section id="linkcard" title="Link Card — карточка-ссылка">
            <ArticleLinkCard
              href="/blog"
              title="Все статьи блога Sdadim"
              description="Советы, разборы DGT и истории студентов"
            />
            <ArticleLinkCard
              href="https://sede.dgt.gob.es"
              title="Официальный сайт DGT"
              description="Запись на экзамен, проверка статуса, документы"
              external
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleLinkCard
  href="https://..."
  title="Заголовок"
  description="Описание"
  external  // автоматически если href начинается с http
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* IMAGE */}
          <Section id="image" title="Image — изображение с подписью">
            <ArticleImage
              src="/assets/happy_user_license.png"
              alt="Студентка с водительским удостоверением Испании"
              caption="Алина из Барселоны после успешной сдачи теории DGT, поток #11"
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleImage
  src="/assets/photo.png"
  alt="Описание для SEO"
  caption="Подпись под фото"
  fullWidth  // опционально
/>`}</pre>
          </Section>

          <ArticleDivider />

          {/* VIDEO */}
          <Section id="video" title="Video — YouTube / видео">
            <p className="text-sm text-slate-500 mb-4">Ленивая загрузка — превью показывается сразу, iframe подгружается только по клику.</p>
            <ArticleVideo
              youtubeId="dQw4w9WgXcQ"
              caption="Пример: разбор самых сложных вопросов DGT 2024"
            />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleVideo
  youtubeId="VIDEO_ID"
  caption="Подпись"
/>

// Или произвольный URL:
<ArticleVideo src="https://..." />`}</pre>
          </Section>

          <ArticleDivider />

          {/* DIVIDER */}
          <Section id="divider" title="Divider — разделитель">
            <ArticleDivider />
            <ArticleDivider label="Метод подготовки" />
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto text-slate-600 font-mono">{`<ArticleDivider />
<ArticleDivider label="Раздел" />`}</pre>
          </Section>

          {/* Footer note */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-bold text-slate-900 mb-1">Готово к использованию</p>
            <p className="text-sm text-slate-500">
              Все компоненты в <code className="text-blue-700">src/components/ui/article.tsx</code>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
