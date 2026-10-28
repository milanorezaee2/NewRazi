import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/types";

export const dynamic = "force-dynamic";

/**
 * The portfolio is the front door of the two-page site: visitors meet the work
 * first and continue to the academy. The locale root therefore forwards to the
 * portfolio.
 */
export default async function LocaleIndexPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/portfolio`);
}
