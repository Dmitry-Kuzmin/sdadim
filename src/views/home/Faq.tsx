import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_CATEGORIES, FAQ_DATA } from "@/lib/home-faq";
import { cn } from "@/lib/utils";
import { SectionHead } from "./SectionHead";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-6 py-5 text-left">
        <span className="text-[15px] font-medium text-slate-900 sm:text-base">{q}</span>
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 transition-transform", open && "rotate-180")}>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </span>
      </button>
      {open && <p className="pb-6 pr-4 text-[15px] leading-relaxed text-slate-600 whitespace-pre-line sm:pr-12">{a}</p>}
    </div>
  );
}

export function Faq() {
  const [tab, setTab] = useState<keyof typeof FAQ_CATEGORIES>("process");
  return (
    <section id="faq" className="cv-auto scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 [&>*]:min-w-0">
        <div>
          <SectionHead index="06" eyebrow="Вопросы" title="Частые вопросы" />
          <div className="-mx-4 -mt-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide lg:mx-0 lg:mt-0 lg:flex-col lg:items-start lg:overflow-visible lg:px-0">
            {(Object.keys(FAQ_CATEGORIES) as (keyof typeof FAQ_CATEGORIES)[]).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors lg:rounded-lg lg:px-3",
                  tab === key ? "bg-inverse text-on-inverse" : "border border-slate-200 text-slate-600 hover:text-slate-900 lg:border-transparent"
                )}
              >
                {FAQ_CATEGORIES[key]}
              </button>
            ))}
          </div>
        </div>
        <div key={tab} className="border-t border-slate-200 lg:mt-2">
          {FAQ_DATA[tab].map((item) => (
            <FaqItem key={item.question} q={item.question} a={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
