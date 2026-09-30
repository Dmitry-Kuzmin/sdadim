export function SectionHead({ index, eyebrow, title, desc }: { index: string; eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-10 max-w-2xl md:mb-14">
      <p className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="tabular-nums text-blue-600">{index}</span>
        <span className="h-px w-6 bg-slate-300" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl text-balance">{title}</h2>
      {desc && <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg text-pretty">{desc}</p>}
    </div>
  );
}
