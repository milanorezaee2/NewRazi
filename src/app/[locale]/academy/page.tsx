import type { Metadata } from "next";
import Image from "@/components/ui/SiteImage";
import Link from "next/link";
import {
  GraduationCap,
  ArrowUpRight,
  Clock,
  Radio,
  Users,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { enrichEducation, getSite } from "@/lib/data/queries";
import { getAllReservations } from "@/lib/data/reservations";
import { getSession } from "@/lib/auth";
import { hasGrantedReservation, isFreePrice } from "@/lib/academy-live";
import { academyOverview, lessonMinutes, previewVideoOf } from "@/lib/data/academy";
import { publicEducationItems } from "@/lib/academy/publication";
import { dictionaries } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { faNum, formatDuration, href, t } from "@/lib/utils";
import { AcademyClient, type AcademyClientItem } from "./AcademyClient";
import { AcademyHeroPreview } from "@/components/academy/AcademyHeroPreview";
import { CinematicBackdrop } from "@/components/ui/CinematicBackdrop";
import { VideoGrid, type AcademyVideoEntry } from "@/components/academy/VideoGrid";
import { SiteContentBanner } from "@/components/layout/SiteContentBanner";
import { Testimonials } from "@/components/academy/Testimonials";
import { StickyCta } from "@/components/ui/StickyCta";
import { PortfolioCard } from "@/components/cards/PortfolioCard";
import { enrichPortfolio } from "@/lib/data/queries";
import { isPublishedPortfolio, isStudioPortfolio } from "@/lib/artist/portfolio";
import { getCspNonce } from "@/lib/security/nonce";
import { getEditableRouteMetadata } from "@/lib/site-seo";

export const dynamic = "force-dynamic";

/** Ships with the site; an admin-uploaded preview for the featured course wins. */
const BUILT_IN_PREVIEW = "/videos/academy/preview.mp4";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getEditableRouteMetadata("/academy", locale, dictionaries[locale].nav.education);
}

