"use client";

import { useState } from "react";
import Image from "@/components/ui/SiteImage";
import Link from "next/link";
import { ArrowLeft, CalendarClock, LockKeyhole, Radio, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/profile/AuthForm";
import type { Locale } from "@/lib/i18n/types";
import { href } from "@/lib/utils";

export function EventAccessClient({
  locale,
  title,
  image,
  eventSlug,
  returnTo,
  authReturnTo,
}: {
  locale: Locale;
  title: string;
  image: string;
  eventSlug: string;
  returnTo: string;
  authReturnTo: string;
}) {
  const fa = locale === "fa";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [entering, setEntering] = useState(false);

  const continueToRoom = () => {
    setEntering(true);
    window.location.assign(returnTo);
  };

  return (
    <main className="event-access-page" dir={fa ? "rtl" : "ltr"}>
      <div className="event-access-page__glow event-access-page__glow--one" />
      <div className="event-access-page__glow event-access-page__glow--two" />
      <div className="event-access-page__layout">
        <section className="event-access-event">
          <Link href={href(locale, `/academy/${eventSlug}`)} className="event-access-back">
            <ArrowLeft className={fa ? "rotate-180" : ""} />
            {fa ? "بازگشت به صفحهٔ رویداد" : "Back to event details"}
          </Link>
          <div className="event-access-event__media">
            {image ? <Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 55vw" priority className="object-cover" /> : null}
            <div className="event-access-event__scrim" />
            <span className="event-access-live"><Radio />{fa ? "ورود امن به رویداد زنده" : "Secure live event access"}</span>
          </div>
          <span className="event-access-kicker"><CalendarClock />{fa ? "ورکشاپ / وبینار" : "Workshop / webinar"}</span>
          <h1>{title}</h1>
          <p className="event-access-event__copy">
            {fa
              ? "برای ثبت حضور و ورود ایمن به اتاق پخش، وارد حساب خود شوید یا یک حساب رایگان بسازید. پس از تأیید، شمارش معکوس ورود نمایش داده می‌شود."
              : "Sign in or create a free account to register your attendance and enter the secure live room. A short entry countdown starts after verification."}
          </p>
          <div className="event-access-trust">
            <span><ShieldCheck />{fa ? "حضور با حساب کاربری ثبت می‌شود" : "Attendance is linked to your account"}</span>
            <span><LockKeyhole />{fa ? "اطلاعات ورود امن می‌ماند" : "Your sign-in remains secure"}</span>
          </div>
        </section>

        <section className="event-access-card" aria-labelledby="event-access-heading">
          <div className="event-access-card__heading">
            <span className="event-access-card__mark"><Radio /></span>
            <div>
              <p>{fa ? "ورود به اتاق پخش" : "Enter the live room"}</p>
              <h2 id="event-access-heading">{mode === "login" ? (fa ? "خوش آمدید" : "Welcome back") : (fa ? "ساخت حساب کاربری" : "Create your account")}</h2>
            </div>
          </div>
          <div className="event-access-tabs" role="tablist" aria-label={fa ? "ورود یا ثبت‌نام" : "Sign in or sign up"}>
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>
              {fa ? "ورود" : "Sign in"}
            </button>
            <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "is-active" : ""} onClick={() => setMode("signup")}>
              {fa ? "ثبت‌نام" : "Create account"}
            </button>
          </div>
          {entering ? (
            <div className="event-access-entering" role="status" aria-live="polite">
              <span className="event-access-spinner" />
              <strong>{fa ? "در حال آماده‌سازی اتاق پخش…" : "Preparing your live room…"}</strong>
              <p>{fa ? "شمارش معکوس ورود در لحظهٔ بعد آغاز می‌شود." : "Your room countdown will begin next."}</p>
            </div>
          ) : (
            <AuthForm
              key={mode}
              mode={mode}
              returnTo={authReturnTo}
              hideAccountSwitch
              onLoginSuccess={continueToRoom}
              onSignupSuccess={continueToRoom}
            />
          )}
          <p className="event-access-card__privacy">
            {fa ? "با ادامه، اطلاعات حساب برای ثبت‌نام و آمار واقعی حضور همین رویداد استفاده می‌شود." : "Your account details are used only for this event registration and accurate attendance reporting."}
          </p>
        </section>
      </div>
    </main>
  );
}
