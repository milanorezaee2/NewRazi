import type { Locale } from "@/lib/i18n/types";

interface TrustWork {
  client: { fa: string; en: string };
  category?: { name: { fa: string; en: string } } | null;
}

const PRIVATE_CLIENTS = ["خصوصی", "private", "person"];

function label(value: { fa: string; en: string } | undefined, locale: Locale): string {
  if (!value) return "";
  return (locale === "fa" ? value.fa : value.en) || value.fa || value.en || "";
}

/**
 * Trust strip built only from facts already stored on the works: named clients
 * and design disciplines. No invented statistics.
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
  if (!clients.length && !disciplines.length) return null;

  /*
   * A slim strip rather than a second statistics band: the introduction above
   * already carries the headline numbers, so this row only names the clients and
   * disciplines that back them.
   */
  return (
    <section className="border-y border-border bg-background-secondary" aria-label={fa ? "کارفرمایان و حوزه‌ها" : "Clients and disciplines"}>
      <div className="container-x flex flex-wrap items-center gap-x-8 gap-y-2 py-5 text-caption">
        {clients.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-label text-muted">{fa ? "کارفرمایان" : "Clients"}</span>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-foreground-secondary">
              {clients.map((client, index) => (
                <li key={client} className="flex items-center gap-3">
                  {index > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-border" />}
                  {client}
                </li>
              ))}
            </ul>
          </div>
        )}
        {disciplines.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-label text-muted">{fa ? "حوزه‌ها" : "Disciplines"}</span>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-foreground-secondary">
              {disciplines.map((discipline) => (
                <li key={discipline}>{discipline}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
