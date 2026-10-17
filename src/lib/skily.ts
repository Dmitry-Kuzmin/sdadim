/**
 * Skilyapp — тренажёр DGT на русском. Ссылки и возможности для промо-блоков
 * (баннер под шапкой, карточка в сайдбаре, <Skily /> в статьях) — только отсюда.
 */
const BASE = "https://skilyapp.com";

/** Ссылка в Skilyapp с UTM: видно, какой блок на sdadim.eu привёл человека */
export const skilyUrl = (path: string, place: string) => `${BASE}${path}${path.includes("?") ? "&" : "?"}utm_source=sdadim&utm_medium=${place}&utm_campaign=skily`;

export const SKILY_FEATURES = {
  tests: {
    emoji: "📝",
    title: "Все вопросы DGT на русском",
    text: "Официальные билеты с переводом, 9 режимов тренировки, пробный экзамен 30 вопросов за 30 минут и банк ваших ошибок.",
    cta: "Пройти тест",
    path: "/ru",
  },
  duels: {
    emoji: "⚔️",
    title: "Дуэли и игры",
    text: "Сражайтесь с другом или случайным соперником на вопросах DGT, качайте рейтинг, проходите игры на знаки, скорости и перекрёстки.",
    cta: "Сыграть дуэль",
    path: "/games",
  },
  dictionary: {
    emoji: "📖",
    title: "Бесплатный словарь DGT",
    text: "Испанские слова из экзаменационных вопросов — с переводом, примерами и ловушками формулировок. Поиск по-испански и по-русски.",
    cta: "Открыть словарь",
    path: "/ru/dictionary",
  },
  lingo: {
    emoji: "🇪🇸",
    title: "Испанский для экзамена",
    text: "Курс испанского именно под DGT: теория, словарь и практика — чтобы понимать формулировки, а не зубрить ответы.",
    cta: "Начать курс",
    path: "/lingo",
  },
  course: {
    emoji: "🎓",
    title: "Курс DGT по темам учебника",
    text: "Короткие уроки с картинками и тестами из банка DGT после каждого — тема за темой, как в официальном учебнике. Курс входит в Premium, первые 3 дня бесплатно.",
    cta: "Открыть курс",
    path: "/learning",
  },
  ai: {
    emoji: "🤖",
    title: "ИИ-наставник Skily",
    text: "Объясняет каждую ошибку по-русски, помнит ваши слабые темы и подсказывает, что повторить перед экзаменом.",
    cta: "Спросить Skily",
    path: "/ru",
  },
} as const;

export type SkilyFeature = keyof typeof SKILY_FEATURES;

/** Модули курса Skilyapp (course_modules): ссылка «/learning?m=<id>» открывает карту сразу на нужной теме */
export const SKILY_COURSE_MODULES = {
  1: "bef4ce90-5902-49d1-a082-173faeefda12",
  2: "b5eb6fa0-5d1f-46bc-8af1-cf953255e07d",
  3: "326eb027-5ee7-4609-bbc8-1e92acf6720f",
  4: "782c62e0-2011-4cce-8753-8d0933c92ea5",
  5: "19a0624a-f953-4bf0-9d32-ecb849dccb9b",
  6: "e55587a7-4fa0-4fcf-ba30-b0ff25bc4732",
  7: "3cb740fc-982f-428a-9939-109a18a97990",
} as const;
export const skilyCoursePath = (tema: keyof typeof SKILY_COURSE_MODULES) => `/learning?m=${SKILY_COURSE_MODULES[tema]}`;

/** Баннер после вопросов экзамена на странице слова (/ispanskij-dlya-dgt/slovo/…). Число — как в самом Skilyapp. */
export const SKILY_EXAM = {
  title: "Ещё 3000+ таких вопросов — в Skilyapp",
  text: "На экзамене DGT — 30 вопросов, ошибиться можно не больше трёх раз. Тренируйтесь на всех вопросах с картинками, переводом и разбором.",
  points: ["Все вопросы DGT с переводом на русский", "Пробный экзамен: 30 вопросов за 30 минут", "ИИ-наставник объясняет каждую ошибку", "Дуэли с друзьями и банк ошибок"],
  cta: "Тренироваться в Skilyapp",
  path: "/ru",
} as const;
