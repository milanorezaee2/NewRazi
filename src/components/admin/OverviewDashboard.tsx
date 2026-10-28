"use client";

import { BookOpen, GalleryHorizontalEnd, Image as ImageIcon, Radio, ShieldCheck, Sparkles } from "lucide-react";
import type { SiteContent } from "@/lib/types";
import { publicEducationItems } from "@/lib/academy/publication";
import { isPublishedPortfolio, isStudioPortfolio } from "@/lib/artist/portfolio";
import { cn } from "@/lib/utils";

type DashboardSection = "education" | "portfolios" | "pages" | "banners" | "seo";

/**
 * Overview of the two public pages that remain: the academy and the portfolio.
 * Everything is derived from the content document the admin shell has already
 * loaded, so the dashboard needs no extra request.
 */
export function OverviewDashboard({
  data,
  setSection,
}: {
  data: SiteContent;
  setSection: (section: DashboardSection) => void;
}) {
  const education = data.education ?? [];
  const published = publicEducationItems(education);
  const courses = published.filter((item) => item.type === "course").length;
  const liveEvents = published.filter((item) => item.type !== "course").length;
  const featured = published.filter((item) => item.featured).length;

  const portfolios = data.portfolios ?? [];
  const studio = portfolios.filter((portfolio) => isStudioPortfolio(portfolio));
  const livePortfolios = studio.filter((portfolio) => isPublishedPortfolio(portfolio)).length;
  const featuredPortfolios = studio.filter((portfolio) => portfolio.featured).length;

  const academyBanners = (data.banners ?? []).filter((banner) => banner.enabled && banner.placement === "academy").length;
  const enabledBanners = (data.banners ?? []).filter((banner) => banner.enabled).length;

  const cards = [
    {
      key: "education" as const,
      icon: <BookOpen className="h-5 w-5" />,
      title: "آکادمی",
      value: courses,
      unit: "دوره",
      details: [
        `${liveEvents} رویداد زنده`,
        `${featured} مورد ویژه`,
        `${academyBanners} بنر آکادمی`,
      ],
      cta: "مدیریت آکادمی",
    },
    {
      key: "portfolios" as const,
      icon: <GalleryHorizontalEnd className="h-5 w-5" />,
      title: "پورتفولیو",
      value: livePortfolios,
      unit: "اثر منتشرشده",
      details: [`${studio.length} اثر ثبت‌شده`, `${featuredPortfolios} اثر ویژه`],
      cta: "مدیریت پورتفولیو",
    },
  ];

  const hints = [
    data.portfolioHero ? null : "هیرو پورتفولیو هنوز از مقدار پیش‌فرض استفاده می‌کند.",
    published.length === 0 ? "هیچ دوره یا رویداد منتشرشده‌ای در آکادمی وجود ندارد." : null,
    livePortfolios === 0 ? "هیچ اثر منتشرشده‌ای در پورتفولیو وجود ندارد." : null,
    enabledBanners === 0 ? "هیچ بنر فعالی تعریف نشده است." : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">داشبورد مدیریت</h1>
        <p className="mt-1 text-xs text-muted">
          این پنل فقط محتوای آکادمی و پورتفولیو را مدیریت می‌کند؛ بخش‌های فروشگاه، طراحان و بازارچه حذف شده‌اند.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setSection(card.key)}
            className="group flex flex-col gap-4 rounded-xl border border-[#e2e6ea] bg-white p-5 text-start transition hover:border-accent/40 hover:shadow-sm"
          >
            <div className="flex items-center gap-2 text-foreground-secondary">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">{card.icon}</span>
              <span className="text-sm font-semibold text-foreground">{card.title}</span>
            </div>
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl leading-none tabular-nums text-foreground">{card.value}</span>
              <span className="text-xs text-muted">{card.unit}</span>
            </p>
            <ul className="space-y-1 text-xs text-foreground-secondary">
              {card.details.map((detail) => (
                <li key={detail}>· {detail}</li>
              ))}
            </ul>
            <span className="mt-auto text-xs font-semibold text-accent group-hover:underline">{card.cta} ←</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { key: "pages" as const, icon: <ImageIcon className="h-4 w-4" />, label: "مدیریت صفحه‌ها" },
          { key: "banners" as const, icon: <Sparkles className="h-4 w-4" />, label: "بنرهای آکادمی" },
          { key: "seo" as const, icon: <Radio className="h-4 w-4" />, label: "متادیتای صفحه‌ها" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSection(item.key)}
            className="flex items-center gap-2 rounded-lg border border-[#e2e6ea] bg-white px-4 py-3 text-xs font-medium text-foreground-secondary transition hover:border-accent/40 hover:text-foreground"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className={cn("rounded-xl border p-4", hints.length ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50")}>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {hints.length ? <Sparkles className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
          {hints.length ? "نکته‌هایی برای بازبینی" : "همه‌چیز آماده است"}
        </p>
        {hints.length ? (
          <ul className="mt-2 space-y-1 text-xs text-foreground-secondary">
            {hints.map((hint) => (
              <li key={hint}>· {hint}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-foreground-secondary">دوره‌ها و آثار منتشرشده‌اند و متادیتای صفحه‌ها تنظیم شده است.</p>
        )}
      </div>
    </div>
  );
}
