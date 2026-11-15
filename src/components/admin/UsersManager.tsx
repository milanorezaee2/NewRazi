"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Mail, RefreshCw, Search, ShieldCheck, Users, Radio, Clock3, UserRoundCheck, ExternalLink, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignupDetails {
  phone?: string;
  city?: string;
  specialty?: string;
  instagram?: string;
  portfolioUrl?: string;
  studio?: string;
  experience?: string;
  bio?: string;
  formats?: string[];
  families?: string[];
  termsAcceptedAt?: string;
  artistStatus?: string;
}
interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "artist" | "admin" | string;
  createdAt: string;
  signupDetails?: SignupDetails;
}
interface Reservation {
  id: string;
  eventSlug: string;
  eventType: "course" | "workshop" | "webinar";
  eventTitle: { fa: string; en: string };
  startsAt: string;
  userId?: string;
  name: string;
  email: string;
  createdAt: string;
  status: "reserved" | "cancelled" | "attended";
  paymentRequired?: boolean;
  accessGranted?: boolean;
  source?: string;
}
interface Attendance {
  id: string;
  eventSlug: string;
  eventType: "workshop" | "webinar";
  eventTitle: { fa: string; en: string };
  userId: string;
  name: string;
  email: string;
  firstAccessAt: number;
  lastAccessAt: number;
  roomJoins: number;
  externalHandoffs: number;
  totalDurationSeconds: number;
  lastEntryMode: "room" | "external";
  activeNow: boolean;
}

type Tab = "members" | "registrations" | "attendance";

