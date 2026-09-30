/**
 * Puppeteer нужен только локально — для `npm run covers` (рендер обложек блога).
 * В CI и на Vercel не скачиваем Chrome (~150 МБ) при установке зависимостей.
 */
module.exports = {
  skipDownload: Boolean(process.env.CI || process.env.VERCEL),
};
