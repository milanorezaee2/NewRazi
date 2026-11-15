import Link from "next/link";
import { ArrowUpRight, Radio, Sparkles } from "lucide-react";
import type { Banner } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import { contentHref, isExternalContentHref, t } from "@/lib/utils";

export function SiteContentBanner({ banner, locale }: { banner: Banner; locale: Locale }) {
  const title = t(banner.title, locale);
  const text = t(banner.text, locale);
  const destination = contentHref(locale, banner.href);
  const external = isExternalContentHref(destination);
  const showJoin = Boolean(banner.eventSlug && (banner.showJoinButton ?? true));
  const joinDestination = banner.eventSlug ? contentHref(locale, `/academy/${banner.eventSlug}/live?enter=1`) : "";
  const content = (
    <span className="academy-banner__content">
      <span className="academy-banner__icon"><Sparkles aria-hidden="true" className="h-4 w-4" /></span>
      <span className="academy-banner__copy">
        <strong className="academy-banner__title">{title}</strong>
        {text && <span className="academy-banner__text">{text}</span>}
      </span>
      {destination && <span className="academy-banner__arrow"><ArrowUpRight aria-hidden="true" className="h-4 w-4 rtl-flip" /></span>}
    </span>
  );
  const className = "academy-content-banner";

  if (showJoin) {
    return (
      <div className={`${className} academy-content-banner--event`}>
        {destination ? (
          external
            ? <a className="academy-content-banner__main" href={destination} target="_blank" rel="noopener noreferrer">{content}</a>
            : <Link className="academy-content-banner__main" href={destination}>{content}</Link>
        ) : <div className="academy-content-banner__main">{content}</div>}
        <Link className="academy-content-banner__join" href={joinDestination}>
          <Radio aria-hidden="true" className="h-4 w-4" />
          {t(banner.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }, locale)}
        </Link>
      </div>
    );
  }

  if (!destination) return <div className={className}>{content}</div>;
  if (external) {
    return <a href={destination} target={destination.startsWith("http") || destination.startsWith("//") ? "_blank" : undefined} rel={destination.startsWith("http") || destination.startsWith("//") ? "noopener noreferrer" : undefined} className={className}>{content}</a>;
  }
  return <Link href={destination} className={className}>{content}</Link>;
}
