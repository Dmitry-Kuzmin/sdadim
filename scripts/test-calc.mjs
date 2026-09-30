// Регрессионный тест калькуляторов: node scripts/test-calc.mjs [baseUrl] [screenshot.png]
import puppeteer from "puppeteer";
const base = process.argv[2] || "http://localhost:4399";
const b = await puppeteer.launch({ headless: "new" });
const p = await b.newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type()==="error" && errs.push(m.text()));
await p.goto(base + "/", { waitUntil: "networkidle0" });
// Калькулятор — остров client:visible: докручиваем и ждём гидратации (Astro снимает атрибут ssr)
await p.evaluate(() => document.getElementById("calc").scrollIntoView());
await p.waitForFunction(() => !document.getElementById("calc").closest("astro-island").hasAttribute("ssr"), { timeout: 15000 });
const paths = [
  ["ВНЖ (TIE)", "Нет, сдаю с нуля", "Свободно читаю", "Да, изучал(а)", "Уже умею водить"],
  ["ВНЖ (TIE)", "Есть, не из ЕС", "Базовый", "Частично", "Немного практики"],
  ["Документы в процессе", "Нет, сдаю с нуля", "Почти не знаю", "Нет, знаю только свои", "Учусь с нуля"],
];
for (const path of paths) {
  await p.evaluate(() => { const r = [...document.querySelectorAll("#calc button")].find(x => x.textContent.includes("Пройти заново")); r && r.click(); });
  await new Promise(r => setTimeout(r, 300));
  for (const l of path) { await p.evaluate(l => [...document.querySelectorAll("#calc button")].find(x => x.textContent.includes(l)).click(), l); await new Promise(r => setTimeout(r, 700)); }
  console.log(await p.evaluate(() => { const t = document.querySelector("#calc").innerText.replace(/\s+/g, " "); return (t.match(/Вам подойдёт (.+?) €/)||[])[1] + " |" + t.split("Итого")[1].slice(0, 60); }));
}
await p.goto(base + "/blog/tseny-na-prava", { waitUntil: "networkidle0" });
await p.waitForFunction(() => ![...document.querySelectorAll("astro-island")].some((i) => i.hasAttribute("ssr")), { timeout: 15000 });
console.log("article:", await p.evaluate(() => (document.body.innerText.match(/Итого\s+([\d\s ,]+€)/) || [])[1]));
await p.setViewport({ width: 390, height: 844 });
await p.goto(base + "/", { waitUntil: "networkidle0" });
await p.screenshot({ path: process.argv[3] || "/tmp/home.png" });
console.log("errors:", errs.length ? errs : "none");
await b.close();
