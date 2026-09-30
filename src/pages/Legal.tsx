import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { FileText, Shield, Cookie, CreditCard, RefreshCw, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeoHead } from "@/components/seo/SeoHead";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "terms" | "privacy" | "cookies" | "subscription" | "refund";

const TABS: { id: Tab; icon: typeof FileText; label: string }[] = [
  { id: "terms", icon: FileText, label: "Оферта" },
  { id: "privacy", icon: Shield, label: "Конфиденциальность" },
  { id: "cookies", icon: Cookie, label: "Cookies" },
  { id: "subscription", icon: CreditCard, label: "Подписка" },
  { id: "refund", icon: RefreshCw, label: "Возврат" },
];

// ─── Legal Content ────────────────────────────────────────────────────────────

const CONTENT: Record<Tab, { title: string; updated: string; sections: { title: string; body: string }[] }> = {
  terms: {
    title: "Публичная оферта",
    updated: "Последнее обновление: 1 апреля 2025",
    sections: [
      {
        title: "1. Предмет договора",
        body: "Настоящая публичная оферта регулирует условия предоставления образовательных услуг онлайн-курса по подготовке к теоретическому экзамену DGT (Испания). Продавец — Sdadim.eu. Покупатель — любое физическое лицо, оплатившее курс.",
      },
      {
        title: "2. Стоимость и порядок оплаты",
        body: "Оплата производится в полном объёме при бронировании места в курсе. Доступные тарифы: Теория (€199), С сопровождением (€259), VIP (€349). Стоимость фиксируется на момент оплаты.",
      },
      {
        title: "3. Порядок оказания услуг",
        body: "После оплаты покупатель получает доступ к учебным материалам и ссылку на закрытый чат. Живые эфиры проводятся в Zoom 2 раза в неделю по 2 часа в течение 2 месяцев.",
      },
      {
        title: "4. Права и обязанности сторон",
        body: "Sdadim.eu обязуется провести заявленное количество занятий и обеспечить доступ к материалам на весь период тарифа. Покупатель обязуется соблюдать правила сообщества и не распространять учебные материалы третьим лицам.",
      },
      {
        title: "5. Форс-мажор",
        body: "Стороны освобождаются от ответственности при наступлении обстоятельств непреодолимой силы (стихийные бедствия, действия властей и т.д.). В этom случае занятия переносятся на ближайшее возможное время.",
      },
      {
        title: "6. Применимое право",
        body: "Настоящий договор регулируется законодательством Испании. Все споры рассматриваются в судах по месту нахождения исполнителя (Таррагона, Испания).",
      },
    ],
  },
  privacy: {
    title: "Политика конфиденциальности",
    updated: "Последнее обновление: 1 апреля 2025",
    sections: [
      {
        title: "Какие данные мы собираем",
        body: "При оформлении заявки мы собираем: имя, номер телефона или Telegram-аккаунт. При посещении сайта — анонимные данные о поведении (через Google Analytics).",
      },
      {
        title: "Как мы используем данные",
        body: "Данные используются исключительно для: связи с вами по вопросам курса, отправки учебных материалов, улучшения качества сайта. Мы не продаём и не передаём данные третьим лицам без вашего согласия.",
      },
      {
        title: "Хранение данных",
        body: "Данные хранятся на защищённых серверах Supabase (EU region) и удаляются по вашему запросу в течение 30 дней.",
      },
      {
        title: "Ваши права",
        body: "Вы вправе запросить копию своих данных, их исправление или удаление. Для этого напишите на support@skilyapp.com.",
      },
      {
        title: "Контакты",
        body: "По всем вопросам конфиденциальности: support@skilyapp.com. Испания, Таррагона.",
      },
    ],
  },
  cookies: {
    title: "Политика использования Cookies",
    updated: "Последнее обновление: 1 апреля 2025",
    sections: [
      {
        title: "Что такое cookies",
        body: "Cookies — небольшие файлы, которые сохраняются в вашем браузере при посещении сайта. Они помогают нам запоминать ваши предпочтения и улучшать работу сайта.",
      },
      {
        title: "Какие cookies мы используем",
        body: "Технические cookies (необходимы для работы сайта) и аналитические cookies (Google Analytics — для понимания, как пользователи взаимодействуют с сайтом).",
      },
      {
        title: "Управление cookies",
        body: "Вы можете отключить cookies в настройках браузера. Однако это может повлиять на работу некоторых функций сайта.",
      },
    ],
  },
  subscription: {
    title: "Условия оказания услуг",
    updated: "Последнее обновление: 1 апреля 2025",
    sections: [
      {
        title: "Доступ к материалам",
        body: "После оплаты курса вы получаете доступ к материалам и платформе Skilyapp на срок, указанный в вашем тарифе (3, 6 или 12 месяцев). По истечении срока доступ к платформе прекращается, доступ к записям занятий — в соответствии с тарифом.",
      },
      {
        title: "Продление доступа",
        body: "Продление доступа к платформе Skilyapp после окончания тарифного периода осуществляется отдельно по актуальным ценам платформы.",
      },
      {
        title: "Передача доступа",
        body: "Передача доступа к курсу третьим лицам запрещена. Учётные данные являются персональными.",
      },
    ],
  },
  refund: {
    title: "Политика возврата",
    updated: "Последнее обновление: 1 апреля 2025",
    sections: [
      {
        title: "Условия возврата",
        body: "Возврат средств возможен в течение 14 дней с момента оплаты при условии, что вы не посетили более 2 занятий и не воспользовались индивидуальными консультациями.",
      },
      {
        title: "Как запросить возврат",
        body: "Напишите на support@skilyapp.com с темой «Возврат» и укажите причину. Мы рассмотрим обращение в течение 3 рабочих дней.",
      },
      {
        title: "Сроки возврата",
        body: "При одобрении возврат осуществляется на исходный способ оплаты в течение 5–10 рабочих дней.",
      },
      {
        title: "Исключения",
        body: "Возврат невозможен, если курс уже завершён, либо вы посетили более 2 занятий. VIP-тариф: возврат рассматривается индивидуально.",
      },
    ],
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Legal() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const validTab = TABS.some((t) => t.id === tab);
  if (!validTab) return <Navigate to="/legal/terms" replace />;

  const activeTab = tab as Tab;
  const content = CONTENT[activeTab];
  const seoDescriptions: Record<Tab, string> = {
    terms: "Публичная оферта и условия оказания образовательных услуг Sdadim.eu.",
    privacy: "Политика конфиденциальности Sdadim.eu и правила обработки персональных данных.",
    cookies: "Политика cookies Sdadim.eu и информация об аналитических технологиях сайта.",
    subscription: "Условия доступа к материалам, платформе и сопровождению курса Sdadim.eu.",
    refund: "Правила возврата средств и порядок подачи запроса на возврат в Sdadim.eu.",
  };

  return (
    <main className="pt-10 md:pt-14 pb-20 px-4">
      <SeoHead
        title={`${content.title} | Сдадим`}
        description={seoDescriptions[activeTab]}
        canonicalUrl={`https://sdadim.eu/legal/${activeTab}`}
      />
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Правовые документы</h1>
        <p className="text-slate-500 text-sm mb-8">Sdadim.eu · Испания, Таррагона</p>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-10 -mx-4 px-4">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => navigate(`/legal/${id}`)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                activeTab === id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">{content.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{content.updated}</p>
          </div>
          <div className="px-6 py-6 space-y-8">
            {content.sections.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-slate-900 mb-2">{section.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-400">
              Вопросы: <a href="mailto:support@skilyapp.com" className="text-blue-600 hover:underline">support@skilyapp.com</a>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
