import type { Metadata } from "next";
import Image from "@/components/ui/SiteImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Layers, Signal, Users } from "lucide-react";
import { EducationCard } from "@/components/cards/EducationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Reveal } from "@/components/ui/Reveal";
import { CourseProgressSidebar } from "@/components/academy/CourseProgressSidebar";
import { Testimonials } from "@/components/academy/Testimonials";
import { StickyCta } from "@/components/ui/StickyCta";
import { EnrollForm } from "@/components/academy/EnrollForm";
import { PortfolioCard } from "@/components/cards/PortfolioCard";
import { isPublishedPortfolio } from "@/lib/artist/portfolio";
import { enrichPortfolio } from "@/lib/data/enrich";
import { VideoGrid, type AcademyVideoEntry } from "@/components/academy/VideoGrid";
import { academyOverview } from "@/lib/data/academy";
import { isPublishedEducation, publicEducationItems } from "@/lib/academy/publication";
import { priceLabel } from "@/lib/utils";
import { getAllReservations } from "@/lib/data/reservations";
import { getSession } from "@/lib/auth";
import { hasGrantedReservation, isFreePrice } from "@/lib/academy-live";
import { enrichEducation, getSite } from "@/lib/data/queries";
import type { EnrichedEducation } from "@/lib/data/enrich";
import { dictionaries } from "@/lib/i18n/dictionary";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { faNum, formatDuration, formatPrice, href, t } from "@/lib/utils";
import { getCspNonce } from "@/lib/security/nonce";
import { ogImageUrl } from "@/lib/seo/og-url";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const site = await getSite();
  return LOCALES.flatMap((locale) => publicEducationItems(site.education).map((item) => ({ locale, slug: item.slug })));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const site = await getSite();
  const e = site.education.find((x) => x.slug === slug && isPublishedEducation(x));
  if (!e) return {};
  const title = t(e.title, locale);
  const description = t(e.excerpt, locale);
  const url = `https://rosieatelier.com/${locale}/academy/${slug}`;
  const card = ogImageUrl({ src: e.image, title: t(e.title, "en") || e.slug, eyebrow: "Academy" });
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/academy/${slug}`,
      languages: { fa: `/fa/academy/${slug}`, en: `/en/academy/${slug}`, "x-default": `/fa/academy/${slug}` },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: card, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
    },
  };
}

export default async function EducationDetail({ params }: Props) {
  const { locale, slug } = await params;
  const nonce = await getCspNonce();
  const site = await getSite();
  const raw = site.education.find((x) => x.slug === slug);
  if (!raw || !isPublishedEducation(raw)) notFound();
  const d = dictionaries[locale];
  const e = enrichEducation(site, raw);
  const [reservations, session] = await Promise.all([getAllReservations(), getSession()]);
  const stats = academyOverview(site, reservations).bySlug[e.slug];
  const courseHasAccess = e.type !== "course"
    || isFreePrice(e.price)
    || hasGrantedReservation(reservations, e.slug, session);
  const courseVideos: AcademyVideoEntry[] = (e.videoFiles ?? []).map((video) => {
    const linkedLesson = e.lessonList?.find((lesson) => lesson.id === video.lessonId);
    return {
      video,
      courseSlug: e.slug,
      courseTitle: e.title,
      lessonTitle: linkedLesson?.title,
      canPlay: video.free === true || linkedLesson?.free === true || courseHasAccess,
    };
  });
  // Resolved instructor/host names (may come from custom entry or selected artist)
  const enriched = e as EnrichedEducation & {
    instructor?: { name: string; photo?: string } | null;
    host?: { name: string; photo?: string } | null;
  };
  const instructorName = enriched.instructor?.name;
  const instructorPhoto = enriched.instructor?.photo;
  const hostName = enriched.host?.name;
  const hostPhoto = enriched.host?.photo;
  const eventHost = instructorName && instructorName.trim() ? instructorName : null;

  // Helper to render a person chip with avatar
  const PersonChip = ({ name, photo, label, href }: { name: string; photo?: string; label: string; href?: string }) => {
    const content = (
      <span className="inline-flex items-center gap-2">
        <span className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : null}
        </span>
        {label}: {name}
      </span>
    );
    return href ? (
      <Link href={href} className="inline-flex items-center gap-2 hover:text-white">{content}</Link>
    ) : (
      content
    );
  };
  const related = publicEducationItems(site.education)
    .filter((x) => x.id !== e.id && (x.categoryId === e.categoryId || x.authorId === e.authorId))
    .slice(0, 3)
    .map((x) => enrichEducation(site, x));
  const paragraphs = t(e.body, locale).split(/\n\n+/);

  // JSON-LD for Course/Article
  const jsonLd = e.type === "course"
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: t(e.title, locale),
        description: t(e.excerpt, locale),
        image: e.image,
        url: `https://rosieatelier.com/${locale}/academy/${slug}`,
        timeRequired: `PT${e.durationMin}M`,
        ...(e.author ? {
          instructor: {
            "@type": "Person",
            name: t(e.author.name, locale),
            url: `https://rosieatelier.com/${locale}/portfolio`,
          },
        } : {}),
        ...(e.price ? {
          offers: {
            "@type": "Offer",
            price: locale === "fa" ? e.price.fa : e.price.en,
            priceCurrency: locale === "fa" ? "IRR" : "USD",
            availability: "https://schema.org/InStock",
          },
        } : {}),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: t(e.title, locale),
        description: t(e.excerpt, locale),
        image: e.image,
        url: `https://rosieatelier.com/${locale}/academy/${slug}`,
        datePublished: e.publishedAt,
        ...(eventHost || e.author ? {
          author: {
            "@type": "Person",
            name: eventHost ?? t(e.author!.name, locale),
          },
        } : {}),
      };

  /* Live events get Event markup rather than Article — schedule, seats and host. */
  const eventLd = e.liveEvent
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: t(e.title, locale),
        description: t(e.excerpt, locale),
        image: e.image,
        url: `https://rosieatelier.com/${locale}/academy/${slug}`,
        startDate: e.liveEvent.startsAt,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode:
          e.type === "webinar" || e.liveEvent.isOnline
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        ...(e.liveEvent.capacity
          ? {
              maximumAttendeeCapacity: e.liveEvent.capacity,
              offers: {
                "@type": "Offer",
                price: e.price ? (locale === "fa" ? e.price.fa : e.price.en) : 0,
                priceCurrency: locale === "fa" ? "IRR" : "USD",
                availability: "https://schema.org/InStock",
                url: `https://rosieatelier.com/${locale}/academy/${slug}`,
              },
            }
          : {}),
        ...(eventHost || e.author
          ? { performer: { "@type": "Person", name: eventHost ?? t(e.author!.name, locale) } }
          : {}),
        organizer: { "@type": "Organization", name: "Rosie Atelier", url: "https://rosieatelier.com" },
      }
    : null;

  /**
   * Works from the studio in the same discipline — the honest proof that the
   * technique taught here is actually applied in real projects.
   */
  const disciplineWorks = site.portfolios
    .filter(isPublishedPortfolio)
    .filter((work) => work.categoryId === e.categoryId || work.patternIds.some((id) => e.patternIds.includes(id)))
    .slice(0, 3)
    .map((work) => enrichPortfolio(site, work));

  const breadcrumb = [
    { label: d.nav.home, href: href(locale, "/") },
    { label: d.nav.education, href: href(locale, "/academy") },
    { label: t(e.title, locale) },
  ];

  const hasLessonList = e.lessonList && e.lessonList.length > 0;

  return (
    <article>
      {/* JSON-LD */}
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {eventLd && (
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
        />
      )}

      {/* Hero */}
      <section className="relative isolate h-[58svh] min-h-[400px] overflow-hidden bg-[#0d1117] text-white md:h-[70svh] md:min-h-[480px]">
        <Image src={e.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d13]/95 via-[#0a0d13]/40 to-[#0a0d13]/30" />
        <div className="container-x relative flex h-full flex-col justify-end pb-12 pt-[calc(var(--announce-h,0px)+var(--header-h))]">
          <Breadcrumb items={breadcrumb} locale={locale} className="mb-6 text-white/60 [&_a]:text-white/60 [&_a:hover]:text-white [&_.text-foreground]:text-white [&_.text-foreground-secondary]:text-white/60 [&_.text-border]:text-white/25" />
          <div className="anim-blur-in flex flex-wrap gap-2">
            <Badge tone="glass">{d.common[e.type]}</Badge>
            {e.category && <Badge tone="glass">{t(e.category.name, locale)}</Badge>}
            <Badge tone="glass">{d.common[e.difficulty]}</Badge>
          </div>
          <h1 className="anim-blur-in mt-4 max-w-4xl font-display text-h1 text-balance" style={{ animationDelay: "100ms" }}>
            {t(e.title, locale)}
          </h1>
          <div className="anim-fade-up mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-caption text-white/75" style={{ animationDelay: "200ms" }}>
            {(e.type === "webinar" || e.type === "workshop") ? (
              <>
                {instructorName ? (
                  <PersonChip
                    name={instructorName}
                    photo={instructorPhoto}
                    label="مدرس"
                    /* The instructor is the studio's designer — link to the work itself. */
                    href={`${href(locale, "/portfolio")}?from=academy`}
                  />
                ) : null}
                {hostName ? (
                  <PersonChip
                    name={hostName}
                    photo={hostPhoto}
                    label="میزبان"
                  />
                ) : null}
              </>
            ) : eventHost ? (
              <span className="inline-flex items-center gap-2">
                {d.common.author}: {eventHost}
              </span>
            ) : e.author && (
              <span className="inline-flex items-center gap-2">
                <span className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image src={e.author.avatar} alt="" fill sizes="32px" className="object-cover" />
                </span>
                {d.common.author}: {t(e.author.name, locale)}
              </span>
            )}
            <span className="inline-flex items-center gap-1"><Signal className="h-3.5 w-3.5" />{d.common[e.difficulty]}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDuration(e.durationMin, locale, d.common)}</span>
            {e.lessons > 1 && (
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {locale === "fa" ? faNum(stats?.lessons ?? e.lessons) : stats?.lessons ?? e.lessons} {d.common.lessons}
              </span>
            )}
            {(stats?.enrollments ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 tabular">
                <Users className="h-3.5 w-3.5" />
                {locale === "fa"
                  ? `${faNum(stats!.enrollments)} ثبت‌نام`
                  : `${stats!.enrollments} enrolled`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main content + sidebar */}
      <section className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Article body */}
          <div className="lg:col-span-8">
            <Reveal>
              <p className="font-display text-h3 leading-relaxed text-foreground text-balance">{t(e.excerpt, locale)}</p>
            </Reveal>
            <Reveal className="prose-ra mt-10" delay={80}>
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </Reveal>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-border p-5 lg:sticky lg:top-[calc(var(--header-h-compact)+1.5rem)] space-y-5">
              {/* Price / enroll CTA */}
              {e.price && (
                <div className="rounded-lg bg-background-secondary px-4 py-3">
                  <span className="text-h4 font-semibold tabular text-foreground">
                    {formatPrice(e.price, locale)}
                  </span>
                </div>
              )}
              {e.liveEvent?.isOnline && (e.type === "workshop" || e.type === "webinar") && (
                <Link
                  href={href(locale, `/academy/${e.slug}/live`)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  {locale === "fa" ? "صفحه ورود به رویداد" : "Event access page"}
                </Link>
              )}

              {/* Real registration — stored in the academy panel */}
              <div id="enroll" className="scroll-mt-28">
                <EnrollForm
                  item={{
                    slug: e.slug,
                    title: e.title,
                    type: e.type,
                    price: e.price,
                    paymentLabel: priceLabel(e.price, locale) ?? undefined,
                  }}
                  compact
                />
              </div>

              {stats?.capacity ? (
                <p className="text-caption text-foreground-secondary tabular">
                  {locale === "fa"
                    ? `${faNum(stats.enrollments)} صندلی از ${faNum(stats.capacity)} رزرو شده`
                    : `${stats.enrollments} of ${stats.capacity} seats taken`}
                </p>
              ) : null}

              {/* Curriculum summary — lessons, total time, free previews */}
              {hasLessonList && (
                <dl className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-background-secondary text-center rtl:divide-x-reverse">
                  {[
                    [locale === "fa" ? faNum(e.lessonList!.length) : e.lessonList!.length, locale === "fa" ? "درس" : "Lessons"],
                    [formatDuration(e.lessonList!.reduce((sum, lesson) => sum + (lesson.durationMin || 0), 0) || e.durationMin, locale, d.common), locale === "fa" ? "زمان کل" : "Total time"],
                    [locale === "fa" ? faNum(e.lessonList!.filter((lesson) => lesson.free).length) : e.lessonList!.filter((lesson) => lesson.free).length, locale === "fa" ? "پیش‌نمایش رایگان" : "Free previews"],
                  ].map(([value, title]) => (
                    <div key={String(title)} className="px-2 py-3">
                      <dt className="text-caption text-muted">{title}</dt>
                      <dd className="mt-0.5 text-sm font-semibold tabular text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Progress + lesson list (if lessonList present, full detail; else simple bar) */}
              {hasLessonList ? (
                <CourseProgressSidebar
                  courseId={e.id}
                  lessons={e.lessonList!}
                  totalMin={e.durationMin}
                  locale={locale}
                  canAccess={courseHasAccess}
                  videos={courseVideos.map((entry) => ({ id: entry.video.id, lessonId: entry.video.lessonId, canPlay: entry.canPlay === true }))}
                  dict={{ progress: d.common.progress, lessons: d.common.lessons, minutes: d.common.minutes, hours: d.common.hours, free: locale === "fa" ? "رایگان" : "Free" }}
                />
              ) : (
                <>
                  <div>
                    <p className="text-label text-muted">{d.common.progress}</p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background-secondary">
                      <div className="h-full w-0 bg-accent" />
                    </div>
                    <p className="mt-2 text-caption text-foreground-secondary tabular">
                      {locale === "fa" ? "۰٪ تکمیل شده" : "0% complete"}
                    </p>
                  </div>
                  {e.lessons > 1 && (
                    <ol className="space-y-2 text-sm">
                      {Array.from({ length: Math.min(e.lessons, 8) }).map((_, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background-secondary text-caption tabular">
                            {locale === "fa" ? faNum(i + 1) : i + 1}
                          </span>
                          <span className="truncate text-foreground-secondary">
                            {locale === "fa" ? `درس ${faNum(i + 1)}` : `Lesson ${i + 1}`}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              )}

              {/* Author */}
              {e.author && (
                <div className="flex items-center gap-3 border-t border-border pt-4 group">
                  <span className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image src={e.author.avatar} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-medium">{t(e.author.name, locale)}</span>
                    <span className="block text-caption text-foreground-secondary">{t(e.author.profession, locale)}</span>
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {e.type === "course" && (
        <section id="course-videos" className="container-x pt-4">
          {courseVideos.length > 0 ? (
            <>
              <SectionHeader
                eyebrow={d.nav.education}
                title={locale === "fa" ? "درس‌های ویدیویی دوره" : "Course video lessons"}
                description={locale === "fa"
                  ? "ویدیوهای این دوره با کنترل دسترسی؛ درس‌های قفل‌شده پس از ثبت‌نام و تأیید پرداخت باز می‌شوند."
                  : "Access-controlled course videos. Locked lessons open after enrolment and payment approval."}
              />
              <VideoGrid entries={courseVideos} poster={e.image} />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background-secondary px-5 py-6 text-sm text-foreground-secondary">
              {locale === "fa"
                ? "ویدئوی درسی هنوز برای این دوره بارگذاری نشده است. فهرست درس‌ها فقط برنامه درسی را نشان می‌دهد؛ پخش پس از بارگذاری فایل واقعی فعال می‌شود."
                : "No lesson video has been uploaded for this course yet. The lesson list is a curriculum outline; playback becomes available after a real video is uploaded."}
            </div>
          )}
        </section>
      )}

      {disciplineWorks.length > 0 && (
        <section className="bg-background-secondary">
          <div className="container-x section-y">
            <SectionHeader
              eyebrow={locale === "fa" ? "اثبات کاربرد" : "Applied proof"}
              title={locale === "fa" ? "همین تکنیک، در پروژه‌های واقعی" : "The same technique, in real projects"}
              href={`${href(locale, "/portfolio")}?from=academy`}
              hrefLabel={d.nav.viewAll}
            />
            <div className="grid gap-6 md:grid-cols-3">
              {disciplineWorks.map((work, i) => (
                <Reveal key={work.id} delay={i * 70}>
                  <PortfolioCard item={work} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials
        testimonials={site.testimonials}
        locale={locale}
        slug={e.slug}
        className="container-x section-y"
      />

      {related.length > 0 && (
        <section className="bg-background-secondary">
          <div className="container-x section-y">
            <SectionHeader eyebrow={d.nav.education} title={d.common.relatedTutorials} href={href(locale, "/academy")} hrefLabel={d.nav.viewAll} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((x, i) => <Reveal key={x.id} delay={i * 70}><EducationCard item={x} /></Reveal>)}
          </div>
          </div>
        </section>
      )}

      <StickyCta
        label={t(e.title, locale)}
        primary={{
          label: locale === "fa" ? "دیدن آثار آتلیه" : "See the studio's work",
          href: `${href(locale, "/portfolio")}?from=academy`,
        }}
        secondary={{
          label: locale === "fa" ? "سؤالی دارید؟" : "Ask a question",
          href: "mailto:hello@rosieatelier.com",
          external: true,
        }}
      />
    </article>
  );
}
