import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  /** Фото — только реальное, с согласия студента. Без него показываем инициал. */
  image?: string;
}

/**
 * Infinite auto-scrolling testimonials column.
 *
 * Critical for smooth looping:
 *  - Content is duplicated exactly once (2 copies).
 *  - Animation translates to -50% so the second copy aligns perfectly with start.
 *  - `gap` and `pb` MUST be equal so there's no jump at the loop point.
 */
export const TestimonialsColumn = ({
  className,
  testimonials,
  duration = 15,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  const reduce = useReducedMotion();
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        animate={reduce ? undefined : { translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        // gap and pb MUST match for seamless loop
        className="flex flex-col gap-4 pb-4"
      >
        {[0, 1].map((copyIdx) => (
          <React.Fragment key={copyIdx}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <figure
                key={`${copyIdx}-${i}`}
                aria-hidden={copyIdx === 1}
                className="w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-7"
              >
                <blockquote className="text-[15px] leading-relaxed text-slate-700">{text}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {image ? (
                    <img src={image} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {name[0]}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{name}</span>
                    <span className="block truncate text-xs text-slate-500">{role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
