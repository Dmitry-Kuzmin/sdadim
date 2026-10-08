import defaultColors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

/* ─────────────────────────────────────────────
   Тема через CSS-переменные.
   В светлой теме палитры — стандартные Tailwind.
   В тёмной (html.dark) шкала slate инвертируется, а у акцентных
   цветов светлые подложки (50–200) становятся тёмными, текстовые
   оттенки (600–900) — светлыми. Компоненты пишутся один раз,
   без dark:-вариантов.
   ───────────────────────────────────────────── */

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
const ACCENTS = ["blue", "emerald", "amber", "rose", "red", "sky", "violet", "purple", "orange", "yellow", "green", "teal", "cyan", "indigo"] as const;

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

// Тёмная slate: чуть «чернильнее» стандартной, чтобы фон не был серым
const SLATE_DARK: Record<(typeof SHADES)[number], string> = {
  "50": "#0e1420",
  "100": "#151d2c",
  "200": "#222c3d",
  "300": "#334155",
  "400": "#8b98ad",
  "500": "#9aa6b9",
  "600": "#a8b3c4",
  "700": "#cbd3de",
  "800": "#e2e8f0",
  "900": "#f1f5f9",
  "950": "#f8fafc",
};

function accentDark(name: string, s: string): string {
  const c = (defaultColors as any)[name] as Record<string, string>;
  const map: Record<string, string> = {
    "50": c["950"], "100": c["950"], "200": c["900"], "300": c["800"],
    "400": c["400"], "500": c["500"], "600": c["500"], "700": c["400"],
    "800": c["300"], "900": c["200"], "950": c["100"],
  };
  return map[s];
}

const varPalette = (name: string) =>
  Object.fromEntries(SHADES.map((s) => [s, `rgb(var(--c-${name}-${s}) / <alpha-value>)`]));

const themeVars = plugin(({ addBase }) => {
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  // Приглушённый текст (400/500) темнее стандартного: контраст ≥ 4.5:1 (WCAG AA) даже на slate-100
  const slate = { ...((defaultColors as any).slate as Record<string, string>), "400": "#5f6c80", "500": "#556275" };
  for (const s of SHADES) {
    light[`--c-slate-${s}`] = rgb(slate[s]);
    dark[`--c-slate-${s}`] = rgb(SLATE_DARK[s]);
    for (const a of ACCENTS) {
      light[`--c-${a}-${s}`] = rgb((defaultColors as any)[a][s]);
      dark[`--c-${a}-${s}`] = rgb(accentDark(a, s));
    }
  }
  addBase({
    ":root": {
      ...light,
      "--surface": "255 255 255",
      "--inverse": rgb(slate["900"]),
      "--on-inverse": "255 255 255",
      "--night": rgb(slate["900"]),
    },
    "html.dark": {
      ...dark,
      "--surface": "10 14 22",
      "--inverse": rgb(slate["100"]),
      "--on-inverse": rgb(slate["900"]),
      "--night": "22 30 46",
      colorScheme: "dark",
    },
    // bg-white — это «поверхность»; text-white на цветных кнопках остаётся белым
    "html.dark .bg-white": { backgroundColor: "rgb(var(--surface))" },
    ...Object.fromEntries(
      ["40", "60", "70", "80", "85", "90"].map((o) => [
        `html.dark .bg-white\\/${o}`,
        { backgroundColor: `rgb(var(--surface) / 0.${o})` },
      ])
    ),
    "html.dark .to-white": { "--tw-gradient-to": "rgb(var(--surface)) var(--tw-gradient-to-position)" },
    "html.dark .from-white": {
      "--tw-gradient-from": "rgb(var(--surface)) var(--tw-gradient-from-position)",
      "--tw-gradient-to": "rgb(var(--surface) / 0) var(--tw-gradient-to-position)",
      "--tw-gradient-stops": "var(--tw-gradient-from), var(--tw-gradient-to)",
    },
    "html.dark [class*='ring-offset']": { "--tw-ring-offset-color": "rgb(var(--surface))" },
  });
});

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        slate: varPalette("slate"),
        ...Object.fromEntries(ACCENTS.map((a) => [a, varPalette(a)])),
        surface: "rgb(var(--surface) / <alpha-value>)",
        inverse: "rgb(var(--inverse) / <alpha-value>)",
        "on-inverse": "rgb(var(--on-inverse) / <alpha-value>)",
        night: "rgb(var(--night) / <alpha-value>)",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [themeVars],
};
