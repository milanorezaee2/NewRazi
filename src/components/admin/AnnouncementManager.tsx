"use client";

import { useMemo } from "react";
import Image from "next/image";
import { BellRing, CalendarClock, Clock3, Eye, LayoutPanelTop, Megaphone, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { AnnouncementBarConfig, EducationItem } from "@/lib/types";
import type { Locale, Localized } from "@/lib/i18n/types";
import { cn, t } from "@/lib/utils";

type Props = {
  announcements: AnnouncementBarConfig[];
  education: EducationItem[];
  locale: Locale;
  onChange: (announcements: AnnouncementBarConfig[]) => void;
};

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function BilingualInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
}) {
  const FieldInput = multiline ? Textarea : Input;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label={`${label} · فارسی`}>
        <FieldInput dir="rtl" value={value.fa} rows={multiline ? 3 : undefined} onChange={(event) => onChange({ ...value, fa: event.target.value })} />
      </Field>
      <Field label={`${label} · English`}>
        <FieldInput dir="ltr" value={value.en} rows={multiline ? 3 : undefined} onChange={(event) => onChange({ ...value, en: event.target.value })} />
      </Field>
    </div>
  );
}

export function AnnouncementManager({ announcements, education, locale, onChange }: Props) {
  const events = useMemo(
    () => education.filter((item) => (item.type === "workshop" || item.type === "webinar") && item.liveEvent?.isOnline),
    [education],
  );

  const update = (id: string, patch: Partial<AnnouncementBarConfig>) =>
    onChange(announcements.map((item) => item.id === id ? { ...item, ...patch } : item));

  const add = (display: "bar" | "popup" = "bar") => {
    const next: AnnouncementBarConfig = {
      id: `announcement-${Date.now().toString(36)}`,
      kind: "custom",
      display,
      scope: "all",
      enabled: false,
      message: { fa: "", en: "" },
      href: "/academy",
      ctaLabel: { fa: "بیشتر بدانید", en: "Learn more" },
      showJoinButton: false,
      joinLabel: { fa: "ورود به اتاق پخش", en: "Join live room" },
      bgColor: "#203a30",
      textColor: "#ffffff",
      transition: "slide-down",
      motion: "soft",
      delaySeconds: 2,
      frequency: "once-session",
      eventLeadMinutes: 60,
    };
    onChange([...announcements, next]);
  };

  const enabledCount = announcements.filter((item) => item.enabled).length;
  const activeEventsCount = announcements.filter((item) => item.eventSlug).length;

  return (
    <section className="announcement-admin space-y-6">
      <header className="announcement-admin__hero">
        <div>
          <span className="announcement-admin__eyebrow">SITE-WIDE COMMUNICATIONS</span>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BellRing className="h-5 w-5 text-[#b99a64]" />
            اعلان‌ها
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736c]">
            نوارهای تبلیغاتی و پاپ‌آپ‌ها را برای پورتفولیو، آکادمی یا هر دو صفحه بسازید؛ می‌توانید زمان نمایش را به ورکشاپ یا وبینار وصل کنید.
          </p>
        </div>
        <div className="announcement-admin__hero-actions">
          <Button variant="outline" onClick={() => add("bar")}><LayoutPanelTop className="h-4 w-4" />افزودن نوار</Button>
          <Button onClick={() => add("popup")}><Plus className="h-4 w-4" />افزودن پاپ‌آپ</Button>
        </div>
      </header>

      <div className="announcement-admin__metrics">
        <div><span>همهٔ اعلان‌ها</span><strong>{announcements.length.toLocaleString("fa-IR")}</strong></div>
        <div><span>فعال در سایت</span><strong>{enabledCount.toLocaleString("fa-IR")}</strong></div>
        <div><span>متصل به رویداد</span><strong>{activeEventsCount.toLocaleString("fa-IR")}</strong></div>
      </div>

      <div className="announcement-admin__help">
        <Sparkles className="h-4 w-4 shrink-0" />
        <p><strong>روش سریع:</strong> نوع نمایش را انتخاب کنید، صفحهٔ مقصد را مشخص کنید و در صورت نیاز یک رویداد انتخاب کنید. اعلان رویدادی از زمان پیش از شروع تا پایان مدت رویداد فعال می‌شود؛ در پایان، دکمهٔ اصلی «ذخیره» پنل را بزنید.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="announcement-admin__empty">
          <span><Megaphone className="h-6 w-6" /></span>
          <h3>هنوز اعلانی ساخته نشده</h3>
          <p>یک نوار کوتاه برای اطلاع‌رسانی بسازید یا برای پیام مهم‌تر از پاپ‌آپ استفاده کنید.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => add("bar")}><LayoutPanelTop className="h-4 w-4" />افزودن نوار</Button>
            <Button onClick={() => add("popup")}><Plus className="h-4 w-4" />افزودن پاپ‌آپ</Button>
          </div>
        </div>
      ) : (
        <div className="announcement-admin__list">
          {announcements.map((announcement, index) => {
            const event = events.find((item) => item.slug === announcement.eventSlug);
            const pageText = announcement.scope === "portfolio" ? "پورتفولیو" : announcement.scope === "academy" ? "آکادمی" : "هر دو صفحه";
            const isPopup = announcement.display === "popup";
            const displayName = isPopup ? "پاپ‌آپ" : "نوار تبلیغاتی";
            const backgroundColor = announcement.bgColor || "#203a30";
            const textColor = announcement.textColor || "#ffffff";
            return (
              <article key={announcement.id} className={cn("announcement-card", announcement.enabled && "is-enabled")}>
                <header className="announcement-card__header">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="announcement-card__index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{t(announcement.message, locale) || (locale === "fa" ? "اعلان بدون متن" : "Untitled announcement")}</h3>
                      <p className="mt-1 text-xs text-[#737b75]">{displayName} · {pageText}{event ? ` · ${t(event.title, locale)}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <label className="announcement-card__enable">
                      <input type="checkbox" checked={announcement.enabled} onChange={(event) => update(announcement.id, { enabled: event.target.checked })} />
                      <span className="announcement-card__switch" aria-hidden="true" />
                      <span>{announcement.enabled ? "روشن" : "خاموش"}</span>
                    </label>
                    <button type="button" className="announcement-card__delete" aria-label={locale === "fa" ? "حذف اعلان" : "Delete announcement"} onClick={() => onChange(announcements.filter((item) => item.id !== announcement.id))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </header>

                <div className="announcement-card__body">
                  <div className="announcement-card__fields">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="نوع نمایش">
                        <Select value={announcement.display ?? "bar"} onChange={(event) => update(announcement.id, { display: event.target.value as "bar" | "popup" })}>
                          <option value="bar">نوار تبلیغاتی بالای صفحه</option>
                          <option value="popup">پاپ‌آپ شناور</option>
                        </Select>
                      </Field>
                      <Field label="نمایش در">
                        <Select value={announcement.scope ?? "all"} onChange={(event) => update(announcement.id, { scope: event.target.value as "all" | "portfolio" | "academy" })}>
                          <option value="all">هر دو صفحه: پورتفولیو و آکادمی</option>
                          <option value="portfolio">فقط پورتفولیو</option>
                          <option value="academy">فقط آکادمی</option>
                        </Select>
                      </Field>
                    </div>

                    <BilingualInput label="پیام اصلی" value={announcement.message} onChange={(message) => update(announcement.id, { message })} multiline />
                    <BilingualInput label="متن دکمه" value={announcement.ctaLabel ?? { fa: "", en: "" }} onChange={(ctaLabel) => update(announcement.id, { ctaLabel })} />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="لینک مقصد">
                        <Input dir="ltr" placeholder="/academy یا https://…" value={announcement.href} onChange={(event) => update(announcement.id, { href: event.target.value })} />
                      </Field>
                      <Field label="اتصال به ورکشاپ یا وبینار (اختیاری)">
                        <Select value={announcement.eventSlug ?? ""} onChange={(event) => {
                          const eventSlug = event.target.value || undefined;
                          const previousEventHref = announcement.eventSlug ? `/academy/${announcement.eventSlug}` : "";
                          const followsEvent = !announcement.href || announcement.href === "/academy" || announcement.href === previousEventHref;
                          update(announcement.id, {
                            eventSlug,
                            kind: eventSlug ? "live-webinar" : "custom",
                            showJoinButton: Boolean(eventSlug),
                            ...(eventSlug ? { joinLabel: announcement.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" } } : {}),
                            ...(followsEvent ? { href: eventSlug ? `/academy/${eventSlug}` : "/academy" } : {}),
                          });
                        }}>
                          <option value="">بدون اتصال به رویداد</option>
                          {events.map((item) => <option key={item.id} value={item.slug}>{item.type === "webinar" ? "وبینار · " : "ورکشاپ · "}{t(item.title, locale)}</option>)}
                        </Select>
                      </Field>
                    </div>

                    {announcement.eventSlug ? (
                      <div className="space-y-3 rounded-xl border border-[#e4e9e5] bg-[#f8faf8] p-3">
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#27372f]">
                          <input type="checkbox" checked={announcement.showJoinButton ?? true} onChange={(event) => update(announcement.id, { showJoinButton: event.target.checked })} />
                          نمایش دکمهٔ جداگانهٔ «ورود به اتاق پخش»
                        </label>
                        {(announcement.showJoinButton ?? true) && <BilingualInput label="متن دکمهٔ ورود" value={announcement.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }} onChange={(joinLabel) => update(announcement.id, { joinLabel })} />}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="شروع نمایش پیش از رویداد (دقیقه)">
                            <Input type="number" min={0} max={10080} value={announcement.eventLeadMinutes ?? 60} onChange={(event) => update(announcement.id, { eventLeadMinutes: Number(event.target.value) })} />
                          </Field>
                          <div className="announcement-card__schedule-hint"><CalendarClock className="h-4 w-4" /><span>زمان‌بندی از تاریخ شروع و مدت رویداد خوانده می‌شود.</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="شروع نمایش (اختیاری)">
                          <Input type="datetime-local" dir="ltr" value={toLocalInput(announcement.startsAt)} onChange={(event) => update(announcement.id, { startsAt: fromLocalInput(event.target.value) })} />
                        </Field>
                        <Field label="پایان نمایش (اختیاری)">
                          <Input type="datetime-local" dir="ltr" value={toLocalInput(announcement.expiresAt)} onChange={(event) => update(announcement.id, { expiresAt: fromLocalInput(event.target.value) })} />
                        </Field>
                      </div>
                    )}

                    {isPopup && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="تأخیر نمایش (ثانیه)">
                          <Input type="number" min={0} max={120} value={announcement.delaySeconds ?? 2} onChange={(event) => update(announcement.id, { delaySeconds: Number(event.target.value) })} />
                        </Field>
                        <Field label="دفعات نمایش">
                          <Select value={announcement.frequency ?? "once-session"} onChange={(event) => update(announcement.id, { frequency: event.target.value as "every-visit" | "once-session" })}>
                            <option value="once-session">یک‌بار در هر نشست</option>
                            <option value="every-visit">در هر بار بازدید</option>
                          </Select>
                        </Field>
                        <Field label="تصویر پاپ‌آپ (اختیاری)">
                          <Input dir="ltr" placeholder="/images/…" value={announcement.imageUrl ?? ""} onChange={(event) => update(announcement.id, { imageUrl: event.target.value || undefined })} />
                        </Field>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="حرکت هنگام نمایش">
                        <Select value={announcement.transition ?? "slide-down"} onChange={(event) => update(announcement.id, { transition: event.target.value as AnnouncementBarConfig["transition"] })}>
                          <option value="slide-down">ورود از بالا</option>
                          <option value="fade">محو و ظاهر</option>
                          <option value="blur-in">وضوح تدریجی</option>
                          <option value="bounce">حرکت نرم</option>
                        </Select>
                      </Field>
                      <Field label="شدت حرکت">
                        <Select value={announcement.motion ?? "soft"} onChange={(event) => update(announcement.id, { motion: event.target.value as AnnouncementBarConfig["motion"] })}>
                          <option value="animated">کامل</option>
                          <option value="soft">ملایم</option>
                          <option value="static">بدون حرکت</option>
                        </Select>
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="رنگ پس‌زمینه">
                        <div className="announcement-card__color-field"><input type="color" value={/^#[0-9a-f]{6}$/i.test(backgroundColor) ? backgroundColor : "#203a30"} onChange={(event) => update(announcement.id, { bgColor: event.target.value })} /><Input dir="ltr" value={backgroundColor} onChange={(event) => update(announcement.id, { bgColor: event.target.value })} /></div>
                      </Field>
                      <Field label="رنگ متن">
                        <div className="announcement-card__color-field"><input type="color" value={/^#[0-9a-f]{6}$/i.test(textColor) ? textColor : "#ffffff"} onChange={(event) => update(announcement.id, { textColor: event.target.value })} /><Input dir="ltr" value={textColor} onChange={(event) => update(announcement.id, { textColor: event.target.value })} /></div>
                      </Field>
                    </div>
                  </div>

                  <aside className="announcement-card__preview">
                    <div className="announcement-card__preview-label"><Eye className="h-3.5 w-3.5" /> پیش‌نمایش زنده</div>
                    {isPopup ? (
                      <div className="announcement-preview-popup" style={{ backgroundColor, color: textColor }}>
                        {announcement.imageUrl && <Image src={announcement.imageUrl} alt="" width={640} height={360} unoptimized className="announcement-preview-popup__image" />}
                        <div><span className="announcement-preview-popup__mark"><BellRing className="h-4 w-4" /></span><strong>{t(announcement.message, locale) || "پیام اعلان"}</strong><p>{event ? t(event.title, locale) : pageText}</p>{t(announcement.ctaLabel ?? { fa: "", en: "" }, locale) && <span className="announcement-preview-popup__cta">{t(announcement.ctaLabel!, locale)}</span>}{event && (announcement.showJoinButton ?? true) && <span className="announcement-preview-popup__join">{t(announcement.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }, locale)}</span>}</div>
                      </div>
                    ) : (
                      <div className="announcement-preview-bar" style={{ backgroundColor, color: textColor }}>
                        <BellRing className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1"><strong>{t(announcement.message, locale) || "پیام اعلان"}</strong>{event && <small>{t(event.title, locale)}</small>}</span>
                        {t(announcement.ctaLabel ?? { fa: "", en: "" }, locale) && <span className="announcement-preview-bar__cta">{t(announcement.ctaLabel!, locale)}</span>}
                        {event && (announcement.showJoinButton ?? true) && <span className="announcement-preview-bar__join">{t(announcement.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }, locale)}</span>}
                      </div>
                    )}
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#737b75]"><Clock3 className="h-3.5 w-3.5" />{announcement.eventSlug ? `زمان‌بندی‌شده با رویداد${event ? `: ${t(event.title, locale)}` : ""}` : "زمان‌بندی دستی یا نمایش فوری"}</p>
                  </aside>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
