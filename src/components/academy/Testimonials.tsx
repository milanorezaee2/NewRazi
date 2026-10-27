import type { Locale } from "@/lib/i18n/types";
import type { Testimonial } from "@/lib/types";
import { Star } from "lucide-react";

function label(value: { fa: string; en: string } | undefined, locale: Locale): string {
  if (!value) return "";
  return (locale === "fa" ? value.fa : value.en) || value.fa || value.en || "";
}

/**
 * Student quotes, managed from the admin panel. Renders nothing until an
 * administrator adds a real quote, so the page never shows invented proof.
 */
export function Testimonials({
  testimonials,
  locale,
  slug,
  className = "",
}: {
  testimonials?: Testimonial[];
  locale: Locale;
  /** When set, quotes tied to this course are preferred. */
  slug?: string;
  className?: string;
}) {
  const fa = locale === "fa";
  const all = (testimonials ?? []).filter((item) => label(item.quote, locale));
  if (!all.length) return null;

  const forCourse = slug ? all.filter((item) => item.educationSlug === slug) : [];
  const generic = all.filter((item) => !item.educationSlug && item.featured !== false);
  const list = (forCourse.length ? [...forCourse, ...generic] : generic.length ? generic : all).slice(0, 3);
  if (!list.length) return null;

  return (
    <section className={className || "container-x section-y"}>
      <p className="text-label flex items-center gap-3 text-accent">
        <span className="inline-block h-px w-6 bg-accent/60" />
        {fa ? "از زبان هنرجویان" : "In their words"}
      </p>
      <h2 className="mt-4 font-display text-h2 text-balance">
        {fa ? "نتیجه‌ی واقعی، از زبان کسانی که گذراندند" : "Real outcomes, from the people who took it"}
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {list.map((item) => (
          <figure key={item.id} className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
            {typeof item.rating === "number" && item.rating > 0 && (
              <div className="flex items-center gap-0.5" aria-label={fa ? `${item.rating} از ۵` : `${item.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={index < Math.min(5, Math.round(item.rating!)) ? "h-3.5 w-3.5 fill-accent text-accent" : "h-3.5 w-3.5 text-border"}
                  />
                ))}
              </div>
            )}
            <blockquote className="mt-3 text-body-sm leading-7 text-foreground">
              &ldquo;{label(item.quote, locale)}&rdquo;
            </blockquote>
            <figcaption className="mt-auto pt-4 text-caption text-foreground-secondary">
              <span className="block font-medium text-foreground">{item.name}</span>
              {label(item.course, locale) && <span className="block">{label(item.course, locale)}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
