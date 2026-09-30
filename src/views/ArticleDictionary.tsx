/**
 * Статья: Словарик будущего водителя в Испании (Flipping Cards UI)
 * SEO: "словарь водителя испания", "термины DGT перевод", "испанские водительские термины"
 * Маршрут: /blog/slovar-dgt
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, BookOpen, Fingerprint, MapPin, BadgeEuro,
  Scale, FileText, CarFront, TrafficCone, Siren, CheckCircle2, Navigation,
  ArrowRight, ArrowLeft as ArrowLeftIcon, ArrowUpRight, Ban, StopCircle, 
  Car, Eye, Gauge, MoveLeft, MoveRight
} from "lucide-react";
import {
  ArticleCallout,
  ArticleDivider,
  ArticleImage,
  ArticleBanner,
} from "@/components/ui/article";
import { FlippingCard } from "@/components/ui/flipping-card";


// ─── Данные словаря ────────────────────────────────────────────────────────

interface TermData {
  id: string;
  es: string;
  ru: string;
  desc: string;
  icon: JSX.Element;
}

const COMMON_TERMS: TermData[] = [
  { id: "1", es: "Permiso de Conducir", ru: "Водительское удостоверение", desc: "Документ, удостоверяющий право управления ТС. Выдается после сдачи экзаменов.", icon: <FileText className="w-6 h-6 text-blue-600" /> },
  { id: "2", es: "Examen Teórico", ru: "Теоретический экзамен", desc: "30 вопросов с вариантами ответов на знание ПДД и безопасного вождения.", icon: <BookOpen className="w-6 h-6 text-emerald-600" /> },
  { id: "3", es: "Examen Práctico", ru: "Практический экзамен", desc: "Экзамен по вождению на дорогах общего пользования в Испании.", icon: <CarFront className="w-6 h-6 text-amber-600" /> },
  { id: "4", es: "NIE / TIE", ru: "Номер / Карта Иностранца", desc: "Обязательный идентификатор для записи в автошколу и DGT.", icon: <Fingerprint className="w-6 h-6 text-indigo-600" /> },
  { id: "5", es: "Empadronamiento", ru: "Прописка", desc: "Регистрация по месту жительства. Можно прописаться даже в арендованной квартире.", icon: <MapPin className="w-6 h-6 text-rose-600" /> },
  { id: "6", es: "Tasa", ru: "Госпошлина", desc: "Государственный сбор, оплачиваемый за процедуры в DGT (около 94 евро).", icon: <BadgeEuro className="w-6 h-6 text-yellow-600" /> },
  { id: "11", es: "DGT", ru: "Dirección General de Tráfico", desc: "Генеральная дирекция движения — государственный орган, выдающий вам права.", icon: <Scale className="w-6 h-6 text-blue-500" /> },
  { id: "14", es: "Señales de Tráfico", ru: "Дорожные знаки", desc: "Указатели и символы. Основа испанского Código de Circulación.", icon: <TrafficCone className="w-6 h-6 text-orange-600" /> },
  { id: "18", es: "Multa", ru: "Штраф", desc: "Денежное наказание за нарушение. Возможна оплата со скидкой 50% в первые 20 дней.", icon: <Siren className="w-6 h-6 text-red-500" /> },
];

const ACTIONS_TERMS: TermData[] = [
  { id: "a1", es: "Izquierda / Derecha", ru: "Налево / Направо", desc: "Главные команды инструктора: Girar a la izquierda (повернуть налево).", icon: <MoveRight className="w-6 h-6 text-slate-700" /> },
  { id: "a2", es: "Glorieta (Rotonda)", ru: "Круговое движение", desc: "Самый частый элемент дорог Испании. Tercera salida - третий съезд.", icon: <ArrowUpRight className="w-6 h-6 text-emerald-600" /> },
  { id: "a3", es: "Ceda el paso", ru: "Уступи дорогу", desc: "Знак в виде перевернутого треугольника. Ключевое правило безопасности.", icon: <Ban className="w-6 h-6 text-rose-500" /> },
  { id: "a4", es: "Paso de peatones", ru: "Пешеходный переход", desc: "В Испании к ним относятся с максимальным уважением. Тормозить заранее!", icon: <Eye className="w-6 h-6 text-blue-700" /> },
  { id: "a5", es: "Estacionar / Aparcar", ru: "Припарковаться", desc: "Остановка (Parada - до 2 мин, не выходя) и стоянка (Estacionamiento).", icon: <StopCircle className="w-6 h-6 text-amber-500" /> },
  { id: "a6", es: "Acelerar / Frenar", ru: "Ускориться / Затормозить", desc: "Límite de velocidad — ограничение скорости, нужно строго соблюдать.", icon: <Gauge className="w-6 h-6 text-purple-600" /> },
];

// ─── FRONT / BACK COMPONENTS ───

function TermFront({ data }: { data: TermData }) {
  return (
    <div className="flex flex-col h-full w-full p-6 justify-center items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6 shadow-xl">
        {data.icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2 text-slate-900">
        {data.es}
      </h3>
      <p className="text-sm font-medium text-blue-600">Нажми, чтобы перевести</p>
    </div>
  );
}

function TermBack({ data }: { data: TermData }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <h3 className="text-lg font-bold text-slate-900 mb-3">
        {data.ru}
      </h3>
      <p className="text-sm text-blue-900/70 leading-relaxed mb-6">
        {data.desc}
      </p>
      <div className="uppercase tracking-widest text-[10px] font-bold text-blue-600/50">
        Справочник DGT
      </div>
    </div>
  );
}

// ─── Главный Экран ────────────────────────────────────────────────────────────

export default function ArticleDictionary() {

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          <main className="lg:col-span-8">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Все статьи
            </Link>

            <div className="mb-8">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full mb-4">
                Полезно
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
                Испанский словарик будущего водителя: термины DGT
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                Если вы планируете сдачу теории и практики на водительские права в Испании, важно понимать язык экзаменаторов. Мы собрали самые частые термины в формате интерактивных карточек.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 4 апреля 2025</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 5 мин чтения</span>
              </div>
            </div>

            <ArticleImage
              src="/assets/blog/slovar-dgt.jpg"
              alt="Словарь испанского водителя, DGT термины"
              caption="Интерактивный глоссарий: нажимайте на карточки, чтобы учить перевод!"
              fullWidth
            />

            <ArticleCallout type="info" title="Интерактивные карточки">
              Наведите курсор (или нажмите с телефона) на карточку, чтобы перевернуть её и увидеть русский перевод с детальным объяснением термина.
            </ArticleCallout>

            <ArticleDivider label="Общие термины и документы" />
            
            <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
              {COMMON_TERMS.map((term) => (
                <div key={term.id} className="w-full sm:w-[calc(50%-10px)] max-w-sm shrink-0 flex justify-center">
                  <FlippingCard
                    width={280}
                    height={220}
                    className="w-full max-w-sm"
                    frontContent={<TermFront data={term} />}
                    backContent={<TermBack data={term} />}
                  />
                </div>
              ))}
            </div>

            <ArticleBanner variant="compact" basePrice={199} />

            <ArticleDivider label="На дороге: Команды экзаменатора" />

            <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
              {ACTIONS_TERMS.map((term) => (
                <div key={term.id} className="w-full sm:w-[calc(50%-10px)] max-w-sm shrink-0 flex justify-center">
                  <FlippingCard
                    width={280}
                    height={220}
                    className="w-full max-w-sm"
                    frontContent={<TermFront data={term} />}
                    backContent={<TermBack data={term} />}
                  />
                </div>
              ))}
            </div>

            <div className="mt-16 bg-gradient-to-r from-blue-900/30 to-blue-500/10 border border-blue-500/20 rounded-2xl p-6 lg:p-10 text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Учите термины прямо во время тестов</h3>
              <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
                Теория DGT сложна из-за специфического испанского языка. На нашей платформе вы решаете оригинальные испанские тесты с моментальным профессиональным переводом и разбором от AI.
              </p>
              <a
                href="https://t.me/skilyapp_bot?start=course"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all"
              >
                Начать обучение
              </a>
            </div>

          </main>

          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="text-slate-900 font-bold text-sm mb-2">💡 Совет по практике</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Экзаменатор ВСЕГДА дает команды на испанском. Даже легкий акцент или неуверенность могут привести к ошибке. Заучите команды до автоматизма!
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
