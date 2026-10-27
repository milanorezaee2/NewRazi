"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GalleryHorizontalEnd,
  GraduationCap,
  Layers,
  Monitor,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeroManager } from "@/components/admin/PageHeroManager";
import { PortfolioHeroManager } from "@/components/admin/PortfolioHeroManager";
import {
  ACADEMY_SECTIONS,
  PORTFOLIO_SECTIONS,
  resolvePages,
  type PageHeroSettings,
  type PageKey,
  type PageSectionSetting,
  type PagesSettings,
} from "@/lib/page-settings";
import type { PortfolioHeroSettings, SiteContent } from "@/lib/types";
import { portfolioHero as defaultPortfolioHero } from "@/lib/data/seed";
import { cn } from "@/lib/utils";

const PAGE_TABS: { id: PageKey; label: string; icon: React.ReactNode; path: string }[] = [
  { id: "portfolio", label: "پورتفولیو", icon: <GalleryHorizontalEnd className="h-4 w-4" />, path: "/portfolio" },
  { id: "academy", label: "آکادمی", icon: <GraduationCap className="h-4 w-4" />, path: "/academy" },
];

type SubTab = "hero" | "sections" | "style";

/**
 * «مدیریت صفحه‌ها» — one place that owns everything the two public pages render:
 * the cinematic hero sequence, the copy, the section order/visibility, and the
 * portfolio hero's appearance.
 */
export function PagesManager({
  data,
  update,
  locale,
}: {
  data: SiteContent;
  update: (patch: Partial<SiteContent>) => void;
  locale: "fa" | "en";
}) {
  const [page, setPage] = useState<PageKey>("portfolio");
  const [sub, setSub] = useState<SubTab>("hero");

  const pages = useMemo(() => resolvePages(data.pages), [data.pages]);
  const vocabulary = page === "portfolio" ? PORTFOLIO_SECTIONS : ACADEMY_SECTIONS;

  const writePages = (next: PagesSettings) => update({ pages: next });

  const writeHero = (hero: PageHeroSettings) => {
    writePages({ ...pages, [page]: { ...pages[page], hero } });
  };

  const writeSections = (sections: PageSectionSetting[]) => {
    writePages({ ...pages, [page]: { ...pages[page], sections } });
  };

  const toggleSection = (id: string) => {
    writeSections(pages[page].sections.map((section) => (
      section.id === id ? { ...section, visible: !section.visible } : section
    )));
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    const list = [...pages[page].sections];
    const index = list.findIndex((section) => section.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    writeSections(list);
  };

  const hiddenCount = pages[page].sections.filter((section) => !section.visible).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Layers className="h-5 w-5 text-accent" />
            مدیریت صفحه‌ها
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            هیرو سینمایی، متن، ترتیب و نمایش بخش‌های هر دو صفحهٔ عمومی — همه از همین‌جا.
          </p>
        </div>
        <Link
          href={`/${locale}/${page}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <Eye className="h-3.5 w-3.5" />
          دیدن صفحهٔ زنده
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Page tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background-secondary p-1">
        {PAGE_TABS.map((tab) => {
          const state = pages[tab.id];
          const hidden = state.sections.filter((section) => !section.visible).length;
          return (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                page === tab.id ? "bg-white text-foreground shadow-sm" : "text-foreground-secondary hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
              <span className="rounded-full bg-border/60 px-1.5 py-0.5 text-[10px] tabular">
                {state.hero.slides.length} فریم · {hidden ? `${hidden} پنهان` : "کامل"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "hero" as SubTab, label: "هیرو سینمایی", icon: <Monitor className="h-3.5 w-3.5" /> },
          { id: "sections" as SubTab, label: `بخش‌ها (${pages[page].sections.length})`, icon: <Layers className="h-3.5 w-3.5" /> },
          ...(page === "portfolio"
            ? [{ id: "style" as SubTab, label: "ظاهر و مدرس", icon: <Palette className="h-3.5 w-3.5" /> }]
            : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSub(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              sub === tab.id
                ? "bg-[#1e2230] text-white"
                : "border border-border bg-white text-foreground-secondary hover:border-accent/60",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {sub === "hero" && (
        <PageHeroManager hero={pages[page].hero} onChange={writeHero} page={page} />
      )}

      {/* Sections */}
      {sub === "sections" && (
        <div className="rounded-xl border border-border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">ترتیب و نمایش بخش‌ها</h3>
              <p className="mt-1 text-xs text-muted">
                با فلش‌ها ترتیب را تغییر دهید؛ با چشم، هر بخش را پنهان یا نمایان کنید. {hiddenCount > 0 && `${hiddenCount} بخش پنهان است.`}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => writeSections(vocabulary.map((section) => ({ id: section.id, visible: true })))}
              className="flex items-center gap-1.5"
            >
              <Eye className="h-4 w-4" /> نمایش همه
            </Button>
          </div>

          <ol className="divide-y divide-border">
            {pages[page].sections.map((section, index) => {
              const meta = vocabulary.find((entry) => entry.id === section.id);
              const label = meta ? (locale === "fa" ? meta.labelFa : meta.labelEn) : section.id;
              return (
                <li key={section.id} className={cn("flex items-center gap-3 px-4 py-3", !section.visible && "opacity-55")}>
                  <span className="w-6 shrink-0 text-center text-[11px] tabular text-muted">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{label}</span>
                  {section.id === "trust" && page === "portfolio" && (
                    <span className="rounded-full bg-background-secondary px-2 py-0.5 text-[10px] text-muted">بالای گرید</span>
                  )}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]",
                      section.visible
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-border text-muted",
                    )}
                  >
                    {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {section.visible ? "نمایان" : "پنهان"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(section.id, -1)}
                      disabled={index === 0}
                      className="rounded-md border border-border p-1 text-muted hover:bg-background-secondary disabled:opacity-30"
                      aria-label="بالا"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 1)}
                      disabled={index === pages[page].sections.length - 1}
                      className="rounded-md border border-border p-1 text-muted hover:bg-background-secondary disabled:opacity-30"
                      aria-label="پایین"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Portfolio hero appearance (existing controls, kept intact) */}
      {sub === "style" && page === "portfolio" && (
        <PortfolioHeroManager
          settings={data.portfolioHero ?? defaultPortfolioHero}
          onChange={(portfolioHero: PortfolioHeroSettings) => update({ portfolioHero })}
        />
      )}
    </div>
  );
}
