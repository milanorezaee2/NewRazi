import type { Portfolio } from "@/lib/types";

/** Legacy CMS projects stay in the studio gallery; self-service works stay with their artist. */
export function isStudioPortfolio(work: Portfolio): boolean {
  return (
    work.showcase === "site" ||
    (work.showcase !== "artist" && work.draftStatus === undefined)
  );
}

/**
 * Scheduled release: a work with a future `publishAt` stays private until then.
 * Malformed dates are ignored rather than silently hiding published work.
 */
function isReleased(publishAt?: string, now: number = Date.now()): boolean {
  if (!publishAt) return true;
  const timestamp = Date.parse(publishAt);
  return Number.isNaN(timestamp) || timestamp <= now;
}

export function isPublishedPortfolio(work: Portfolio): boolean {
  const statusOk = work.draftStatus === undefined || work.draftStatus === "published";
  return statusOk && isReleased(work.publishAt);
}

export function artistPortfolioWorks(
  works: Portfolio[],
  artistId: string,
): Portfolio[] {
  return works.filter(
    (work) => work.artistId === artistId && isPublishedPortfolio(work),
  );
}

export function artistPortfolioPath(
  artistSlug: string,
  workSlug?: string,
): string {
  const base = `/artists/${encodeURIComponent(artistSlug)}/portfolio`;
  return workSlug ? `${base}/${encodeURIComponent(workSlug)}` : base;
}
