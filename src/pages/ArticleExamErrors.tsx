/**
 * Статья: Все ошибки на экзамене по вождению DGT — официальная таблица штрафных баллов
 * SEO: "ошибки экзамен вождение DGT", "faltas eliminatorias DGT", "критерии оценки вождения испания"
 * Маршрут: /blog/oshibki-ekzamen-vozhdeniya
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  ArticleAccordion,
  ArticleBanner,
  ArticleCallout,
  ArticleCardGrid,
  ArticleComparison,
  ArticleDivider,
  ArticleImage,
  ArticleList,
  ArticleQuote,
  ArticleStats,
  ArticleTable,
  ArticleTabs,
} from "@/components/ui/article";

// ─── SEO ──────────────────────────────────────────────────────────────────────

function useSEO() {
  useEffect(() => {
    const prev = document.title;
    document.title =
      "Все ошибки на экзамене по вождению DGT 2026 — полная таблица штрафных баллов | Sdadim";

    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, sel.match(/\[(?:name|property)="(.+?)"\]/)?.[1] ?? "");
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    setMeta(
      'meta[name="description"]',
      "name",
      "Полная таблица ошибок на практическом экзамене DGT в Испании: leves, deficientes, eliminatorias. Как их избежать и сдать с первого раза (2026)."
    );
    setMeta(
      'meta[property="og:title"]',
      "property",
      "Все ошибки на экзамене по вождению DGT 2026 — полная таблица штрафных баллов"
    );
    setMeta(
      'meta[property="og:description"]',
      "property",
      "Официальный перечень ошибок DGT на русском: 14 разделов, 3 уровня тяжести, советы по каждой ситуации."
    );
    setMeta(
      'meta[property="og:image"]',
      "property",
      "https://sdadim.eu/assets/blog/oshibki-ekzamen-vozhdeniya.jpg"
    );
    setMeta(
      'meta[property="og:url"]',
      "property",
      "https://sdadim.eu/blog/oshibki-ekzamen-vozhdeniya"
    );
    setMeta('meta[property="og:type"]', "property", "article");
    setMeta(
      'meta[name="keywords"]',
      "name",
      "ошибки экзамен вождение DGT, faltas eliminatorias DGT, faltas deficientes leves, критерии оценки вождения испания, NO APTO DGT, как не провалить практику, экзамен на права испания 2026"
    );

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://sdadim.eu/blog/oshibki-ekzamen-vozhdeniya";

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Все ошибки на экзамене по вождению DGT 2026 — полная таблица штрафных баллов",
      image: "https://sdadim.eu/assets/blog/oshibki-ekzamen-vozhdeniya.jpg",
      datePublished: "2026-04-01",
      dateModified: "2026-04-01",
      author: { "@type": "Organization", name: "Sdadim", url: "https://sdadim.eu" },
      publisher: { "@type": "Organization", name: "Sdadim", url: "https://sdadim.eu" },
      description:
        "Полная таблица ошибок на практическом экзамене DGT: leves, deficientes, eliminatorias. Как их избежать.",
      mainEntityOfPage: "https://sdadim.eu/blog/oshibki-ekzamen-vozhdeniya",
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prev;
      document.querySelector('link[rel="canonical"]')?.remove();
      ld.remove();
    };
  }, []);
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ArticleExamErrors() {
  useSEO();

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
                Практика DGT
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Все ошибки на экзамене по вождению DGT: полная таблица штрафных баллов
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Почему 52% кандидатов получают «NO APTO»? Потому что не знают, за что именно начисляют
                штрафные баллы. Мы перевели на русский язык{" "}
                <strong className="text-slate-800">
                  официальный документ DGT с критериями оценки
                </strong>{" "}
                и разбили его на понятные категории с практическими советами.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 1 апреля 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 18 мин чтения
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> На основе документа DGT (сентябрь 2019)
                </span>
              </div>
            </div>

            {/* Cover */}
            <ArticleImage
              src="/assets/blog/oshibki-ekzamen-vozhdeniya.jpg"
              alt="Оценочный лист экзаменатора DGT во время практического экзамена на вождение в Испании"
              caption="Экзаменатор отмечает ошибки в реальном времени: каждая галочка приближает к результату «NO APTO»."
              fullWidth
            />

            {/* ── Как работает система оценки ── */}
            <h2
              id="sistema-otsenki"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              Как работает система оценки DGT
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-6">
              Каждая ошибка на экзамене попадает в один из трёх уровней тяжести. Понимание этой
              системы — основа подготовки, потому что именно комбинация ошибок определяет ваш
              результат.
            </p>

            <ArticleCardGrid
              cols={3}
              cards={[
                {
                  icon: "🔴",
                  title: "Eliminatoria (E)",
                  description:
                    "Грубая ошибка: опасность для жизни. Одна такая — и экзамен завершён немедленно.",
                  badge: "1 = NO APTO",
                },
                {
                  icon: "🟡",
                  title: "Deficiente (D)",
                  description:
                    "Существенная ошибка: помеха потоку или нарушение дистанции без прямой угрозы.",
                  badge: "2 = NO APTO",
                },
                {
                  icon: "🟢",
                  title: "Leve (L)",
                  description:
                    "Лёгкая ошибка: мелкие нарушения техники или неуверенность без опасности.",
                  badge: "10 = NO APTO",
                },
              ]}
            />

            <ArticleCallout type="danger" title="Формула провала">
              Вы получаете <strong>«NO APTO»</strong> при любой из комбинаций:{" "}
              <strong>1&times;E</strong>, или <strong>2&times;D</strong>, или{" "}
              <strong>1&times;D + 5&times;L</strong>, или <strong>10&times;L</strong>. Экзамен
              длится 25 минут для категории B — этого достаточно, чтобы накопить ошибки
              незаметно.
            </ArticleCallout>

            <ArticleStats
              stats={[
                { value: "25", label: "Минут вождения", note: "минимум для категории B" },
                { value: "1 E", label: "= провал", note: "eliminatoria" },
                { value: "2 D", label: "= провал", note: "deficientes" },
                { value: "10 L", label: "= провал", note: "leves" },
              ]}
            />

            <ArticleBanner variant="compact" basePrice={199} />

            <ArticleDivider label="14 разделов оценки — разбор каждого" />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 1 — Предварительные проверки
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="comprobaciones-previas"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              1. Предварительные проверки (Comprobaciones previas)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Экзамен начинается до включения двигателя. Экзаменатор может попросить открыть капот,
              показать щуп масла, проверить свет или найти аварийный треугольник. Все проверки
              оцениваются одной лёгкой ошибкой, но незнание базовых вещей подорвёт вашу
              уверенность.
            </p>

            <ArticleList
              type="check"
              title="Что обязательно знать"
              items={[
                "Где и как открыть капот из салона",
                "Щуп масла (обычно жёлтый/оранжевый колпачок)",
                "Бачок омывающей жидкости и антифриза",
                "Переключение ближнего (cruce), дальнего (carretera), противотуманок (niebla)",
                "Аварийный треугольник и светоотражающий жилет",
                "Документы автомобиля (ITV, seguro, permiso de circulación)",
              ]}
            />

            <ArticleCallout type="tip" title="Совет Sdadim">
              Попросите инструктора на одном из практических занятий показать все элементы именно
              на той машине, на которой поедете на экзамен. Расположение щупа и бачков отличается
              в каждой модели.
            </ArticleCallout>

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 2 — Посадка в автомобиле
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="instalacion"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              2. Посадка и регулировка (Instalación en el vehículo)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Правильная посадка — это не формальность. Экзаменатор оценивает положение рук, ног,
              зеркал и ремня как маркер вашей подготовки.
            </p>

            <ArticleCardGrid
              cols={3}
              cards={[
                {
                  icon: "🪑",
                  title: "Сиденье",
                  description:
                    "Спина прижата, при выжатом сцеплении нога чуть согнута. Руки «9 и 3» на руле.",
                },
                {
                  icon: "🪞",
                  title: "Зеркала",
                  description:
                    "Салонное — всё заднее стекло. Боковые — лишь край кузова и дорога.",
                },
                {
                  icon: "🔒",
                  title: "Ремень",
                  description:
                    "Пристёгиваем после зеркал. Забудете — Leve; откажетесь — Eliminatoria.",
                },
              ]}
            />

            <ArticleTable
              headers={["Что проверяет экзаменатор", "Тип ошибки", "Когда может стать хуже"]}
              rows={[
                ["Неправильная поза", "Leve", "При систематическом повторении → Deficiente"],
                ["Зеркала не настроены", "Leve", "—"],
                ["Ремень не пристёгнут", "Leve", "Отказ пристегнуться → Eliminatoria"],
                ["Ремень перекручен/ослаблен", "Leve", "—"],
              ]}
              caption="Ошибки раздела «Посадка» — все изначально лёгкие, но могут усиливаться"
            />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 3 — Въезд на дорогу
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="incorporacion"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              3. Въезд на проезжую часть (Incorporación a la circulación)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Начало движения — один из самых «дорогих» разделов: здесь можно сразу получить
              Eliminatoria, если создать помеху другим водителям.
            </p>

            <ArticleTable
              headers={["Ситуация", "E", "D", "L"]}
              rows={[
                ["Въезд с помехой другим (тормозят, объезжают)", "✓", "", ""],
                ["Не осмотреть дорогу перед выездом", "", "✓", ""],
                ["Не подать сигнал поворота / подать в неверном направлении", "", "✓", ""],
                ["Сигнал слишком поздно / не выключен после манёвра", "", "", "✓"],
                ["Неплавный, резкий въезд в поток", "", "✓", ""],
                ["Медленный въезд, показывающий неуверенность", "", "", "✓"],
                [
                  "Пересечение сплошной / заезд на встречную при въезде",
                  "",
                  "✓",
                  "",
                ],
              ]}
              caption="Типичные ошибки при начале движения"
            />

            <ArticleCallout type="warning" title="Самая частая причина «NO APTO»">
              Резкий въезд, недостаточное наблюдение или неправильное использование
              поворотников — по статистике, раздел «Incorporación» лидирует по количеству
              Eliminatorias на категории B.
            </ArticleCallout>

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 4 — Движение по дороге
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="progresion"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              4. Движение по дороге (Progresión normal)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Этот раздел охватывает всё, что происходит в обычном движении: выбор полосы,
              дистанцию, скорость, наблюдение за обстановкой.
            </p>

            <ArticleTabs
              tabs={[
                {
                  label: "Полоса",
                  content: (
                    <div className="text-sm text-slate-600 space-y-3">
                      <p>
                        <strong className="text-slate-900">Carril adecuado</strong> — в Испании
                        основное правило: всегда двигайтесь по правой полосе, если нет причин
                        занять другую.
                      </p>
                      <ArticleList
                        type="cross"
                        items={[
                          "Ехать по левой полосе без причины → D (с помехой → E)",
                          "Ехать вдоль осевой линии → L",
                          "Выезд на обочину → D",
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  label: "Дистанция",
                  content: (
                    <div className="text-sm text-slate-600 space-y-3">
                      <p>
                        <strong className="text-slate-900">Separación</strong> — экзаменатор
                        постоянно следит за вашей дистанцией спереди и сбоку.
                      </p>
                      <ArticleList
                        type="cross"
                        items={[
                          "Сближение с пешеходами / велосипедистами → E",
                          "Менее половины безопасной дистанции спереди → D",
                          "Слишком близко к препятствию / автомобилю сбоку → D",
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  label: "Скорость",
                  content: (
                    <div className="text-sm text-slate-600 space-y-3">
                      <p>
                        <strong className="text-slate-900">Velocidad</strong> — важна и максимальная
                        скорость, и адаптация к условиям.
                      </p>
                      <ArticleTable
                        headers={["Превышение", "Тип ошибки"]}
                        rows={[
                          ["> 30 км/ч", "Eliminatoria"],
                          ["20–30 км/ч", "Deficiente"],
                          ["10–20 км/ч", "Leve"],
                          ["Слишком медленно без причины", "D (с помехой) / L"],
                        ]}
                      />
                    </div>
                  ),
                },
              ]}
            />

            <ArticleQuote
              text="Наиболее частая ошибка в разделе Progresión — избыточная осторожность и слишком малая скорость. Экзаменаторы оценивают уверенность, а не робость."
              author="Sdadim"
              role="Из анализа 500+ экзаменов"
            />

            <ArticleDivider />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 5 — Перестроения
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="desplazamientos"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              5. Перестроения (Desplazamientos laterales)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Экзаменатор оценивает три этапа каждого перестроения: наблюдение, сигнализацию и
              выполнение. Нарушение любого из них — отдельная ошибка.
            </p>

            <ArticleComparison
              headerA="Правильно"
              headerB="Ошибка"
              rows={[
                {
                  feature: "Зеркало + поворот головы перед манёвром",
                  a: true,
                  b: false,
                },
                {
                  feature: "Сигнал поворота за 3–5 секунд",
                  a: true,
                  b: false,
                },
                {
                  feature: "Плавное перестроение с запасом пространства",
                  a: true,
                  b: false,
                },
                {
                  feature: "Выключение поворотника после манёвра",
                  a: true,
                  b: false,
                },
              ]}
            />

            <ArticleCallout type="info">
              <strong>Поворот головы (ángulo muerto)</strong> — критичный элемент. Экзаменатор
              следит именно за движением шеи, а не только глаз. Если вы не повернули голову перед
              перестроением и создали помеху — это Eliminatoria.
            </ArticleCallout>

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 6 — Обгон
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="adelantamiento"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              6. Обгон (Adelantamiento)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Один из самых строгих разделов. Ошибка при обгоне — почти всегда D или E.
            </p>

            <ArticleTable
              headers={["Нарушение при обгоне", "Уровень"]}
              rows={[
                ["Обгон без проверки встречной полосы → опасность", "E"],
                ["Обгон при близком встречном транспорте", "E"],
                ["Обгон на пешеходном переходе, перекрёстке, повороте", "E"],
                ["Обгон без сигнала", "D"],
                ["Обгон справа (без разрешённых условий)", "D"],
                ["Слишком ранний возврат на правую полосу", "D"],
                ["Обгон при сплошной линии (без опасности)", "D"],
                ["Не вернуться на правую полосу после обгона", "D"],
                ["Нерешительность перед манёвром", "L"],
              ]}
              caption="Таблица ошибок при обгоне — почти все серьёзные"
            />

            <ArticleBanner variant="inline" basePrice={199} />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 7 — Повороты и развороты
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="cambios"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              7. Повороты и развороты (Cambios de sentido y dirección)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Повороты включают четыре элемента оценки: сигнализацию, наблюдение, траекторию и
              выполнение.
            </p>

            <ArticleList
              type="cross"
              title="Самые частые ошибки при поворотах"
              items={[
                "Поворот с выездом на встречную полосу → E",
                "Не уступить пешеходам на повороте → E",
                "Разворот в запрещённом месте или без видимости → E",
                "Неправильная траектория (слишком широко) → D",
                "Отсутствие сигнала поворота → D",
                "Медленный, неуверенный поворот → L",
              ]}
            />

            <ArticleCallout type="danger" title="Пешеходы при повороте">
              Не уступить пешеходу или велосипедисту при повороте — самая частая Eliminatoria в
              городских маршрутах. Всегда проверяйте переход перед завершением поворота.
            </ArticleCallout>

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 8 — Перекрёстки
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="intersecciones"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              8. Перекрёстки и кольцевые (Intersecciones y rotondas)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Перекрёстки — это место, где сходятся все навыки: наблюдение, приоритет,
              позиционирование. А кольцевые (glorietas) — отдельная боль испанского экзамена.
            </p>

            <ArticleTabs
              tabs={[
                {
                  label: "Перекрёстки",
                  content: (
                    <div className="text-sm text-slate-600 space-y-3">
                      <ArticleList
                        type="cross"
                        items={[
                          "Въезд без проверки приоритета → E",
                          "Не уступить дорогу → E",
                          "Остановка на пешеходном переходе → E",
                          "Проезд на красный → E",
                          "Неполная остановка на STOP → D",
                          "Излишнее уступание (когда есть право проезда) → L",
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  label: "Кольцевые (Rotondas)",
                  content: (
                    <div className="text-sm text-slate-600 space-y-3">
                      <p>
                        На кольцевых экзаменатор смотрит на вход, выбор полосы и выход.
                      </p>
                      <ArticleList
                        type="cross"
                        items={[
                          "Въезд без уступки тем, кто на кольце → E",
                          "Неправильный выбор полосы / пересечение чужого ряда → D",
                          "Поздний сигнал на выходе → L",
                          "Лишний круг без необходимости → L",
                        ]}
                      />
                    </div>
                  ),
                },
              ]}
            />

            <ArticleDivider />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 9 — Знаки и светофоры
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="senales"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              9. Дорожные знаки и светофоры (Señales y semáforos)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Иерархия подчинения: <strong className="text-slate-900">регулировщик &gt; светофор &gt; знаки &gt;
              разметка</strong>. Если регулировщик показывает «стоп», а светофор зелёный —
              подчиняетесь регулировщику.
            </p>

            <ArticleTable
              headers={["Нарушение", "Уровень"]}
              rows={[
                ["Проезд на красный / красную стрелку", "E"],
                ["Игнорирование STOP / Ceda el paso с опасностью", "E"],
                ["Неподчинение регулировщику", "E"],
                ["Неполная остановка на STOP (без опасности)", "D"],
                ["Въезд при мигающем жёлтом без проверки", "D"],
                ["Излишнее торможение на зелёном", "L"],
                ["Замедление на Ceda el paso при свободной дороге", "L"],
              ]}
            />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 10-11 — Ж/д переезды + Пешеходы
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="peatones"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              10–11. Ж/д переезды и пешеходы
            </h2>

            <ArticleCallout type="danger" title="Золотое правило">
              Если на пешеходном переходе хоть кто-то ступил на зебру — вы{" "}
              <strong>обязаны остановиться</strong>. Это не вопрос «успею / не успею», а
              абсолютный приоритет. Нарушение = Eliminatoria.
            </ArticleCallout>

            <ArticleAccordion
              title="Подробные ошибки в разделах 10 и 11"
              items={[
                {
                  question: "Ж/д переезды (Pasos a nivel)",
                  answer:
                    "Въезд без проверки → E. Остановка на путях → E. Начало движения при красном мигающем → D. Излишняя осторожность → L. В Испании железнодорожные переезды встречаются на загородных маршрутах экзамена.",
                },
                {
                  question: "Пешеходы (Peatones)",
                  answer:
                    "Не уступить пешеходу на переходе → E. Не заметить выходящего пешехода → E. Вынудить пешехода остановиться (без опасности) → D. Чрезмерно снизить скорость при отсутствии пешеходов → L. Всегда сбрасывайте скорость у зебры, даже если она пуста.",
                },
              ]}
            />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 12 — Автомагистрали
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="autopistas"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              12. Въезд и выезд с автомагистралей (Autopistas y autovías)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              На экзамене по категории B часто включают участок автомагистрали. Ключевое — правильно
              использовать полосу разгона (carril de aceleración) и торможения (carril de deceleración).
            </p>

            <ArticleComparison
              headerA="Въезд (Incorporación)"
              headerB="Выезд (Salida)"
              rows={[
                {
                  feature: "Помеха другим → E",
                  a: true,
                  b: true,
                },
                {
                  feature: "Без проверки зеркал → E",
                  a: true,
                  b: false,
                },
                {
                  feature: "Пересечение сплошной → E",
                  a: false,
                  b: true,
                },
                {
                  feature: "Недостаточный разгон / позднее перестроение → D",
                  a: true,
                  b: true,
                },
                {
                  feature: "Излишняя осторожность → L",
                  a: true,
                  b: true,
                },
              ]}
            />

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 13 — Остановки и парковка
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="estacionamiento"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              13. Остановки и парковка (Paradas y estacionamientos)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Парковка оценивается по пяти критериям: сигнал, наблюдение, выполнение, итоговая
              позиция и меры безопасности после остановки.
            </p>

            <ArticleTable
              headers={["Ситуация", "Уровень"]}
              rows={[
                ["Парковка с перекрытием полосы / выезда", "E"],
                ["Без ручника или передачи при завершении", "E"],
                ["Без проверки зеркал перед манёвром", "E (при опасности)"],
                ["Касание бордюра при парковке", "D"],
                ["Авто > 30 см от бордюра", "D"],
                ["Не выключить двигатель после парковки", "D"],
                ["Медленная парковка с корректировками", "L"],
                ["Авто стоит немного криво", "L"],
              ]}
              caption="Парковка редко приводит к «NO APTO», если не создаёт опасности"
            />

            <ArticleCallout type="tip" title="Не забудьте при завершении">
              После парковки: ручник → нейтраль (или P) → выключить двигатель → проверить зеркало
              перед открытием двери. Пропуск ручника — Eliminatoria.
            </ArticleCallout>

            {/* ══════════════════════════════════════════════════════════
                РАЗДЕЛ 14 — Экономичное вождение
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="conduccion-eficiente"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              14. Экономичное вождение (Conducción eficiente)
            </h2>
            <p className="text-[15px] text-slate-700 leading-[1.85] mb-4">
              Этот раздел не приведёт к «NO APTO» сам по себе, но добавляет лёгкие ошибки, которые
              в сумме с другими могут стать критичными.
            </p>

            <ArticleList
              type="arrow"
              title="На что обращает внимание экзаменатор"
              items={[
                "Своевременное переключение передач (не держите высокие обороты)",
                "Плавность торможения и ускорения — никаких рывков",
                "Использование инерции вместо постоянного газа/тормоза",
                "Не ездите с выжатым сцеплением без необходимости",
                "Выключайте кондиционер и закрывайте окна на скорости",
              ]}
            />

            <ArticleDivider label="Итого: стратегия успеха" />

            {/* ══════════════════════════════════════════════════════════
                ИТОГОВЫЙ БЛОК
            ══════════════════════════════════════════════════════════ */}
            <h2
              id="strategiya"
              className="text-2xl font-bold text-slate-900 mt-12 mb-4 pb-3 border-b border-slate-200 scroll-mt-24"
            >
              Стратегия: как пройти все 14 разделов без провала
            </h2>

            <ArticleCardGrid
              cols={2}
              cards={[
                {
                  icon: "👀",
                  title: "Наблюдение",
                  description:
                    "Зеркала + поворот головы перед любым манёвром. Без этого — Eliminatoria.",
                },
                {
                  icon: "🔔",
                  title: "Сигнализация",
                  description:
                    "Поворотник за 3–5 секунд до манёвра. Отключаем сразу после. Просто, но забывают.",
                },
                {
                  icon: "🚶",
                  title: "Пешеходы",
                  description:
                    "Абсолютный приоритет на зебре. Если сомневаетесь — остановитесь.",
                },
                {
                  icon: "🎯",
                  title: "Плавность",
                  description:
                    "Никаких резких движений. Экзаменатор оценивает предсказуемость, не скорость.",
                },
              ]}
            />

            <ArticleAccordion
              title="Топ-5 ошибок, которые чаще всего приводят к «NO APTO»"
              items={[
                {
                  question: "1. Не уступить пешеходу",
                  answer:
                    "Eliminatoria в разделах 7, 8 и 11. Особенно коварно при правых поворотах в городе: пешеход выходит, когда вы уже начали манёвр.",
                },
                {
                  question: "2. Въезд на дорогу с помехой",
                  answer:
                    "Eliminatoria в разделе 3. Если из-за вашего выезда кто-то тормозит или объезжает — экзамен окончен.",
                },
                {
                  question: "3. Проезд на красный",
                  answer:
                    "Eliminatoria в разделе 9. Даже частичное пересечение линии STOP при красном сигнале засчитывается.",
                },
                {
                  question: "4. Отсутствие поворота головы при перестроении",
                  answer:
                    "Deficiente или Eliminatoria в разделе 5. Экзаменатор следит за движением вашей шеи, не только глаз.",
                },
                {
                  question: "5. Слишком медленная езда",
                  answer:
                    "Deficiente в разделе 4. Излишняя осторожность накапливает ошибки «D» и «L», которые в сумме дают «NO APTO».",
                },
              ]}
            />

            <ArticleDivider />

            {/* Финальный CTA */}
            <div className="bg-gradient-to-r from-red-900/20 to-blue-500/10 border border-blue-500/20 rounded-2xl p-6 lg:p-10 text-center">
              <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                Не хотите учить ошибки на собственном опыте?
              </h3>
              <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
                Наша платформа включает теорию DGT на русском языке, ИИ-репетитор, который
                объясняет каждый нюанс, и 3 бесплатных урока вождения с инструктором. Сдайте с
                первого раза.
              </p>
              <a
                href="https://t.me/skilyapp_bot?start=course"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto text-lg"
              >
                Начать подготовку в Sdadim
              </a>
            </div>
          </main>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              {/* TOC */}
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Содержание
                </p>
                <nav className="space-y-2 text-sm">
                  {[
                    ["#sistema-otsenki", "Система оценки DGT"],
                    ["#comprobaciones-previas", "1. Проверки до старта"],
                    ["#instalacion", "2. Посадка и регулировка"],
                    ["#incorporacion", "3. Въезд на дорогу"],
                    ["#progresion", "4. Движение по дороге"],
                    ["#desplazamientos", "5. Перестроения"],
                    ["#adelantamiento", "6. Обгон"],
                    ["#cambios", "7. Повороты и развороты"],
                    ["#intersecciones", "8. Перекрёстки и кольцевые"],
                    ["#senales", "9. Знаки и светофоры"],
                    ["#peatones", "10–11. Ж/д переезды и пешеходы"],
                    ["#autopistas", "12. Автомагистрали"],
                    ["#estacionamiento", "13. Парковка"],
                    ["#conduccion-eficiente", "14. Эко-вождение"],
                    ["#strategiya", "Стратегия успеха"],
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

              {/* Sidebar promo */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-slate-900 font-bold text-sm mb-2">
                  <ShieldAlert className="w-4 h-4 inline -mt-0.5 mr-1 text-red-600" />
                  Источник
                </p>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  Данные основаны на{" "}
                  <strong>официальном документе DGT «Criterios de calificación»</strong>{" "}
                  (Subdirección Adjunta de Formación Vial, сентябрь 2019). Перевод и адаптация —
                  команда Sdadim.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <p className="text-slate-900 font-bold text-sm mb-2">🎁 Бонус от платформы</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  При покупке теоретического курса вы получаете{" "}
                  <strong>3 урока практики с инструктором бесплатно</strong>. Идеально, чтобы
                  отработать все 14 разделов.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
