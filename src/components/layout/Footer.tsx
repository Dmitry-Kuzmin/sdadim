import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const COLUMNS = [
  {
    title: "Курс",
    links: [
      { href: "/#how", label: "Как проходит" },
      { href: "/#pricing", label: "Цены" },
      { href: "/#faq", label: "Вопросы" },
      { href: "/blog", label: "Блог" },
    ],
  },
  {
    title: "Документы",
    links: [
      { href: "/legal/terms", label: "Оферта" },
      { href: "/legal/privacy", label: "Конфиденциальность" },
      { href: "/legal/cookies", label: "Cookies" },
      { href: "/legal/refund", label: "Возврат" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/favicon-s.svg" alt="" className="h-8 w-8 rounded-[22%]" />
              <span className="text-[17px] font-semibold tracking-tight text-slate-900">Sdadim</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Онлайн-подготовка к теоретическому экзамену DGT на русском языке. Проект Skilyapp.
            </p>
            <a
              href="mailto:support@skilyapp.com"
              className="mt-4 inline-block text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              support@skilyapp.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Sdadim.eu · Не является автошколой и не выдаёт документы DGT</p>
          <a
            href="https://www.nrtv.studio"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-slate-700"
          >
            <img src="/nrtv-logo.png" alt="" className="h-5 w-5 rounded bg-[#0f172a] p-0.5" />
            Сайт сделан в NRTV
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
