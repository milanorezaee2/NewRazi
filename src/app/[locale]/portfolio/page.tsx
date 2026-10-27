import { isStudioPortfolio, isPublishedPortfolio } from "@/lib/artist/portfolio";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { RAZIEH_PROFILE } from "@/lib/razieh-profile";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { PortfolioCollaboration, PortfolioIntro } from "@/components/portfolio/PortfolioIntro";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { EducationCard } from "@/components/cards/EducationCard";
import { publicEducationItems } from "@/lib/academy/publication";
import { enrichEducation, enrichPortfolio, getSite } from "@/lib/data/queries";
import { dictionaries } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { getUsedPortfolioCategories } from "@/lib/portfolio-categories";
import { getEditableRouteMetadata } from "@/lib/site-seo";
import { href } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return getEditableRouteMetadata("/portfolio", locale, dictionaries[locale].nav.portfolio);
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const content = await getSite();
  const site = { ...content, portfolios: content.portfolios.filter(p => isStudioPortfolio(p) && isPublishedPortfolio(p)) };
  const items = site.portfolios.map((p) => enrichPortfolio(site, p));
  const categories = getUsedPortfolioCategories(site);

  /* Courses shown at the end of the gallery: featured first, then popular ones. */
  const education = publicEducationItems(content.education).map((item) => enrichEducation(content, item));
  const academyItems = [
    ...education.filter((item) => item.featured),
    ...education.filter((item) => !item.featured && item.popular),
    ...education.filter((item) => !item.featured && !item.popular),
  ].slice(0, 3);

  // Studio-specific media; never use an artist portfolio's first item as the hero.
  const instructor = site.artists.find(artist => artist.id === "artist-razieh-khairipour");

  return (
    <>
      <PortfolioHero
        locale={locale}
        background="/images/hero/hero-back.webp"
        video={{ src: "/videos/academy/preview.mp4", poster: "/images/portfolios/pf-process.jpg" }}
        instructor={{
          name: instructor?.name ?? RAZIEH_PROFILE.name,
          profession: instructor?.profession ?? RAZIEH_PROFILE.role,
          avatar: instructor?.avatar,
        }}
        settings={content.portfolioHero}
      />

      {/* The founder's introduction — who the studio belongs to, in full */}
      <PortfolioIntro locale={locale} />

      {/* Works heading — the gallery that follows the introduction */}
      <section id="works" className="container-x scroll-mt-[calc(var(--header-h)+1rem)] pt-16">
        <p className="text-label flex items-center gap-3 text-accent">
          <span className="inline-block h-px w-6 bg-accent/60" />
          {locale === "fa" ? "آثار و پروژه‌ها" : "Works & projects"}
        </p>
        <h2 className="mt-4 font-display text-h2 text-balance">
          {locale === "fa" ? "آثار منتخب و روایت‌های طراحی" : "Selected works & design stories"}
        </h2>
        <p className="mt-3 max-w-2xl text-body-lg text-foreground-secondary">
          {locale === "fa"
            ? "نگاهی به طراحی پترن، ساخت پارچه، ترکیب رنگ و پروژه‌های پوشیدنی و فضایی."
            : "A look at pattern design, textile making, colour, and wearable or spatial work."}
        </p>
      </section>

      {/* Stats bar */}
      <section className="container-x pt-8 pb-4">
        <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-background-secondary rtl:divide-x-reverse">
          {[
            [items.length, locale === "fa" ? "اثر و روایت" : "Works & stories"],
            [categories.length, locale === "fa" ? "دسته‌بندی" : "Categories"],
            [new Set(site.portfolios.map((p) => p.artistId).filter(Boolean)).size, locale === "fa" ? "طراح همکار" : "Contributing designers"],
          ].map(([val, label]) => (
            <div key={String(label)} className="flex flex-col items-center gap-0.5 py-6 text-center">
              <span className="font-display text-h2 tabular-nums leading-none">{val}</span>
              <span className="text-caption text-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="container-x pb-20 pt-6">
        <Suspense>
          <PortfolioGrid items={items} categories={categories} />
        </Suspense>
      </section>

      {/* Bridge to the academy — the second public page */}
      {academyItems.length > 0 && (
        <section className="bg-background-secondary">
          <div className="container-x section-y">
            <SectionHeader
              eyebrow={locale === "fa" ? "آکادمی آتلیه رزی" : "Rosie Atelier Academy"}
              title={locale === "fa" ? "این تکنیک‌ها را در آکادمی یاد بگیرید" : "Learn these techniques at the academy"}
              description={
                locale === "fa"
                  ? "همان روش‌هایی که پشت این آثار است — از طراحی موتیف و تکرار بی‌درز تا رنگ و مقیاس برای کاغذدیواری و پارچه — در قالب دوره، کارگاه و رویداد زنده."
                  : "The same methods behind these works — motif design, seamless repeats, colour and scale for wallpaper and textile — as courses, workshops and live events."
              }
              href={href(locale, "/academy")}
              hrefLabel={locale === "fa" ? "همه دوره‌های آکادمی" : "All academy courses"}
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {academyItems.map((item, index) => (
                <Reveal key={item.id} delay={index * 70}>
                  <EducationCard item={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing band — the ways to work with the atelier */}
      <PortfolioCollaboration locale={locale} />
    </>
  );
}
