/** Ссылки в Telegram-бот. Без React: используются и в островах, и в обычных <script>. */
export const BOT_URL = "https://t.me/skilyapp_bot";

/** Событие на window: калькулятор пройден, detail — код ответов */
export const QUIZ_EVENT = "sdadim:quiz";

/** Прошёл калькулятор — ответы уходят в бот с любой кнопкой */
export const botLink = (param: string, code: string | null) => `${BOT_URL}?start=${code ? `${param}_${code}` : param}`;

/** Конверсия Google Ads по клику на оплату */
export const trackConversion = () => {
  const w = window as any;
  if (w.gtag) w.gtag("event", "conversion", { send_to: "AW-18034090184/LGu7CMTx0pMcEMjBqZdD" });
};

/** Калькулятор пройден: код ответов — во все ссылки в бот на странице (слушатель — index.astro) */
export function setQuizCode(code: string) {
  window.dispatchEvent(new CustomEvent(QUIZ_EVENT, { detail: code }));
}
