/** Иконки по имени для frontmatter статей (мета-строка, сайдбар) */
import {
  AlertTriangle, BookOpen, Calendar, CheckCircle2, Clock, Coins, Fuel, Gauge, Lightbulb, Navigation, Receipt, ShieldAlert, ShieldCheck,
} from "@lucide/astro";

export const ARTICLE_ICONS = {
  calendar: Calendar,
  clock: Clock,
  receipt: Receipt,
  fuel: Fuel,
  check: CheckCircle2,
  alert: AlertTriangle,
  coins: Coins,
  gauge: Gauge,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  navigation: Navigation,
  lightbulb: Lightbulb,
  book: BookOpen,
} as const;

export type ArticleIcon = keyof typeof ARTICLE_ICONS;
