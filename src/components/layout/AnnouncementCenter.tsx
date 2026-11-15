"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, BellRing, Radio, X } from "lucide-react";
import type { AnnouncementBarConfig, EducationType, LiveEventConfig } from "@/lib/types";
import type { Locale, Localized } from "@/lib/i18n/types";
import { contentHref, isExternalContentHref, t } from "@/lib/utils";

type AnnouncementEvent = {
  slug: string;
  type: EducationType;
  title: Localized;
  liveEvent?: LiveEventConfig;
};

type Props = {
  announcements: AnnouncementBarConfig[];
  events: AnnouncementEvent[];
  page: "portfolio" | "academy";
  locale: Locale;
};

function getEventWindow(event: AnnouncementEvent, now: number, leadMinutes: number) {
  const live = event.liveEvent;
  if (!live || live.status === "cancelled" || live.status === "ended") return false;
  const start = Date.parse(live.startsAt);
  if (!Number.isFinite(start)) return live.status === "live";
  const end = start + Math.max(1, live.durationMin || 60) * 60_000;
  return now >= start - Math.max(0, leadMinutes) * 60_000 && now <= end;
}

export function AnnouncementCenter({ announcements, events, page, locale }: Props) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [visiblePopup, setVisiblePopup] = useState<AnnouncementBarConfig | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const active = useMemo(() => {
    if (!mounted) return [];
    return announcements.filter((announcement) => {
      if (!announcement.enabled) return false;
      const scope = announcement.scope ?? "all";
      if (scope !== "all" && scope !== page) return false;

      if (announcement.eventSlug) {
        const event = events.find((item) => item.slug === announcement.eventSlug);
        return event ? getEventWindow(event, now, announcement.eventLeadMinutes ?? 60) : false;
      }
      if (announcement.kind === "live-webinar") {
        return events.some((event) => event.type === "webinar" && getEventWindow(event, now, 0));
      }
      if (announcement.startsAt) {
        const startsAt = Date.parse(announcement.startsAt);
        if (Number.isFinite(startsAt) && now < startsAt) return false;
      }
      if (announcement.expiresAt) {
        const expiresAt = Date.parse(announcement.expiresAt);
        if (Number.isFinite(expiresAt) && now >= expiresAt) return false;
      }
      return true;
    });
  }, [announcements, events, mounted, now, page]);

  const bars = active.filter((announcement) => (announcement.display ?? "bar") === "bar");
  const popups = active.filter((announcement) => announcement.display === "popup");

  useEffect(() => {
    if (!mounted || visiblePopup) return;
    const next = popups.find((announcement) => {
      if (dismissed.includes(announcement.id)) return false;
      if (announcement.frequency === "once-session") {
        try {
          return sessionStorage.getItem(`ra-announcement-${announcement.id}`) !== "dismissed";
        } catch {
          return true;
        }
      }
      return true;
    });
    if (!next) return;
    const timer = window.setTimeout(() => setVisiblePopup(next), Math.max(0, next.delaySeconds ?? 2) * 1000);
    return () => window.clearTimeout(timer);
  }, [dismissed, mounted, popups, visiblePopup]);

  const dismissPopup = useCallback((announcement: AnnouncementBarConfig) => {
    setVisiblePopup(null);
    setDismissed((current) => [...current, announcement.id]);
    if (announcement.frequency === "once-session") {
      try {
        sessionStorage.setItem(`ra-announcement-${announcement.id}`, "dismissed");
      } catch {
        // Dismissal still applies until this component unmounts.
      }
    }
  }, []);

  useEffect(() => {
    if (!visiblePopup) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissPopup(visiblePopup);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissPopup, visiblePopup]);

  if (!mounted) return null;

  const popupEvent = visiblePopup?.eventSlug
    ? events.find((event) => event.slug === visiblePopup.eventSlug)
    : visiblePopup?.kind === "live-webinar"
      ? events.find((event) => event.type === "webinar" && getEventWindow(event, now, visiblePopup.eventLeadMinutes ?? 0))
      : undefined;
  const popupDestination = visiblePopup ? contentHref(locale, visiblePopup.href || (popupEvent ? `/academy/${popupEvent.slug}` : "")) : "";
  const popupExternal = popupDestination ? isExternalContentHref(popupDestination) : false;
  const popupJoinDestination = popupEvent ? contentHref(locale, `/academy/${popupEvent.slug}/live?enter=1`) : "";
  const popupShowJoin = Boolean(popupEvent?.liveEvent?.isOnline && visiblePopup && (visiblePopup.showJoinButton ?? Boolean(visiblePopup.eventSlug || visiblePopup.kind === "live-webinar")));

  return (
    <>
      {bars.length > 0 && (
        <div className="announcement-center__bars" aria-label={locale === "fa" ? "اعلان‌ها" : "Announcements"}>
          {bars.map((announcement) => {
            const event = announcement.eventSlug
              ? events.find((item) => item.slug === announcement.eventSlug)
              : announcement.kind === "live-webinar"
                ? events.find((item) => item.type === "webinar" && getEventWindow(item, now, announcement.eventLeadMinutes ?? 0))
                : undefined;
            const destination = contentHref(locale, announcement.href || (event ? `/academy/${event.slug}` : ""));
            const external = destination ? isExternalContentHref(destination) : false;
            const message = t(announcement.message, locale);
            const cta = t(announcement.ctaLabel ?? { fa: "", en: "" }, locale);
            const joinLabel = t(announcement.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }, locale);
            const joinDestination = event ? contentHref(locale, `/academy/${event.slug}/live?enter=1`) : "";
            const showJoin = Boolean(event?.liveEvent?.isOnline && joinDestination && (announcement.showJoinButton ?? Boolean(announcement.eventSlug || announcement.kind === "live-webinar")));
            const visualStyle = {
              "--notice-bg": announcement.bgColor || "#203a30",
              "--notice-fg": announcement.textColor || "#ffffff",
            } as CSSProperties;
            const attributes = {
              className: `announcement-bar${showJoin ? " announcement-bar--with-join" : ""}`,
              "data-transition": announcement.transition ?? "slide-down",
              "data-motion": announcement.motion ?? "soft",
              dir: announcement.direction ?? (locale === "fa" ? "rtl" : "ltr"),
              style: visualStyle,
            };
            const copy = (
              <>
                <span className="announcement-bar__icon"><BellRing className="h-4 w-4" aria-hidden="true" /></span>
                <span className="announcement-bar__copy">
                  <strong>{message}</strong>
                  {event && <span>{t(event.title, locale)}</span>}
                </span>
              </>
            );
            if (showJoin) {
              return (
                <div key={announcement.id} {...attributes}>
                  <span className="announcement-bar__inner">{copy}</span>
                  {cta && destination && (external
                    ? <a className="announcement-bar__detail" href={destination} target="_blank" rel="noopener noreferrer">{cta}<ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" /></a>
                    : <Link className="announcement-bar__detail" href={destination}>{cta}<ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" /></Link>)}
                  <Link className="announcement-bar__join" href={joinDestination}><Radio className="h-4 w-4" aria-hidden="true" />{joinLabel}</Link>
                </div>
              );
            }
            const content = (
              <span className="announcement-bar__inner">
                {copy}
                {cta && destination && <span className="announcement-bar__cta">{cta}<ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" /></span>}
              </span>
            );
            return destination ? (
              external ? <a key={announcement.id} href={destination} target="_blank" rel="noopener noreferrer" {...attributes}>{content}</a>
                : <Link key={announcement.id} href={destination} {...attributes}>{content}</Link>
            ) : <div key={announcement.id} {...attributes}>{content}</div>;
          })}
        </div>
      )}

      {visiblePopup && (
        <div className="announcement-popup__backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) dismissPopup(visiblePopup); }}>
          <section
            className="announcement-popup"
            data-transition={visiblePopup.transition ?? "fade"}
            data-motion={visiblePopup.motion ?? "soft"}
            style={{ "--popup-bg": visiblePopup.bgColor || "#ffffff", "--popup-fg": visiblePopup.textColor || "#203a30" } as CSSProperties}
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-popup-title"
            dir={visiblePopup.direction ?? (locale === "fa" ? "rtl" : "ltr")}
          >
            <button type="button" className="announcement-popup__close" onClick={() => dismissPopup(visiblePopup)} aria-label={locale === "fa" ? "بستن اعلان" : "Close announcement"}>
              <X className="h-4 w-4" />
            </button>
            {visiblePopup.imageUrl && <Image className="announcement-popup__image" src={visiblePopup.imageUrl} alt="" width={960} height={540} unoptimized />}
            <div className="announcement-popup__body">
              <span className="announcement-popup__eyebrow"><BellRing className="h-4 w-4" />{locale === "fa" ? "اطلاعیهٔ آتلیه" : "Atelier announcement"}</span>
              <h2 id="announcement-popup-title">{t(visiblePopup.message, locale)}</h2>
              {popupEvent && <p className="announcement-popup__event">{t(popupEvent.title, locale)}</p>}
              {(popupDestination && t(visiblePopup.ctaLabel ?? { fa: "", en: "" }, locale) || popupShowJoin) && (
                <div className="announcement-popup__actions">
                  {popupDestination && t(visiblePopup.ctaLabel ?? { fa: "", en: "" }, locale) && (
                    popupExternal
                      ? <a className="announcement-popup__action" href={popupDestination} target="_blank" rel="noopener noreferrer">{t(visiblePopup.ctaLabel!, locale)}<ArrowUpLeft className="h-4 w-4" /></a>
                      : <Link className="announcement-popup__action" href={popupDestination}>{t(visiblePopup.ctaLabel!, locale)}<ArrowUpLeft className="h-4 w-4" /></Link>
                  )}
                  {popupShowJoin && <Link className="announcement-popup__join" href={popupJoinDestination}><Radio className="h-4 w-4" />{t(visiblePopup.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }, locale)}</Link>}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
