import Image from "@/components/ui/SiteImage";
import { ArrowDown, ArrowUpRight, UserRound } from "lucide-react";
import { CinematicBackdrop, type CinematicSlide } from "@/components/ui/CinematicBackdrop";
import { PortfolioHeroVideo } from "./PortfolioHeroVideo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Locale, Localized } from "@/lib/i18n/types";
import type { PortfolioHeroSettings } from "@/lib/types";
import { portfolioHero as defaultSettings } from "@/lib/data/seed";
import { href, t } from "@/lib/utils";

interface Props {
  locale: Locale;
  background: string;
  /** The photographic sequence behind the headline (3–4 related frames). */
  slides?: CinematicSlide[];
  video: { src: string; poster: string };
  instructor: { name: Localized; profession: Localized; avatar?: string };
  /** تنظیمات ظاهری از CMS — اگر ارسال نشود مقادیر پیش‌فرض استفاده می‌شود */
  settings?: PortfolioHeroSettings;
}

/** ── کلاس‌های پویای کارت مدرس بر اساس استایل انتخاب‌شده در پنل ── */
function cardClassName(style: PortfolioHeroSettings["instructorCardStyle"]): string {
  if (style === "glass")
    return "border border-white/15 bg-white/10 backdrop-blur-md hover:bg-white/[0.16]";
  if (style === "solid")
    return "border border-white/20 bg-[#f3eee5] text-[#202923] hover:bg-white";
  // invisible
  return "border border-white/10 bg-[#0d1512]/55 backdrop-blur-md hover:border-white/25";
}

/**
 * The studio's cover. Exclusive to /portfolio; never used for an artist's page.
 *
 * Composition: a dark editorial column on the start side, a framed video plate on
 * the end side, and the photograph kept as a dimmed backdrop so the typography —
 * not the photo — carries the page.
 */
