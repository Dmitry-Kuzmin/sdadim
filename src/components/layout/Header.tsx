import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const NAV_LINKS = [
  { href: "/#how", label: "Как проходит" },
  { href: "/#pricing", label: "Цены" },
  { href: "/#faq", label: "Вопросы" },
  { href: "/blog", label: "Блог" },
];

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Светлая тема" : "Тёмная тема"}
      title={dark ? "Светлая тема" : "Тёмная тема"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900",
        className
      )}
    >
      <Sun className={cn("absolute h-[18px] w-[18px] transition-all duration-300", dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} />
      <Moon className={cn("absolute h-[18px] w-[18px] transition-all duration-300", dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")} />
    </button>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl transition-colors",
        scrolled || menuOpen ? "border-slate-200/80" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Sdadim — на главную">
          <img src="/favicon-s.svg" alt="" className="h-8 w-8 rounded-[22%]" />
          <span className="text-[17px] font-semibold tracking-tight text-slate-900">Sdadim</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href) ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle className="ml-2" />
          <Link
            to="/#pricing"
            className="ml-2 rounded-full bg-inverse px-4 py-2 text-sm font-medium text-on-inverse transition-colors hover:bg-inverse/85"
          >
            Записаться
          </Link>
        </nav>

        <div className="-mr-2 flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          className="p-2 text-slate-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-slate-100 py-4 text-base font-medium text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/#pricing"
            onClick={() => setMenuOpen(false)}
            className="mt-5 block rounded-xl bg-inverse py-3.5 text-center text-base font-medium text-on-inverse"
          >
            Записаться на курс
          </Link>
        </div>
      )}
    </header>
  );
}
