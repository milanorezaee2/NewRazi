import type { Metadata } from "next";
import type { Localized, Locale } from "@/lib/i18n/types";
import type { SeoMeta } from "@/lib/types";

export interface SeoRouteDefinition extends SeoMeta {
  label: string;
}

const l = (fa: string, en: string): Localized => ({ fa, en });

/** Public, stable routes whose metadata is managed by the main admin SEO tab. */
export const SEO_ROUTE_DEFAULTS: readonly SeoRouteDefinition[] = [
  { path: "/academy", label: "آکادمی", title: l("آکادمی — آتلیه رزی", "Academy — Rosie Atelier"), description: l("آموزش طراحی پترن از مبانی تا کاغذدیواری و پارچه؛ دوره‌ها، کارگاه‌ها و رویدادهای زنده.", "Pattern design education from foundations to wallpaper and textile: courses, workshops and live events.") },
  { path: "/portfolio", label: "پورتفولیو", title: l("پورتفولیو — آتلیه رزی", "Portfolio — Rosie Atelier"), description: l("آثار منتخب و روایت‌های طراحی راضیه خیری‌پور: پترن، پارچه، رنگ و فضا.", "Selected works and design stories by Razieh Kheiripour: pattern, textile, colour and space.") },
];

const DEFAULTS_BY_PATH = new Map(SEO_ROUTE_DEFAULTS.map((route) => [route.path, route]));

export function mergeSeoEntries(seo: readonly SeoMeta[] = []): SeoMeta[] {
  const storedByPath = new Map(seo.map((entry) => [entry.path, entry]));
  const managed = SEO_ROUTE_DEFAULTS.map((route) => {
    const stored = storedByPath.get(route.path);
    return {
      path: route.path,
      title: stored?.title ?? route.title,
      description: stored?.description ?? route.description,
    };
  });
  /* Routes that no longer exist are ignored instead of being re-surfaced. */
  return managed;
}

export function resolveSeoEntry(
  seo: readonly SeoMeta[] = [],
  path: string,
): SeoMeta | undefined {
  return seo.find((entry) => entry.path === path) ?? DEFAULTS_BY_PATH.get(path);
}

export function createSeoMetadata(
  seo: readonly SeoMeta[],
  path: string,
  locale: Locale,
  fallbackTitle: string,
  fallbackDescription?: string,
): Metadata {
  const entry = resolveSeoEntry(seo, path);
  const routeDefaults = DEFAULTS_BY_PATH.get(path);
  const title = entry?.title?.[locale]?.trim() || routeDefaults?.title[locale] || fallbackTitle;
  const description = entry?.description?.[locale]?.trim() || routeDefaults?.description[locale] || fallbackDescription;
  const canonical = `/${locale}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;

  return {
    title: { absolute: title },
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      ...(description ? { description } : {}),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
    },
  };
}
