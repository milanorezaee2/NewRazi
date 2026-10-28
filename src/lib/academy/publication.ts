import type { EducationItem } from "@/lib/types";

/**
 * Scheduled release: a record with a future `publishAt` is treated as unpublished.
 * An unparsable value is ignored so a malformed date never hides content silently.
 */
function isReleased(publishAt?: string, now: number = Date.now()): boolean {
  if (!publishAt) return true;
  const timestamp = Date.parse(publishAt);
  return Number.isNaN(timestamp) || timestamp <= now;
}

/** Legacy academy records without a status stay public; every explicit non-published state is private. */
export function isPublishedEducation(item: Pick<EducationItem, "draftStatus"> & { publishAt?: string }): boolean {
  const statusOk = item.draftStatus === undefined || item.draftStatus === "published";
  return statusOk && isReleased(item.publishAt);
}

export function publicEducationItems<T extends Pick<EducationItem, "draftStatus"> & { publishAt?: string }>(items: T[]): T[] {
  return items.filter(isPublishedEducation);
}
