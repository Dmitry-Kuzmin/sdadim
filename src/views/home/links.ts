/** Ссылки в Telegram-бот. Без React: используются и в островах, и в обычных <script>. */
export const BOT_URL = "https://t.me/skilyapp_bot";

/** Событие на window: калькулятор пройден, detail — код ответов */
export const QUIZ_EVENT = "sdadim:quiz";

/** Прошёл калькулятор — ответы уходят в бот с любой кнопкой */
export const botLink = (param: string, code: string | null) => `${BOT_URL}?start=${code ? `${param}_${code}` : param}`;
