import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EventAccessClient } from "@/components/academy/EventAccessClient";
import { getSession } from "@/lib/auth";
import { getSite } from "@/lib/data/queries";
import { isPublishedEducation } from "@/lib/academy/publication";
import { effectiveLiveStatus } from "@/lib/academy-live";
import type { Locale } from "@/lib/i18n/types";
import { t } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "fa" ? "ورود به رویداد زنده" : "Live event sign in", robots: { index: false } };
}

export default async function EventJoinPage({ params }: Props) {
  const { locale, slug } = await params;
  const [site, session] = await Promise.all([getSite(), getSession()]);
  const event = site.education.find((entry) =>
    entry.slug === slug && isPublishedEducation(entry) && (entry.type === "workshop" || entry.type === "webinar"),
  );
  if (!event?.liveEvent) notFound();

  const status = effectiveLiveStatus(event.liveEvent);
  if (status === "ended" || status === "cancelled" || !event.liveEvent.isOnline) {
    redirect(`/${locale}/academy/${encodeURIComponent(slug)}`);
  }
  const roomPath = `/${locale}/academy/${encodeURIComponent(slug)}/live?enter=1`;
  if (session) redirect(roomPath);

  return (
    <EventAccessClient
      locale={locale}
      title={t(event.title, locale)}
      image={event.image}
      eventSlug={slug}
      returnTo={roomPath}
      authReturnTo={`/${locale}/academy/${encodeURIComponent(slug)}/join`}
    />
  );
}
