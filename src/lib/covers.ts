/** srcset для обложек блога: WebP 480/800/1200 генерирует scripts/cover-variants.mjs при сборке */
const WIDTHS = [480, 800, 1200];

export function coverSrcSet(src: string): string | undefined {
  const m = src.match(/^\/assets\/blog\/([^/]+)\.jpg$/);
  if (!m) return undefined;
  return WIDTHS.map((w) => `/assets/blog/w/${m[1]}-${w}.webp ${w}w`).join(", ");
}
