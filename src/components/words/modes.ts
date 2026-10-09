/** Игры тренажёра — одно описание для карточек на страницах и для самого тренажёра. */
export type ModeId = "daily" | "road" | "radar" | "pairs" | "build" | "phrase" | "gap" | "listen";

/**
 * kind: daily — главный урок; drill — упражнения, пишут в интервальное повторение;
 * arcade — на скорость и рекорд, дают только опыт. text — одна фраза «что делать».
 */
export type ModeInfo = { id: ModeId; kind: "daily" | "drill" | "arcade"; emoji: string; title: string; text: string; tag: string; color: string };

export const MODES: ModeInfo[] = [
  {
    id: "daily",
    kind: "daily",
    emoji: "🎯",
    title: "Тренировка дня",
    text: "Повторяет то, что вы начали забывать, и добавляет новые слова. Картинка, слух, сборка — всё в одном уроке.",
    tag: "5 минут",
    color: "blue",
  },
  {
    id: "build",
    kind: "drill",
    emoji: "🔤",
    title: "Конструктор",
    text: "Соберите испанское слово из букв по картинке и переводу.",
    tag: "написание",
    color: "rose",
  },
  {
    id: "listen",
    kind: "drill",
    emoji: "🎧",
    title: "На слух",
    text: "Слушаете слово — выбираете перевод. Как на практике, где команды звучат.",
    tag: "аудирование",
    color: "orange",
  },
  {
    id: "gap",
    kind: "drill",
    emoji: "🕳️",
    title: "Пропуск в вопросе",
    text: "Из вопроса экзамена пропало слово — вставьте нужное.",
    tag: "контекст",
    color: "indigo",
  },
  {
    id: "phrase",
    kind: "drill",
    emoji: "🧩",
    title: "Собери вопрос",
    text: "Сложите настоящий вопрос DGT из кусочков по русскому переводу.",
    tag: "вопросы DGT",
    color: "cyan",
  },
  {
    id: "road",
    kind: "arcade",
    emoji: "🏁",
    title: "Трасса",
    text: "Слово на знаке — перестройтесь в полосу с правильным переводом.",
    tag: "3 жизни",
    color: "emerald",
  },
  {
    id: "radar",
    kind: "arcade",
    emoji: "📡",
    title: "Радар",
    text: "Перевод верный или нет? Отвечайте быстро — серия умножает очки.",
    tag: "60 секунд",
    color: "amber",
  },
  {
    id: "pairs",
    kind: "arcade",
    emoji: "🔗",
    title: "Пары на время",
    text: "Соедините слова с переводами быстрее своего рекорда.",
    tag: "3 раунда",
    color: "violet",
  },
];
