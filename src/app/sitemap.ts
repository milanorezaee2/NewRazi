import type { MetadataRoute } from "next";
import { publicEducationItems } from "@/lib/academy/publication";
import { isPublishedPortfolio, isStudioPortfolio } from "@/lib/artist/portfolio";
import { getContent } from "@/lib/data/store";
import { LOCALES } from "@/lib/i18n/types";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** The public site is the academy and the studio portfolio. */
const STATIC_PAGES = ["/academy", "/portfolio"] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const education = publicEducationItems(content.education);
  const portfolios = content.portfolios.filter((item) => isStudioPortfolio(item) && isPublishedPortfolio(item));

  /* The last-modified stamp is computed once so every URL in a response agrees. */
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PAGES) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency: "weekly",
        priority: path === "/academy" ? 1 : 0.9,
      });
    }
    for (const item of education) {
      entries.push({ url: `${SITE_URL}/${locale}/academy/${item.slug}`, lastModified, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const item of portfolios) {
      entries.push({ url: `${SITE_URL}/${locale}/portfolio/${item.slug}`, lastModified, changeFrequency: "monthly", priority: 0.7 });
    }
  }

  return entries;
}
