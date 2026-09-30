/**
 * Замена react-router-dom для Astro (многостраничный сайт: каждая страница — свой HTML).
 * Подключается через alias в astro.config.mjs, поэтому компоненты с `import { Link } from "react-router-dom"`
 * работают без правок: <Link> рендерится в обычный <a>, переходы — полная загрузка страницы.
 */
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> & {
  to: string;
  replace?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
  children?: ReactNode | ((state: { isActive: boolean }) => ReactNode);
};

const currentPath = () => (typeof window === "undefined" ? "" : window.location.pathname);

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, replace: _r, className, children, ...rest }, ref) {
  const isActive = false;
  return (
    <a ref={ref} href={to} className={typeof className === "function" ? className({ isActive }) : className} {...rest}>
      {typeof children === "function" ? children({ isActive }) : children}
    </a>
  );
});

export const NavLink = Link;

export function useLocation() {
  return {
    pathname: currentPath(),
    search: typeof window === "undefined" ? "" : window.location.search,
    hash: typeof window === "undefined" ? "" : window.location.hash,
  };
}

export function useNavigate() {
  return (to: string | number) => {
    if (typeof to === "number") window.history.go(to);
    else window.location.href = to;
  };
}

export function useParams<T extends Record<string, string | undefined>>(): Partial<T> {
  return {} as Partial<T>;
}

export function Navigate({ to }: { to: string; replace?: boolean }) {
  if (typeof window !== "undefined") window.location.replace(to);
  return null;
}
