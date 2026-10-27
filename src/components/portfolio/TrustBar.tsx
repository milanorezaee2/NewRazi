import type { Locale } from "@/lib/i18n/types";
import { faNum } from "@/lib/utils";

interface TrustWork {
  client: { fa: string; en: string };
  location: { fa: string; en: string };
  scope: { fa: string; en: string };
  isProject: boolean;
  category?: { name: { fa: string; en: string } } | null;
}

const PRIVATE_CLIENTS = ["خصوصی", "private", "person"];

function label(value: { fa: string; en: string } | undefined, locale: Locale): string {
  if (!value) return "";
  return (locale === "fa" ? value.fa : value.en) || value.fa || value.en || "";
}

/**
 * Trust band built only from facts already stored on the works: realised
 * projects, named clients, disciplines and cities. No invented statistics.
 */
export function TrustBar({ works, locale }: { works: TrustWork[]; locale: Locale }) {
  const fa = locale === "fa";
  const clients = [...new Set(
    works
      .map((work) => ({
        fa: work.client.fa.trim(),
        en: work.client.en.trim(),
      }))
      .filter((client) => client.fa || client.en)
      .filter((client) => !PRIVATE_CLIENTS.some((word) => client.fa.toLowerCase().includes(word) || client.en.toLowerCase().includes(word)))
      .map((client) => label(client, locale)),
  )];
  const disciplines = [...new Set(works.map((work) => label(work.category?.name, locale)).filter(Boolean))];
  const cities = [...new Set(works.map((work) => label(work.location, locale)).filter(Boolean))];
  const projects = works.filter((work) => work.isProject).length;

  const stats = [
    { value: projects, label: fa ? "پروژهٔ اجراشده" : "Realised projects" },
    { value: clients.length, label: fa ? "کارفرمای نام‌دار" : "Named clients" },
    { value: disciplines.length, label: fa ? "حوزهٔ طراحی" : "Disciplines" },
    { value: cities.length, label: fa ? "شهر" : "Cities" },
  ].filter((stat) => stat.value > 0);

  if (!stats.length) return null;

  return (
    <section className="border-y border-border bg-background-secondary">
      <div className="container-x py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-start">
              <p className="font-display text-h2 tabular-nums leading-none text-foreground">
                {fa ? faNum(stat.value) : stat.value}
              </p>
              <p className="mt-2 text-caption text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {clients.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6">
            <p className="text-label text-muted">{fa ? "کارفرمایان" : "Clients"}</p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground-secondary">
              {clients.map((client) => (
                <li key={client}>{client}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
