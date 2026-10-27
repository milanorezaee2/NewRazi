import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, GalleryHorizontalEnd, Mail, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { dictionaries } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { href } from "@/lib/utils";
import { getEditableRouteMetadata } from "@/lib/site-seo";
import { RAZIEH_PROFILE } from "@/lib/razieh-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return getEditableRouteMetadata("/start", locale, locale === "fa" ? "شروع همکاری" : "Start a project");
}

/**
 * Single small entry page for the two things a visitor can do besides reading:
 * learn, or commission work. It exists so the retired /contact page has a real
 * successor instead of a bare mailto link.
 */
export default async function StartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const fa = locale === "fa";
  const d = dictionaries[locale];
  const email = "hello@rosieatelier.com";

  const cards = [
    {
      key: "learn",
      href: `${href(locale, "/academy")}?from=start`,
      icon: <BookOpen className="h-5 w-5" />,
      title: fa ? "در آکادمی یاد بگیرید" : "Learn at the academy",
      desc: fa
        ? "دوره‌های خودآموز، کارگاه‌های ظرفیت‌دار و وبینارهای زنده دربارهٔ طراحی پترن، رنگ و پارچه."
        : "Self-paced courses, capacity-limited workshops and live webinars on pattern design, colour and textile.",
      cta: fa ? "دیدن دوره‌ها" : "Browse courses",
    },
    {
      key: "work",
      href: `${href(locale, "/portfolio")}?from=start`,
      icon: <GalleryHorizontalEnd className="h-5 w-5" />,
      title: fa ? "آثار آتلیه را ببینید" : "See the studio's work",
      desc: fa
        ? "پروژه‌های اجراشده با مطالعهٔ موردی: مسئله، فرایند، نتیجه و متریال هر پروژه."
        : "Realised projects with case studies: the problem, the process, the outcome and the materials.",
      cta: fa ? "دیدن پورتفولیو" : "Open the portfolio",
    },
    {
      key: "commission",
      href: `mailto:${email}?subject=${encodeURIComponent(fa ? "درخواست همکاری — آتلیه رزی" : "Project enquiry — Rosie Atelier")}`,
      icon: <Mail className="h-5 w-5" />,
      title: fa ? "سفارش و همکاری" : "Commission a project",
      desc: fa
        ? "برای پروژه‌های مسکونی، هتلداری و تجاری، یا برگزاری کارگاه اختصاصی، یک ایمیل با شرح فضا و زمان‌بندی بفرستید."
        : "For residential, hospitality or commercial projects — or a private workshop — send an e-mail with the space and timeline.",
      cta: email,
      external: true,
    },
  ];

  /* The founder entity, so the studio and its work resolve to a real person. */
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: RAZIEH_PROFILE.name[locale],
    jobTitle: RAZIEH_PROFILE.role[locale],
    url: `https://rosieatelier.com/${locale}/start`,
    worksFor: { "@type": "Organization", name: "Rosie Atelier", url: "https://rosieatelier.com" },
  };

  return (
    <div className="pt-[calc(var(--announce-h,0px)+var(--header-h))]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <section className="container-x pb-16 pt-10 md:pb-24 md:pt-14">
        <Breadcrumb
          items={[{ label: d.nav.home, href: href(locale, "/") }, { label: fa ? "شروع همکاری" : "Start" }]}
          locale={locale}
          className="mb-8"
        />
        <p className="text-label flex items-center gap-3 text-accent">
          <span className="inline-block h-px w-6 bg-accent/60" />
          {fa ? "شروع" : "Start"}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-display text-balance">
          {fa ? "یاد بگیرید، بسازید، یا همکاری کنید." : "Learn it, commission it, or both."}
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-foreground-secondary">
          {fa
            ? "آتلیه رزی دو مسیر روشن دارد: آکادمی برای آموزش و پورتفولیو برای دیدن و سفارش دادن اثر. یکی را انتخاب کنید."
            : "Rosie Atelier has two clear paths: the academy to learn, the portfolio to see the work and commission it. Pick one."}
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map((card) => {
            const content = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{card.icon}</span>
                <span className="mt-5 flex items-center gap-1.5 font-display text-h4 text-foreground">
                  {card.title}
                  <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:text-accent rtl-flip" />
                </span>
                <span className="mt-2 text-body-sm leading-relaxed text-foreground-secondary">{card.desc}</span>
                <span className="mt-6 text-sm font-semibold text-accent group-hover:underline" dir={card.external ? "ltr" : undefined}>
                  {card.cta}
                </span>
              </>
            );
            const classes =
              "group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-medium";
            return card.external ? (
              <a key={card.key} href={card.href} className={classes}>
                {content}
              </a>
            ) : (
              <Link key={card.key} href={card.href} className={classes}>
                {content}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-sm text-foreground-secondary">
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted" />
            <a href={`mailto:${email}`} className="transition-colors hover:text-accent" dir="ltr">
              {email}
            </a>
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted" />
            {fa ? "تهران، ایران" : "Tehran, Iran"}
          </span>
        </div>
      </section>
    </div>
  );
}