function fmtDate(value?: string | number) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" }) : "—";
}
function duration(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours.toLocaleString("fa-IR")} ساعت و ${(minutes % 60).toLocaleString("fa-IR")} دقیقه` : `${minutes.toLocaleString("fa-IR")} دقیقه`;
}
function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/[\r\n]+/g, " ");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function exportCsv(filename: string, rows: unknown[][]) {
  const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const SIGNUP_LABELS: Record<keyof SignupDetails, string> = {
  phone: "تلفن",
  city: "شهر",
  specialty: "تخصص",
  instagram: "اینستاگرام",
  portfolioUrl: "لینک پورتفولیو",
  studio: "نام استودیو / برند",
  experience: "سابقهٔ کاری",
  bio: "معرفی",
  formats: "فرمت‌های کاری",
  families: "خانواده‌های محصول",
  termsAcceptedAt: "زمان پذیرش مقررات",
  artistStatus: "وضعیت درخواست طراح",
};

export function UsersManager() {
  const [tab, setTab] = useState<Tab>("members");
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const [userResponse, reservationResponse, attendanceResponse] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include", cache: "no-store", signal }),
        fetch("/api/admin/reservations", { credentials: "include", cache: "no-store", signal }),
        fetch("/api/admin/live-attendance", { credentials: "include", cache: "no-store", signal }),
      ]);
      if ([userResponse, reservationResponse, attendanceResponse].some((response) => response.status === 401)) throw new Error("نشست مدیریت معتبر نیست؛ دوباره وارد پنل شوید.");
      if (!userResponse.ok || !reservationResponse.ok || !attendanceResponse.ok) throw new Error("دریافت داده‌های کاربران یا آمار رویداد ناموفق بود. اتصال ذخیره‌سازی را بررسی کنید.");
      const [userData, reservationData, attendanceData] = await Promise.all([
        userResponse.json() as Promise<{ users?: DirectoryUser[] }>,
        reservationResponse.json() as Promise<{ reservations?: Reservation[] }>,
        attendanceResponse.json() as Promise<{ attendees?: Attendance[] }>,
      ]);
      if (signal?.aborted) return;
      setUsers(userData.users ?? []);
      setReservations(reservationData.reservations ?? []);
      setAttendance(attendanceData.attendees ?? []);
      setRefreshedAt(Date.now());
    } catch (cause) {
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : "خطا در دریافت اطلاعات.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = window.setInterval(() => void load(), 30_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [load]);

  const eventRegistrations = useMemo(() => reservations.filter((item) => item.eventType === "workshop" || item.eventType === "webinar"), [reservations]);
  const activeRegistrations = eventRegistrations.filter((item) => item.status !== "cancelled");
  const internalParticipants = attendance.filter((item) => item.roomJoins > 0);
  const activeNow = attendance.filter((item) => item.activeNow).length;
  const totalLiveMinutes = attendance.reduce((sum, item) => sum + item.totalDurationSeconds, 0) / 60;

  const filteredUsers = users.filter((user) => `${user.name} ${user.email} ${user.role} ${user.signupDetails?.phone ?? ""} ${user.signupDetails?.city ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredRegistrations = eventRegistrations.filter((item) => `${item.name} ${item.email} ${item.eventTitle.fa} ${item.eventTitle.en} ${item.eventSlug}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredAttendance = attendance.filter((item) => `${item.name} ${item.email} ${item.eventTitle.fa} ${item.eventTitle.en} ${item.eventSlug}`.toLowerCase().includes(query.trim().toLowerCase()));

  const exportCurrent = () => {
    if (tab === "members") {
      exportCsv("site-members.csv", [["نام", "ایمیل", "نقش", "شناسه", "تاریخ عضویت", "تلفن", "شهر", "تخصص", "اینستاگرام", "پورتفولیو", "استودیو", "سابقه", "معرفی"], ...filteredUsers.map((user) => [user.name, user.email, user.role, user.id, user.createdAt, user.signupDetails?.phone, user.signupDetails?.city, user.signupDetails?.specialty, user.signupDetails?.instagram, user.signupDetails?.portfolioUrl, user.signupDetails?.studio, user.signupDetails?.experience, user.signupDetails?.bio])]);
    } else if (tab === "registrations") {
      exportCsv("event-registrations.csv", [["نام", "ایمیل", "رویداد", "نوع", "شناسه حساب", "شناسه رزرو", "زمان ثبت", "وضعیت", "پرداخت لازم", "دسترسی", "مبدأ"], ...filteredRegistrations.map((item) => [item.name, item.email, item.eventTitle.fa || item.eventTitle.en, item.eventType, item.userId, item.id, item.createdAt, item.status, item.paymentRequired, item.accessGranted, item.source])]);
    } else {
      exportCsv("live-attendance.csv", [["نام", "ایمیل", "رویداد", "نوع", "شناسه حساب", "اولین ورود", "آخرین ورود", "تعداد ورود اتاق", "انتقال خارجی", "مدت ثبت‌شده (ثانیه)", "آنلاین اکنون"], ...filteredAttendance.map((item) => [item.name, item.email, item.eventTitle.fa || item.eventTitle.en, item.eventType, item.userId, fmtDate(item.firstAccessAt), fmtDate(item.lastAccessAt), item.roomJoins, item.externalHandoffs, item.totalDurationSeconds, item.activeNow])]);
    }
  };

  const tabs: { id: Tab; label: string; count: number; Icon: typeof Users }[] = [
    { id: "members", label: "اعضای سایت", count: users.length, Icon: Users },
    { id: "registrations", label: "ثبت‌نام رویدادها", count: activeRegistrations.length, Icon: CalendarDays },
    { id: "attendance", label: "حضور واقعی در اتاق", count: internalParticipants.length, Icon: Radio },
  ];

  return (
    <section className="admin-users space-y-5" dir="rtl">
      <header className="admin-users__header">
        <div>
          <span className="admin-users__eyebrow">ACCOUNTS · EVENT ACTIVITY</span>
          <h2>کاربران و آمار حضور رویدادها</h2>
          <p>فهرست اعضای ثبت‌شده، رزروهای جداگانهٔ ورکشاپ/وبینار و ورودهای ثبت‌شده در اتاق پخش را از منابع واقعی داده بررسی کنید.</p>
        </div>
        <div className="admin-users__actions">
          <button type="button" onClick={() => void load()} disabled={loading}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />به‌روزرسانی</button>
          <button type="button" onClick={exportCurrent} disabled={loading}><Download className="h-4 w-4" />خروجی CSV</button>
        </div>
      </header>

      <div className="admin-users__stats">
        <article><span><Users />اعضای ثبت‌شده</span><strong>{users.length.toLocaleString("fa-IR")}</strong><small>حساب‌های ذخیره‌شده در سامانه</small></article>
        <article><span><CalendarDays />رزرو فعال رویداد</span><strong>{activeRegistrations.length.toLocaleString("fa-IR")}</strong><small>وبینار و ورکشاپ، بدون رزرو لغوشده</small></article>
        <article><span><UserRoundCheck />کاربران یکتای اتاق</span><strong>{internalParticipants.length.toLocaleString("fa-IR")}</strong><small>{activeNow.toLocaleString("fa-IR")} نفر آنلاین در ۶۰ ثانیهٔ اخیر</small></article>
        <article><span><Clock3 />زمان حضور ثبت‌شده</span><strong>{Math.floor(totalLiveMinutes).toLocaleString("fa-IR")} <small>دقیقه</small></strong><small>از heartbeatهای اتاق زنده؛ جلسه‌های بیرونی جدا هستند</small></article>
      </div>

      <div className="admin-users__toolbar">
        <div className="admin-users__tabs" role="tablist" aria-label="دسته‌بندی کاربران">
          {tabs.map(({ id, label, count, Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => { setTab(id); setQuery(""); }}>
              <Icon /><span>{label}</span><b>{count.toLocaleString("fa-IR")}</b>
            </button>
          ))}
        </div>
        <label className="admin-users__search"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نام، ایمیل یا رویداد…" /></label>
      </div>

      {refreshedAt && <p className="admin-users__refreshed">آخرین دریافت داده: {fmtDate(refreshedAt)} · به‌روزرسانی خودکار هر ۳۰ ثانیه</p>}
      {error && <div className="admin-users__error" role="alert"><CircleAlert />{error}<button type="button" onClick={() => void load()}>تلاش دوباره</button></div>}

      {loading && !refreshedAt ? <div className="admin-users__empty">در حال بارگذاری داده‌های ذخیره‌شده…</div> : null}
      {!error && tab === "members" && (
        <div className="admin-users__list">
          {filteredUsers.length === 0 ? <div className="admin-users__empty">{query ? "کاربری با این مشخصات پیدا نشد." : "هنوز عضوی ثبت نشده است."}</div> : filteredUsers.map((user) => (
            <article className="admin-user-card" key={user.id}>
              <div className="admin-user-card__avatar">{user.name.charAt(0) || "؟"}</div>
              <div className="admin-user-card__main">
                <div className="admin-user-card__title"><strong>{user.name}</strong><span className={`admin-user-role is-${user.role}`}>{user.role === "artist" ? "طراح" : user.role === "admin" ? "مدیر" : "عضو سایت"}</span></div>
                <a href={`mailto:${user.email}`} className="admin-user-card__email"><Mail />{user.email}</a>
                <div className="admin-user-card__meta"><span><CalendarDays />عضویت: {fmtDate(user.createdAt)}</span><code>{user.id}</code></div>
                {user.signupDetails && (
                  <details className="admin-user-card__details">
                    <summary><ShieldCheck />اطلاعات تکمیلی ثبت‌نام طراح</summary>
                    <dl>{(Object.entries(user.signupDetails) as [keyof SignupDetails, SignupDetails[keyof SignupDetails]][]).filter(([, value]) => value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)).map(([key, value]) => <div key={key}><dt>{SIGNUP_LABELS[key]}</dt><dd>{Array.isArray(value) ? value.join("، ") : key === "termsAcceptedAt" ? fmtDate(String(value)) : String(value)}</dd></div>)}</dl>
                  </details>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!error && tab === "registrations" && (
        <div className="admin-users__list">
          {filteredRegistrations.length === 0 ? <div className="admin-users__empty">{query ? "ثبت‌نامی با این مشخصات پیدا نشد." : "هنوز برای ورکشاپ یا وبینار رزروی ثبت نشده است."}</div> : filteredRegistrations.map((item) => (
            <article className="admin-registration-card" key={item.id}>
              <div className="admin-registration-card__top"><span className={`admin-event-type is-${item.eventType}`}>{item.eventType === "webinar" ? "وبینار" : "ورکشاپ"}</span><span className={`admin-registration-status is-${item.status}`}>{item.status === "cancelled" ? "لغوشده" : item.status === "attended" ? "حضور ثبت‌شده" : "رزروشده"}</span><strong>{item.eventTitle.fa || item.eventTitle.en || item.eventSlug}</strong></div>
              <div className="admin-registration-card__identity"><strong>{item.name}</strong><a href={`mailto:${item.email}`}><Mail />{item.email}</a></div>
              <dl className="admin-registration-card__details">
                <div><dt>زمان ثبت</dt><dd>{fmtDate(item.createdAt)}</dd></div>
                <div><dt>شروع رویداد</dt><dd>{fmtDate(item.startsAt)}</dd></div>
                <div><dt>شناسه حساب</dt><dd>{item.userId || "بدون اتصال به حساب"}</dd></div>
                <div><dt>وضعیت پرداخت</dt><dd>{item.paymentRequired ? (item.accessGranted ? "تأیید و دسترسی فعال" : "نیازمند تأیید") : "رایگان / پرداخت لازم نیست"}</dd></div>
                <div><dt>منبع ثبت‌نام</dt><dd>{item.source || "ثبت‌نام رویداد"}</dd></div>
                <div><dt>شناسه رزرو</dt><dd>{item.id}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {!error && tab === "attendance" && (
        <>
          <div className="admin-users__note"><Radio />ورود به اتاق داخلی با ورود کاربر ثبت می‌شود؛ حضور در Zoom یا سرویس خارجی از این سایت قابل راستی‌آزمایی نیست و به‌صورت «انتقال خارجی» جدا نمایش داده می‌شود.</div>
          <div className="admin-users__list">
            {filteredAttendance.length === 0 ? <div className="admin-users__empty">{query ? "حضور مرتبطی پیدا نشد." : "هنوز ورود ثبت‌شده‌ای به اتاق پخش وجود ندارد. آمار از این پس با ورود کاربران ثبت می‌شود."}</div> : filteredAttendance.map((item) => (
              <article className="admin-attendance-card" key={item.id}>
                <div className="admin-attendance-card__top"><span className={`admin-event-type is-${item.eventType}`}>{item.eventType === "webinar" ? "وبینار" : "ورکشاپ"}</span>{item.activeNow && <span className="admin-attendance-online"><i />آنلاین اکنون</span>}<strong>{item.eventTitle.fa || item.eventTitle.en || item.eventSlug}</strong></div>
                <div className="admin-registration-card__identity"><strong>{item.name}</strong><a href={`mailto:${item.email}`}><Mail />{item.email}</a></div>
                <div className="admin-attendance-card__stats">
                  <span><Radio />ورود اتاق: <b>{item.roomJoins.toLocaleString("fa-IR")}</b></span>
                  <span><ExternalLink />انتقال خارجی: <b>{item.externalHandoffs.toLocaleString("fa-IR")}</b></span>
                  <span><Clock3 />مدت ثبت‌شده: <b>{duration(item.totalDurationSeconds)}</b></span>
                </div>
                <div className="admin-attendance-card__dates"><span>اولین ورود: {fmtDate(item.firstAccessAt)}</span><span>آخرین فعالیت: {fmtDate(item.lastAccessAt)}</span><code>{item.userId}</code></div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