export function PortfolioHero({ locale, background, slides, video, instructor, settings }: Props) {
  const fa = locale === "fa";
  const cfg = { ...defaultSettings, ...settings };

  const eyebrow = fa ? cfg.eyebrowFa : cfg.eyebrowEn;
  const titleLine1 = fa ? cfg.titleLine1Fa : cfg.titleLine1En;
  const titleLine2 = fa ? cfg.titleLine2Fa : cfg.titleLine2En;
  const desc = fa ? cfg.descFa : cfg.descEn;

  const avatarClass = cfg.instructorAvatarShape === "circle" ? "rounded-full" : "rounded-2xl";
  const avatarSize =
    cfg.instructorCardSize === "sm" ? "h-11 w-11 sm:h-12 sm:w-12" : "h-14 w-14 sm:h-16 sm:w-16";
  const titleTextSize = cfg.instructorCardSize === "sm" ? "text-sm sm:text-base" : "text-base sm:text-lg";
  const cardGap = cfg.instructorCardSize === "sm" ? "gap-3 p-3" : "gap-3.5 p-3.5 sm:p-4";

  /* The three disciplines, numbered like an index rather than a dot list. */
  const disciplines = fa
    ? ["طراحی پترن", "پارچه و کاغذدیواری", "هنر در فضا"]
    : ["Pattern design", "Textile & wallpaper", "Art in space"];

  return (
    <section data-portfolio-hero className="relative isolate overflow-hidden bg-[#0d1512] text-white">
      {/* ── Backdrop: a short sequence of related photographs ── */}
      <CinematicBackdrop
        slides={slides?.length ? slides : [{ src: background }]}
        scrim="light"
        priority
        interval={7000}
      />
      {/* Seam rule: where the plate begins on desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-6 end-[7%] hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block"
      />

      <div className="container-x relative pb-14 pt-[calc(var(--announce-h,0px)+var(--header-h-mobile)+1.5rem)] md:pb-16 md:pt-[calc(var(--announce-h,0px)+var(--header-h)+2.25rem)]">
        {/* ── Top rail ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/12 pb-4">
          <Breadcrumb
            locale={locale}
            items={[
              { label: fa ? "خانه" : "Home", href: href(locale, "/") },
              { label: fa ? "پورتفولیو" : "Portfolio" },
            ]}
            className="text-white/55 [&_a]:text-white/55 [&_a:hover]:text-white [&_.text-foreground]:text-white [&_.text-border]:text-white/25"
          />
          <span className="text-[10px] tracking-[0.28em] text-[#d6bc8e]/90" dir="ltr">
            ROSIE ATELIER — PORTFOLIO
          </span>
        </div>

        <div className="grid gap-10 py-9 md:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-14">
          {/* ── Editorial column ── */}
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 shrink-0 bg-[#d6bc8e]/70" aria-hidden />
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#d6bc8e]">{eyebrow}</p>
              <span className="ms-auto hidden text-[10px] tabular-nums tracking-[0.3em] text-white/30 sm:block" dir="ltr">
                01
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.05rem,7.4vw,4.9rem)] leading-[1.16] tracking-tight md:mt-6 md:leading-[1.14]">
              <span className="block">{titleLine1}</span>
              <span className="mt-1 block text-[#e4cba4]">{titleLine2}</span>
            </h1>

            <p className="mt-5 max-w-[46ch] text-[15px] leading-8 text-white/70 md:mt-6 md:text-base">{desc}</p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3 md:mt-9">
              <a
                href="#works"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#e4cba4] px-7 text-sm font-semibold text-[#17201b] transition-colors hover:bg-[#f0ddbd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {fa ? "کشف آثار و پروژه‌ها" : "Explore the work"}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 rtl-flip" aria-hidden />
              </a>
              <a
                href="#about"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 px-6 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {fa ? "آشنایی با مدرس" : "Meet the instructor"}
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>

            {/* Index of disciplines — numbered, hairline ruled */}
            <dl className="mt-9 grid grid-cols-3 gap-x-4 border-t border-white/12 pt-4 md:mt-11">
              {disciplines.map((label, index) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[10px] tabular-nums tracking-[0.28em] text-[#d6bc8e]/70" dir="ltr">
                    {String(index + 1).padStart(2, "0")}
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-5 text-white/75">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Framed video plate ── */}
          <div className="relative min-w-0">
            <div className="relative rounded-[26px] border border-white/12 bg-white/[0.04] p-2.5 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur-[2px]">
              <PortfolioHeroVideo
                src={video.src}
                poster={video.poster}
                locale={locale}
                offsetLeft={cfg.videoOffsetLeft}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 px-1 text-[10px] tracking-[0.24em] text-white/35" dir="ltr">
              <span>STUDIO FILM</span>
              <span className="hidden sm:block">ROSIE ATELIER</span>
            </div>

            {cfg.instructorCardVisible && (
              <a
                href="#about"
                className={`group mt-4 flex items-center rounded-2xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e4cba4] ${cardGap} ${cardClassName(cfg.instructorCardStyle)}`}
              >
                <span className={`relative shrink-0 overflow-hidden border border-white/25 bg-white/10 ${avatarSize} ${avatarClass}`}>
                  {instructor.avatar ? (
                    <Image
                      src={instructor.avatar}
                      alt={fa ? `تصویر پروفایل ${t(instructor.name, locale)}` : `${t(instructor.name, locale)} profile image`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <UserRound className="mx-auto h-full w-6 text-white/60" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-medium uppercase tracking-[0.22em] text-[#e4cba4]/90">
                    {fa ? "مدرس و طراح مجموعه" : "The instructor & designer"}
                  </span>
                  <span className={`mt-0.5 block font-display leading-snug ${titleTextSize}`}>
                    {t(instructor.name, locale)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] leading-5 text-white/60">
                    {t(instructor.profession, locale)}
                  </span>
                </span>
                <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:bg-white/15 sm:flex">
                  <ArrowUpRight className="h-3.5 w-3.5 rtl-flip" aria-hidden />
                </span>
              </a>
            )}
          </div>
        </div>

        {/* ── Bottom rail ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-4 text-[10px] tracking-[0.18em] text-white/35">
          <p dir="ltr">ROSIE ATELIER — ART, TEACHING &amp; DESIGN PRACTICE</p>
          <a
            href="#works"
            className="inline-flex min-h-9 items-center gap-2 text-white/65 transition-colors hover:text-[#e4cba4]"
          >
            {fa ? "ادامهٔ روایت" : "Discover the collection"}
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
