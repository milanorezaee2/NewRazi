import type { Localized } from "@/lib/i18n/types";
import type { CaseStudy } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import { Reveal } from "@/components/ui/Reveal";
import Image from "@/components/ui/SiteImage";
import { ToolChip } from "@/components/portfolio/ToolChip";

/** Bilingual copy helper kept local so the component stays a pure server render. */
function text(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return (locale === "fa" ? value.fa : value.en) || value.fa || value.en || "";
}

/**
 * Case-study layer of a portfolio work: problem → process → outcome → tools.
 * Renders nothing when the record has no case study, so legacy works keep
 * showing the plain gallery layout.
 */
export function CaseStudySection({ study, locale }: { study?: CaseStudy; locale: Locale }) {
  if (!study) return null;
  const fa = locale === "fa";
  const problem = text(study.problem, locale);
  const outcome = text(study.outcome, locale);
  const steps = (study.process ?? []).filter((step) => text(step.title, locale) || text(step.text, locale));
  const metrics = (study.outcomeMetrics ?? []).filter((metric) => metric.value);
  const tools = (study.tools ?? []).filter(Boolean);

  if (!problem && !steps.length && !outcome && !metrics.length && !tools.length) return null;

  return (
    <section className="border-t border-border bg-background-secondary">
      <div className="container-x section-y">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-label flex items-center gap-3 text-accent">
              <span className="inline-block h-px w-6 bg-accent/60" />
              {fa ? "مطالعهٔ موردی" : "Case study"}
            </p>
            <h2 className="mt-4 font-display text-h2 text-balance">
              {fa ? "از مسئله تا نتیجه" : "From problem to outcome"}
            </h2>
          </div>

          <div className="space-y-10 lg:col-span-8">
            {problem && (
              <Reveal>
                <div className="rounded-xl border-s-2 border-accent bg-surface p-6">
                  <p className="text-label text-muted">{fa ? "مسئله" : "The problem"}</p>
                  <p className="mt-2 text-body leading-8 text-foreground">{problem}</p>
                </div>
              </Reveal>
            )}

            {steps.length > 0 && (
              <div>
                <p className="text-label text-muted">{fa ? "فرایند" : "Process"}</p>
                <ol className="mt-4 space-y-6">
                  {steps.map((step, index) => (
                    <Reveal key={`${index}-${text(step.title, locale)}`} delay={index * 60}>
                      <li className="grid gap-4 sm:grid-cols-[3rem_1fr] sm:gap-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface font-display text-h4 tabular text-accent">
                          {fa ? ["۱", "۲", "۳", "۴", "۵", "۶"][index] ?? index + 1 : index + 1}
                        </span>
                        <div>
                          <h3 className="font-display text-h4 text-foreground">{text(step.title, locale)}</h3>
                          <p className="mt-1.5 text-body-sm leading-7 text-foreground-secondary">{text(step.text, locale)}</p>
                          {step.image && (
                            <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-background">
                              <Image src={step.image} alt={text(step.title, locale)} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                            </div>
                          )}
                        </div>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}

            {outcome && (
              <Reveal>
                <div>
                  <p className="text-label text-muted">{fa ? "نتیجه" : "The outcome"}</p>
                  <p className="mt-2 font-display text-h3 leading-snug text-balance text-foreground">{outcome}</p>
                  {metrics.length > 0 && (
                    <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {metrics.map((metric) => (
                        <div key={metric.value + text(metric.label, locale)} className="rounded-xl border border-border bg-surface p-4">
                          <dt className="text-caption text-muted">{text(metric.label, locale)}</dt>
                          <dd className="mt-1 font-display text-h3 tabular leading-none text-foreground">{metric.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </Reveal>
            )}

            {tools.length > 0 && (
              <div>
                <p className="text-label text-muted">{fa ? "ابزار و متریال" : "Tools & materials"}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <ToolChip key={tool} label={tool} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
