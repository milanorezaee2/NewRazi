import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/types";

export const dynamic = "force-dynamic";

/**
 * The site now consists of the academy and the studio portfolio.
 * The locale root sends visitors to the academy.
 */
export default async function LocaleIndexPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/academy`);
}