export default async function AcademyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const nonce = await getCspNonce();
  const site = await getSite();
  const d = dictionaries[locale];
  const isFA = locale === "fa";
  const academyBanners = site.banners.filter((banner) => banner.enabled && banner.placement === "academy");
  const publishedEducation = publicEducationItems(site.education);

  const [all, reservations, session] = await Promise.all([
    Promise.resolve(publishedEducation.map((e) => enrichEducation(site, e))),
    getAllReservations(),
    getSession(),
  ]);
  const stats = academyOverview(site, reservations);
  const clientItems: AcademyClientItem[] = all.map((item) => {
    const safeItem = { ...item };
    delete safeItem.videoFiles;
    return { ...safeItem, previewVideoUrl: previewVideoOf(item)?.url };
  });

  const featured = all.find((e) => e.featured && e.type === "course") ?? all[0];

  /* Studio works shown at the end of the academy page — the other public page. */
  const studioWorks = site.portfolios
    .filter((portfolio) => isStudioPortfolio(portfolio) && isPublishedPortfolio(portfolio))
    .map((portfolio) => enrichPortfolio(site, portfolio));
  const worksPreview = [
    ...studioWorks.filter((work) => work.featured),
    ...studioWorks.filter((work) => !work.featured),
  ].slice(0, 3);

  /* Hero preview: the video the admin uploaded for the featured course, else the built-in film. */
  const featuredVideo = previewVideoOf(featured);
  const heroVideo = featuredVideo?.url ?? BUILT_IN_PREVIEW;

  /* Only genuinely public lessons and videos owned by the current viewer appear in the public gallery. */
  const videoEntries: AcademyVideoEntry[] = all.flatMap((item) => {
    const hasCourseAccess = isFreePrice(item.price) || hasGrantedReservation(reservations, item.slug, session);
    return (item.videoFiles ?? []).map((video) => {
      const linkedLesson = item.lessonList?.find((lesson) => lesson.id === video.lessonId);
      const canPlay = video.free === true || linkedLesson?.free === true || hasCourseAccess;
      return {
        video,
        courseSlug: item.slug,
        courseTitle: item.title,
        lessonTitle: linkedLesson?.title,
        canPlay,
        skip: item.id === featured?.id && video.id === featuredVideo?.id,
      };
    });
  });
  const galleryEntries = videoEntries.filter((entry) => entry.canPlay && !entry.skip && entry.video.url !== heroVideo);

  const liveEvent =
    all.find((e) => (e.type === "webinar" || e.type === "workshop") && e.liveEvent?.status === "live") ??
    all
      .filter((e) => (e.type === "webinar" || e.type === "workshop") && e.liveEvent?.status === "scheduled")
      .sort((a, b) => new Date(a.liveEvent!.startsAt).getTime() - new Date(b.liveEvent!.startsAt).getTime())[0] ??
    null;
  const n = (v: number) => (isFA ? faNum(v) : String(v));
  const cats = site.categories.filter((c) => publishedEducation.some((e) => e.categoryId === c.id));
  /* The category strip links to `/academy?category=<slug>` — resolve it so the grid opens filtered. */
  const initialCategory = query.category
    ? cats.find((c) => c.slug === query.category)?.id ?? "all"
    : "all";
  const eventCount = stats.workshops + stats.webinars;

  const featuredLessons = (featured?.lessonList ?? []).slice(0, 8);
  const featuredStats = featured ? stats.bySlug[featured.slug] : undefined;

  /* Hero facts — every number is computed from published content and real registrations. */
  const heroStats = [
    { value: n(stats.courses), label: isFA ? "دوره" : "Courses" },
    { value: n(stats.lessons), label: isFA ? "درس" : "Lessons" },
    { value: n(Math.round(stats.minutes / 60)), label: isFA ? "ساعت آموزش" : "Hours" },
    ...(stats.students > 0 ? [{ value: n(stats.students), label: isFA ? "دانشجو" : "Students" }] : []),
  ];

  const perks = [
    {
      icon: Layers,
      label: isFA ? `${n(stats.lessons)} درس` : `${n(stats.lessons)} lessons`,
      desc: isFA ? "درس‌های ساختارمند با تمرین عملی" : "Structured lessons with exercises",
    },
    {
      icon: Clock,
      label: isFA ? `${n(Math.round(stats.minutes / 60))} ساعت آموزش` : `${n(Math.round(stats.minutes / 60))} hours`,
      desc: isFA ? "مدت اعلام‌شده درس‌های دوره‌های منتشرشده" : "Published course lesson duration",
    },
    {
      icon: Radio,
      label: isFA ? `${n(eventCount)} رویداد زنده` : `${n(eventCount)} live events`,
      desc: isFA ? "ورکشاپ و وبینار با ظرفیت محدود" : "Workshops & webinars, limited seats",
    },
    {
      icon: Users,
      label: isFA ? `${n(stats.instructors)} مدرس` : `${n(stats.instructors)} instructors`,
      desc: isFA ? "مدرسان و متخصصان آکادمی" : "Academy instructors & specialists",
    },
  ];

  const whyCards = [
    {
      emoji: "🎓",
      title: isFA ? "دوره‌های جامع" : "Comprehensive Courses",
      desc: isFA
        ? "دوره‌های ساختارمند با درس‌های مرحله‌به‌مرحله و تمرین‌های عملی."
        : "Structured courses with step-by-step lessons and practical exercises.",
      metric: isFA ? `${n(stats.courses)} دوره` : `${n(stats.courses)} courses`,
    },
    {
      emoji: "🎥",
      title: isFA ? "ورکشاپ‌های زنده" : "Live Workshops",
      desc: isFA
        ? "جلسات تعاملی آنلاین با مدرس، امکان پرسش و پاسخ مستقیم و تمرین در لحظه."
        : "Interactive online sessions with the instructor, live Q&A and real-time exercises.",
      metric: isFA ? `${n(stats.workshops)} ورکشاپ` : `${n(stats.workshops)} workshops`,
    },
    {
      emoji: "📡",
      title: isFA ? "وبینارهای تخصصی" : "Expert Webinars",
      desc: isFA
        ? "وبینارهای کوتاه با متخصصان صنعت — برای به‌روز ماندن با آخرین ترندها و تکنیک‌ها."
        : "Short webinars with industry experts — stay updated with the latest trends.",
      metric: isFA ? `${n(stats.webinars)} وبینار` : `${n(stats.webinars)} webinars`,
    },
    {
      emoji: "📹",
      title: isFA ? "آموزش‌های ویدیویی" : "Video Tutorials",
      desc: isFA
        ? "آموزش‌های کوتاه و تمرکز‌دار که یک مهارت خاص را عمیق آموزش می‌دهند."
        : "Short, focused tutorials that teach one specific skill in depth.",
      metric: isFA ? `${n(stats.lessons)} درس` : `${n(stats.lessons)} lessons`,
    },
    {
      emoji: "🗺️",
      title: isFA ? "مسیر یادگیری" : "Learning Paths",
      desc: isFA
        ? "برنامه‌ریزی شده از صفر تا حرفه‌ای — مجموعه‌ای از دوره‌ها در کنار هم."
        : "Planned from zero to professional — a curated set of courses together.",
      metric: isFA ? `${n(stats.categories)} دسته‌بندی` : `${n(stats.categories)} categories`,
    },
    {
      emoji: "🏆",
      title: isFA ? "پروژه‌های عملی" : "Real Projects",
      desc: isFA
        ? "هر دوره با یک پروژه واقعی پایان می‌یابد که می‌توانی در پورتفولیوی خود استفاده کنی."
        : "Every course ends with a real project you can add to your portfolio.",
      metric: isFA ? `${n(Math.round(stats.minutes / 60))} ساعت` : `${n(Math.round(stats.minutes / 60))} h`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: d.brand,
    url: `https://rosieatelier.com/${locale}/academy`,
    description: isFA
      ? "دوره‌ها، ورکشاپ‌ها و وبینارهای آکادمی آتلیه رزی برای طراحی پترن و سطح."
      : "Rosie Atelier Academy courses, workshops and webinars for pattern and surface design.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isFA ? "دوره‌های آکادمی" : "Academy courses",
      itemListElement: all.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": item.type === "course" ? "Course" : "Event",
          name: t(item.title, locale),
          description: t(item.excerpt, locale),
          url: `https://rosieatelier.com/${locale}/academy/${item.slug}`,
          timeRequired: `PT${lessonMinutes(item)}M`,
          ...(item.type === "course" && item.author
            ? { provider: { "@type": "Person", name: t(item.author.name, locale) } }
            : {}),
          ...(item.price && item.price[locale] > 0
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.price[locale],
                  priceCurrency: locale === "fa" ? "IRR" : "USD",
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
        },
      })),
    },
  };

  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {academyBanners.map((banner) => <SiteContentBanner key={banner.id} banner={banner} locale={locale} />)}

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#0c1018] text-white">
        {/* Four frames from the school's own material: ornament, the making,
            a repeat study, and a finished colourway. */}
        <CinematicBackdrop
          slides={[
            { src: "/images/education/e04.jpg", caption: isFA ? "نقش و تزئین" : "Ornament" },
            { src: "/images/portfolios/razieh-textile-process.jpg", caption: isFA ? "کارگاه ساخت" : "In the making" },
            { src: "/images/education/e02.jpg", caption: isFA ? "مطالعهٔ تکرار" : "Repeat study" },
            { src: "/images/hero/hero-preview-02.jpg", caption: isFA ? "رنگ‌بندی نهایی" : "Colourway" },
          ]}
          scrim="light"
          priority
          interval={7500}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_55%_at_80%_0%,rgba(201,162,39,0.16)_0%,rgba(12,16,24,0)_60%)]" />

        <div className="container-x relative z-10 pb-16 pt-[calc(var(--announce-h,0px)+var(--header-h-mobile)+1.5rem)] md:pb-20 md:pt-[calc(var(--announce-h,0px)+var(--header-h)+2.25rem)]">
          {/* Rail */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 pb-4 text-[10px] tracking-[0.26em] text-white/40" dir="ltr">
            <span>ROSIE ATELIER — ACADEMY</span>
            <span className="text-[#d6bc8e]/90">01 / SCHOOL</span>
          </div>

          <div className="grid gap-10 py-9 md:py-12 lg:grid-cols-12 lg:items-center lg:gap-14">
            {/* Copy */}
            <div className="min-w-0 lg:col-span-5">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#d6bc8e]">
                <GraduationCap className="h-3.5 w-3.5" />
                {d.nav.education}
              </span>

              <h1 className="anim-blur-in mt-5 font-display text-[clamp(2rem,6.6vw,4.1rem)] leading-[1.16] text-white">
                {isFA ? (
                  <>
                    آکادمی آتلیه رزی
                    <span className="mt-1 block text-[#e4cba4]">یاد بگیر، بساز، بفروش.</span>
                  </>
                ) : (
                  <>
                    Rosie Atelier Academy
                    <span className="mt-1 block text-[#e4cba4]">Learn, Build, Publish.</span>
                  </>
                )}
              </h1>

              <p
                className="anim-blur-in mt-5 max-w-[44ch] text-[15px] leading-8 text-white/70 md:text-base"
                style={{ animationDelay: "80ms" }}
              >
                {isFA
                  ? "دوره‌های تخصصی طراحی پترن، ورکشاپ‌های زنده و وبینارهای حرفه‌ای — از مبانی تا عرضه بین‌المللی."
                  : "Specialist pattern design courses, live workshops and professional webinars — from foundations to international publishing."}
              </p>

              <div className="anim-fade-up mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3" style={{ animationDelay: "160ms" }}>
                <a
                  href="#courses"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#e4cba4] px-7 text-sm font-semibold text-[#17201b] transition-colors hover:bg-[#f0ddbd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {isFA ? "شروع یادگیری" : "Start learning"}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 rtl-flip" aria-hidden />
                </a>
                {featured && (
                  <Link
                    href={href(locale, `/academy/${featured.slug}`)}
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 px-6 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {isFA ? "دورهٔ شاخص" : "Featured course"}
                  </Link>
                )}
              </div>

              {/* Numbers, ruled like an editorial index */}
              <dl className="anim-fade-up mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/12 pt-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: "220ms" }}>
                {heroStats.map((stat) => (
                  <div key={stat.label} className="min-w-0">
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40">{stat.label}</dt>
                    <dd className="mt-1 font-display text-h3 tabular-nums leading-none text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Featured preview plate */}
            {featured && (
              <div className="min-w-0 lg:col-span-7">
                <div className="relative rounded-[26px] border border-white/12 bg-white/[0.04] p-2.5 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur-[2px]">
                  <AcademyHeroPreview src={heroVideo} poster={featured.image}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4cba4] px-3 py-1 text-[11px] font-semibold text-[#17201b]">
                        {featuredVideo
                          ? `${isFA ? "پیش‌نمایش درس رایگان" : "Free lesson preview"} · ${d.common[featured.type]}`
                          : isFA ? "فیلم معرفی آکادمی" : "Academy preview film"}
                      </span>
                      {featured.category && (
                        <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/70 backdrop-blur-sm">
                          {t(featured.category.name, locale)}
                        </span>
                      )}
                      {(featuredStats?.enrollments ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/70 backdrop-blur-sm">
                          <Users className="h-3 w-3" />
                          {isFA
                            ? `${n(featuredStats!.enrollments)} ثبت‌نام`
                            : `${n(featuredStats!.enrollments)} enrolled`}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 font-display text-h3 text-white text-balance">
                      <Link href={href(locale, `/academy/${featured.slug}`)} className="hover:text-white/90">
                        {t(featured.title, locale)}
                      </Link>
                    </h2>
                    <p className="mt-2 max-w-lg text-body-sm leading-7 text-white/65 line-clamp-2">
                      {t(featured.excerpt, locale)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4">
                      <Link
                        href={href(locale, `/academy/${featured.slug}`)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#e4cba4]"
                      >
                        {isFA ? "مشاهده دوره" : "View course"}
                        <ArrowUpRight className="h-4 w-4 rtl-flip arrow-shift" />
                      </Link>
                      <span className="text-caption text-white/45 tabular">
                        {n(featuredStats?.lessons ?? 0)} {isFA ? "درس" : "lessons"} ·{" "}
                        {formatDuration(lessonMinutes(featured), locale, d.common)}
                      </span>
                      {featured.author && (
                        <span className="ms-auto inline-flex items-center gap-2 text-caption text-white/50">
                          <span className="relative h-6 w-6 overflow-hidden rounded-full border border-white/20">
                            <Image src={featured.author.avatar} alt="" fill sizes="24px" className="object-cover" />
                          </span>
                          {t(featured.author.name, locale)}
                        </span>
                      )}
                    </div>
                  </AcademyHeroPreview>
                </div>
              </div>
            )}
          </div>

          {/* Slim fact rail — replaces the chip grid the hero used to carry */}
          <ul className="mt-2 grid gap-x-8 gap-y-3 border-t border-white/12 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon className="h-3.5 w-3.5 text-[#e4cba4]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-white/90">{label}</span>
                  <span className="block text-[11px] leading-5 text-white/45">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Categories strip ──────────────────────────────────── */}
      {cats.length > 0 && (
        <div className="border-b border-border bg-background-secondary">
          <div className="container-x">
            <div className="flex items-center gap-3 overflow-x-auto py-4 no-scrollbar">
              <span className="shrink-0 text-caption text-muted me-1">
                {d.nav.categories}:
              </span>
              {cats.map((c) => (
                <Link
                  key={c.id}
                  href={href(locale, `/academy?category=${c.slug}`)}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-caption text-foreground-secondary transition-all hover:border-accent hover:text-accent"
                >
                  {t(c.name, locale)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── What you get trust bar — only what the academy actually provides ── */}
      <div className="bg-accent text-white">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-sm">
            {[
              isFA ? "✓ ثبت‌نام آنلاین با پیگیری در پنل" : "✓ Online enrollment tracked in the panel",
              isFA ? "✓ ظرفیت محدود رویدادهای زنده" : "✓ Limited seats on live events",
              stats.freeVideos > 0
                ? isFA ? `✓ ${n(stats.freeVideos)} پیش‌نمایش درس رایگان` : `✓ ${n(stats.freeVideos)} free lesson previews`
                : isFA ? "✓ پخش امن ویدیو پس از بارگذاری در پنل" : "✓ Secure video playback after upload",
              isFA ? "✓ پشتیبانی از طریق صفحه تماس" : "✓ Support through the contact page",
            ].map((item) => (
              <span key={item} className="font-medium">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* The main catalogue is the first substantive section after the hero: webinars, then workshops, then recorded courses. */}
      <div id="courses" className="scroll-mt-[calc(var(--header-h)+1rem)]">
      <AcademyClient
        items={clientItems}
        liveEvent={liveEvent}
        categories={cats}
        initialCategory={initialCategory}
        stats={{ courses: stats.courses, lessons: stats.lessons, minutes: stats.minutes, instructors: stats.instructors, enrollments: stats.enrollments, students: stats.students }}
        itemStats={stats.bySlug}
        instructorStats={stats.instructorStats}
      />
      </div>

      {/* ── What you'll learn (3-col feature cards) ───────────── */}
      <section className="container-x py-16">
        <SectionHeader
          eyebrow={isFA ? "چرا آکادمی آتلیه رزی" : "Why Rosie Atelier Academy"}
          title={isFA ? "هر آنچه نیاز داری در یک جا" : "Everything you need in one place"}
          description={
            isFA
              ? "از آموزش‌های کوتاه ویدیویی تا دوره‌های جامع حرفه‌ای و رویدادهای زنده — ما هر سطحی را پوشش می‌دهیم."
              : "From short video tutorials to comprehensive professional courses and live events — we cover every level."
          }
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyCards.map(({ emoji, title, desc, metric }, i) => (
            <Reveal key={title} delay={i * 70}>
              <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl">{emoji}</span>
                  <span className="rounded-full bg-background-secondary px-3 py-1 text-caption text-foreground-secondary tabular">
                    {metric}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-body-sm text-foreground-secondary flex-1">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured course curriculum (real lesson list from the panel) ── */}
      {featured && featuredLessons.length > 0 && (
        <section className="bg-background-secondary">
          <div className="container-x py-16">
            <SectionHeader
              eyebrow={isFA ? "برنامه دوره منتخب" : "Featured curriculum"}
              title={t(featured.title, locale)}
              description={t(featured.excerpt, locale)}
              href={href(locale, `/academy/${featured.slug}`)}
              hrefLabel={isFA ? "صفحه دوره" : "Course page"}
            />
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {featuredLessons.map((lesson, index) => (
                <Reveal key={lesson.id} delay={index * 40}>
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-secondary font-display text-body-sm tabular">
                      {n(index + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{t(lesson.title, locale)}</span>
                      <span className="block text-caption text-foreground-secondary tabular">
                        {formatDuration(lesson.durationMin ?? 0, locale, d.common)}
                      </span>
                    </span>
                    {lesson.free && (
                      <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-caption font-medium text-success">
                        {isFA ? "پیش‌نمایش" : "Preview"}
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 text-caption text-muted tabular">
              {isFA
                ? `${n(featuredLessons.length)} درس نخست از ${n(featuredStats?.lessons ?? 0)} درس — مجموع ${formatDuration(lessonMinutes(featured), locale, d.common)}`
                : `First ${n(featuredLessons.length)} of ${n(featuredStats?.lessons ?? 0)} lessons — ${formatDuration(lessonMinutes(featured), locale, d.common)} total`}
            </p>
          </div>
        </section>
      )}

      {/* ── Lesson videos uploaded in the panel ───────────────── */}
      {galleryEntries.length > 0 && (
        <section className="container-x py-16">
          <SectionHeader
            eyebrow={isFA ? "ویدیوهای آکادمی" : "Academy videos"}
            title={isFA ? "پیش‌نمایش درس‌ها را ببین" : "Watch the lesson previews"}
            description={
              isFA
                ? "ویدیوهای آپلودشده در پنل آکادمی؛ هر ویدیوی رایگان همین‌جا پخش می‌شود."
                : "Videos uploaded in the academy panel — every free preview plays right here."
            }
          />
          <VideoGrid entries={galleryEntries} poster={featured?.image} />
        </section>
      )}

      {/* ── Bridge to the portfolio ───────────────────────────── */}
      {worksPreview.length > 0 && (
        <section className="container-x py-16">
          <SectionHeader
            eyebrow={isFA ? "پورتفولیوی آتلیه" : "Studio portfolio"}
            title={isFA ? "نتیجه‌ی این آموزش‌ها در آثار واقعی" : "Where this training ends up — real work"}
            description={
              isFA
                ? "پروژه‌های اجراشده‌ی آتلیه: طراحی پترن، ساخت پارچه، ترکیب رنگ و فضاهایی که با همین روش‌ها ساخته شده‌اند."
                : "Realised studio projects: pattern design, textile making, colour and spaces built with these very methods."
            }
            href={`${href(locale, "/portfolio")}?from=academy`}
            hrefLabel={isFA ? "دیدن همه آثار" : "See all works"}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {worksPreview.map((work, index) => (
              <Reveal key={work.id} delay={index * 70}>
                <div className="aspect-[4/3]">
                  <PortfolioCard item={work} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Student quotes (admin-managed; hidden until real ones exist) ── */}
      <Testimonials testimonials={site.testimonials} locale={locale} className="container-x py-16" />

      {/* ── Process steps ─────────────────────────────────────── */}
      <section className="bg-background-secondary">
        <div className="container-x py-16">
          <SectionHeader
            eyebrow={isFA ? "چطور کار می‌کند" : "How it works"}
            title={isFA ? "شروع تنها ۳ قدم فاصله دارد" : "Just 3 steps away from learning"}
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: isFA ? "۱" : "1",
                title: isFA ? "دوره را انتخاب کن" : "Choose a course",
                desc: isFA
                  ? "از بین دوره‌ها، ورکشاپ‌ها و وبینارها آنچه به نیازت می‌خورد را پیدا کن."
                  : "Find what fits your needs from courses, workshops and webinars.",
              },
              {
                step: isFA ? "۲" : "2",
                title: isFA ? "ثبت‌نام کن" : "Enroll",
                desc: isFA
                  ? "فرم ثبت‌نام را پر کن؛ ثبت‌نامت همان لحظه در پنل آکادمی ذخیره می‌شود."
                  : "Fill in the form — your registration is stored in the academy panel instantly.",
              },
              {
                step: isFA ? "۳" : "3",
                title: isFA ? "یاد بگیر و بساز" : "Learn & build",
                desc: isFA
                  ? "درس‌ها را دنبال کن، پروژه عملی بساز و از پیش‌نمایش‌های رایگان شروع کن."
                  : "Follow the lessons, build the project and start from the free previews.",
              },
            ].map(({ step, title, desc }, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-display text-h3">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-body-sm text-foreground-secondary">{desc}</p>
                    <span className="mt-2 flex items-center gap-1 text-caption text-muted">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      {isFA ? "آنلاین و بدون تماس تلفنی" : "Online, no phone calls"}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StickyCta
        label={isFA ? "از آموزش به آثار واقعی" : "From the course to real work"}
        primary={{
          label: isFA ? "دیدن آثار آتلیه" : "See the studio's work",
          href: `${href(locale, "/portfolio")}?from=academy`,
        }}
        secondary={{
          label: isFA ? "درخواست همکاری" : "Start a project",
          href: `${href(locale, "/start")}?from=academy`,
        }}
      />
    </>
  );
}
