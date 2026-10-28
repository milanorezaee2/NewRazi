"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, GalleryHorizontalEnd } from "lucide-react";
import type { Locale } from "@/lib/i18n/types";

/**
 * Branded 404 with the only two destinations the site has left: the portfolio
 * and the academy. The locale comes from the URL so the tiles stay in the same
 * language the visitor was browsing.
 */
export function NotFoundView({ bare = false }: { bare?: boolean }) {
  const pathname = usePathname() ?? "";
  const locale: Locale = pathname.startsWith("/en") ? "en" : "fa";
  const fa = locale === "fa";
  const other: Locale = fa ? "en" : "fa";

  const options = [
    {
      key: "portfolio",
      href: `/${locale}/portfolio`,
      icon: <GalleryHorizontalEnd className="h-5 w-5" />,
      title: fa ? "پورتفولیو" : "Portfolio",
      desc: fa
        ? "آثار منتخب، پروژه‌های اجراشده و روایت طراحی آتلیه."
        : "Selected works, realised projects and the studio's design story.",
    },
    {
      key: "academy",
      href: `/${locale}/academy`,
      icon: <BookOpen className="h-5 w-5" />,
      title: fa ? "آکادمی" : "Academy",
      desc: fa
        ? "دوره‌ها، کارگاه‌ها و رویدادهای زنده‌ی آموزش طراحی پترن."
        : "Courses, workshops and live events on pattern design.",
    },
  ];

  return (
    <div
      className={
        bare
          ? "flex min-h-dvh flex-col bg-background px-6"
          : "container-x flex min-h-[70vh] flex-col items-center justify-center pt-[calc(var(--header-h,64px)+2rem)] pb-20 text-center"
      }
    >
      {bare && (
        <header className="flex items-center justify-center pt-8">
          <Link href={`/${locale}/portfolio`} className="font-display text-h3 tracking-tight text-foreground">
            Rosy<span className="text-accent"> Ateliyer</span>
          </Link>
        </header>
      )}

      <div className={bare ? "flex flex-1 flex-col items-center justify-center py-16 text-center" : "flex flex-col items-center"}>
        <p className="font-display text-[6rem] leading-none font-semibold text-foreground/10 select-none sm:text-[9rem]" aria-hidden="true">
          404
        </p>
        <h1 className="-mt-8 font-display text-display text-balance text-foreground sm:-mt-12">
          {fa ? "این صفحه پیدا نشد" : "Nothing here"}
        </h1>
        <p className="mt-4 max-w-md text-body leading-relaxed text-foreground-secondary">
          {fa
            ? "صفحه‌ای که دنبالش بودید وجود ندارد یا به یکی از دو بخش سایت منتقل شده است. از این‌جا ادامه دهید:"
            : "The page you were looking for does not exist, or it moved into one of the site's two sections. Continue here:"}
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
          {options.map((option) => (
            <Link
              key={option.key}
              href={option.href}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6 text-start transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-medium"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{option.icon}</span>
              <span className="flex items-center gap-1.5 font-display text-h4 text-foreground">
                {option.title}
                <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:text-accent rtl-flip" />
              </span>
              <span className="text-body-sm leading-relaxed text-foreground-secondary">{option.desc}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-foreground-secondary">
          <Link
            href={`/${other}${pathname.replace(/^\/(fa|en)/, "") || "/portfolio"}`}
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-foreground"
            hrefLang={other}
          >
            {other === "fa" ? "فارسی" : "English"}
          </Link>
          <a href="mailto:hello@rosieatelier.com" className="transition-colors hover:text-accent">
            hello@rosieatelier.com
          </a>
        </div>
      </div>
    </div>
  );
}
