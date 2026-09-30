import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const read = (): Theme =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0a0e16" : "#ffffff");
}

/** Тема сайта: класс .dark на <html> (ставится ещё в index.html, до отрисовки) */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read);

  // Пока пользователь не выбрал тему сам — следуем за системной
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("theme")) return;
      } catch {
        /* storage недоступен — просто следуем системе */
      }
      const next = e.matches ? "dark" : "light";
      apply(next);
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = read() === "dark" ? "light" : "dark";
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* приватный режим — тема не запомнится, но переключится */
    }
  }, []);

  return { theme, toggle };
}
