"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpLeft,
  ArrowUpRight,
  Bell,
  BellRing,
  BookOpen,
  ChevronLeft,
  FileText,
  Eye,
  Frame,
  GalleryHorizontalEnd,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { PortfoliosManager } from "@/components/admin/PortfoliosManager";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";
import { AcademyManager } from "@/components/admin/AcademyManager";
import { useAuth, useLocale } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { SESSION_FETCH } from "@/lib/http";
import { mergeSeoEntries, SEO_ROUTE_DEFAULTS } from "@/lib/seo-pages";
import { ADMIN_LOGIN_DISABLED } from "@/lib/admin-access";
import { withCsrf } from "@/lib/security/csrf-client";
import { cn } from "@/lib/utils";
import type { Banner, EducationItem, SeoMeta, SiteContent } from "@/lib/types";
import { UsersManager } from "@/components/admin/UsersManager";
import { formatInvalidContentWriteMessage } from "@/lib/admin-content-issues";
import type { ContentRelationIssueSummary } from "@/lib/admin-content-issues";
import type { ProductFamilyReferenceCounts } from "@/lib/product-family-references";
import { PagesManager } from "@/components/admin/PagesManager";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import type { Localized } from "@/lib/i18n/types";

type Section =
  | "dashboard"
  | "pages"
  | "portfolios"
  | "education"
  | "banners"
  | "announcements"
  | "users"
  | "seo";

const REDIRECT_GRACE_MS = 300;

class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}

class ContentConflictError extends Error {
  constructor() {
    super("etag_conflict");
    this.name = "ContentConflictError";
  }
}

class ContentRelationsError extends Error {
  constructor(public readonly issues: ContentRelationIssueSummary[]) {
    super("invalid_relationships");
    this.name = "ContentRelationsError";
  }
}

class ProductFamilyInUseError extends Error {
  constructor(
    public readonly familyId: string,
    public readonly references: ProductFamilyReferenceCounts,
  ) {
    super("product_family_in_use");
    this.name = "ProductFamilyInUseError";
  }
}

function productFamilyDependencyMessage(error: ProductFamilyInUseError, data: SiteContent | null): string {
  const name = data?.productFamilies.find((family) => family.id === error.familyId)?.name.fa ?? error.familyId;
  const refs = error.references;
  const details = [
    refs.products ? `${refs.products.toLocaleString("fa-IR")} محصول` : "",
    refs.artistSignups ? `${refs.artistSignups.toLocaleString("fa-IR")} ثبت‌نام طراح` : "",
    refs.marketplaceAssets ? `${refs.marketplaceAssets.toLocaleString("fa-IR")} اثر مارکت‌پلیس` : "",
    refs.openUploads ? `${refs.openUploads.toLocaleString("fa-IR")} آپلود باز` : "",
  ].filter(Boolean).join("، ");
  return `حذف «${name}» انجام نشد؛ این خانواده هنوز در ${details || "محتوای دیگری"} استفاده می‌شود. وابستگی‌ها را به خانواده‌ای دیگر منتقل کنید و دوباره ذخیره کنید.`;
}

interface AdminContentResponse<T> {
  data: T;
  etag: string | null;
}

async function adminFetch<T>(init?: RequestInit): Promise<AdminContentResponse<T>> {
  const r = await fetch("/api/admin/content", { ...SESSION_FETCH, ...withCsrf(init ?? {}) });
  if (r.status === 401) throw new UnauthorizedError();
  const payload = await r.json().catch(() => null) as (T & {
    error?: string;
    issues?: ContentRelationIssueSummary[];
    familyId?: string;
    references?: ProductFamilyReferenceCounts;
  }) | null;
  if (r.status === 409 && payload?.error === "etag_conflict") throw new ContentConflictError();
  if (r.status === 409 && payload?.error === "product_family_in_use" && payload.familyId && payload.references) {
    throw new ProductFamilyInUseError(payload.familyId, payload.references);
  }
  if (r.status === 422 && payload?.error === "invalid_relationships") {
    throw new ContentRelationsError(payload.issues ?? []);
  }
  if (!r.ok) throw new Error(`admin/content → ${r.status}`);
  const rawEtag = r.headers.get("ETag");
  return {
    data: payload as T,
    etag: rawEtag?.replace(/^"|"$/g, "") ?? null,
  };
}

/* ============================================================
   تعریف منوی کناری
   ============================================================ */
interface NavGroup {
  label: string;
  /** `href` turns an entry into a link to another admin screen (own route). */
  items: { id: Section; label: string; icon: React.ReactNode; badge?: string; href?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "نمای کلی",
    items: [
      { id: "dashboard", label: "داشبورد", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    label: "محتوا",
    items: [
      { id: "education", label: "آکادمی", icon: <BookOpen className="h-4 w-4" /> },
      { id: "portfolios", label: "پورتفولیو", icon: <GalleryHorizontalEnd className="h-4 w-4" /> },
      { id: "pages", label: "مدیریت صفحه‌ها", icon: <Monitor className="h-4 w-4" /> },
      { id: "banners", label: "بنرهای آکادمی", icon: <Sparkles className="h-4 w-4" /> },
      { id: "announcements", label: "اعلان", icon: <BellRing className="h-4 w-4" /> },
      { id: "users", label: "کاربران و حضور رویدادها", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    label: "تنظیمات",
    items: [
      { id: "seo", label: "متادیتای صفحه‌ها", icon: <Settings2 className="h-4 w-4" /> },
    ],
  },
];

/* ============================================================
   پوسته اصلی پنل ادمین
   ============================================================ */
export function AdminApp() {
  const { user, ready } = useAuth();
  const { locale } = useLocale();
  const router = useRouter();
  const [data, setData] = useState<SiteContent | null>(null);
  const dataRef = useRef<SiteContent | null>(null);
  const [contentEtag, setContentEtag] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("dashboard");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [saveError, setSaveError] = useState<"conflict" | "error" | "relationships" | null>(null);
  const [relationErrorMessage, setRelationErrorMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState<"unauthorized" | "error" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // PWA shortcuts can open a specific admin section via ?section=…
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("section");
    if (!requested || requested === "marketplace") return;
    const item = NAV_GROUPS.flatMap((group) => group.items).find((entry) => entry.id === requested);
    if (item) setSection(item.id);
  }, []);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoadError(null);
    try {
      const response = await adminFetch<SiteContent>({ signal });
      if (!response.etag) throw new Error("admin/content response missing ETag");
      dataRef.current = response.data;
      setData(response.data);
      setContentEtag(response.etag);
      setDirty(false);
      setStatus("idle");
      setSaveError(null);
    } catch (e) {
      if (signal?.aborted) return;
      setLoadError(e instanceof UnauthorizedError ? "unauthorized" : "error");
    }
  }, []);

  useEffect(() => {
    if (!ready || user !== null || loadError === "unauthorized") return;
    const id = window.setTimeout(
      () => router.replace(`/admin/${locale}/login`),
      REDIRECT_GRACE_MS,
    );
    return () => window.clearTimeout(id);
  }, [ready, user, loadError, router, locale]);

  useEffect(() => {
    if (!ready || user?.role !== "admin") return;
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [ready, user, load]);

  const update = useCallback((patch: Partial<SiteContent>) => {
    const current = dataRef.current;
    if (!current) return;
    const next = { ...current, ...patch };
    dataRef.current = next;
    setData(next);
    setDirty(true);
  }, []);

  const save = async () => {
    if (!data) return;
    if (!contentEtag) {
      setStatus("error");
      setSaveError("error");
      return;
    }

    const savedSnapshot = data;
    setStatus("saving");
    setSaveError(null);
    setRelationErrorMessage(null);
    try {
      const response = await adminFetch<{ ok: true }>({
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "If-Match": `"${contentEtag}"`,
        },
        body: JSON.stringify(savedSnapshot),
      });
      if (!response.etag) throw new Error("admin/content response missing ETag");
      setContentEtag(response.etag);
      const hasNewChanges = dataRef.current !== savedSnapshot;
      setDirty(hasNewChanges);
      setStatus(hasNewChanges ? "idle" : "ok");
      router.refresh();
      if (!hasNewChanges) setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        setStatus("idle");
        setLoadError("unauthorized");
      } else if (e instanceof ContentConflictError) {
        // Keep the local draft intact; the operator can review the latest server version before retrying.
        setStatus("error");
        setSaveError("conflict");
      } else if (e instanceof ProductFamilyInUseError) {
        setStatus("error");
        setSaveError("relationships");
        setRelationErrorMessage(productFamilyDependencyMessage(e, dataRef.current));
      } else if (e instanceof ContentRelationsError) {
        setStatus("error");
        setSaveError("relationships");
        setRelationErrorMessage(formatInvalidContentWriteMessage(e.issues));
      } else {
        setStatus("error");
        setSaveError("error");
      }
      throw e;
    }
  };

  const reset = async () => {
    if (!confirm("این کار فقط سند محتوای سایت (صفحه‌ها، کاتالوگ و تنظیمات محتوا) را به دادهٔ اولیه برمی‌گرداند. حساب‌های کاربری، سفارش‌ها، گفتگوها، رزروها و داده‌های جداگانهٔ مارکت‌پلیس پاک نمی‌شوند. ادامه می‌دهید؟"))
      return;
    if (!contentEtag) {
      setStatus("error");
      setSaveError("error");
      return;
    }
    setSaveError(null);
    setRelationErrorMessage(null);
    try {
      await adminFetch<{ ok: true }>({
        method: "DELETE",
        headers: { "If-Match": `"${contentEtag}"` },
      });
      const latest = await adminFetch<SiteContent>();
      if (!latest.etag) throw new Error("admin/content response missing ETag");
      dataRef.current = latest.data;
      setData(latest.data);
      setContentEtag(latest.etag);
      setDirty(false);
      setLoadError(null);
      setSaveError(null);
      setRelationErrorMessage(null);
      setStatus("idle");
      router.refresh();
    } catch (e) {
      if (e instanceof UnauthorizedError) setLoadError("unauthorized");
      else if (e instanceof ContentConflictError) {
        setStatus("error");
        setSaveError("conflict");
      } else if (e instanceof ProductFamilyInUseError) {
        setStatus("error");
        setSaveError("relationships");
        setRelationErrorMessage(productFamilyDependencyMessage(e, dataRef.current));
      } else if (e instanceof ContentRelationsError) {
        setStatus("error");
        setSaveError("relationships");
        setRelationErrorMessage(formatInvalidContentWriteMessage(e.issues));
      } else {
        setStatus("error");
        setSaveError("error");
      }
    }
  };

  if (user && user.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8">
        <ErrorState message="این حساب کاربری دسترسی ادمین ندارد. با ایمیل admin@… وارد شوید." />
      </div>
    );
  }

  const activeLabel =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === section)?.label ?? "داشبورد";

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]" dir="rtl">
      {/* پوشش پس‌زمینه (موبایل) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── نوار کناری ── */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-64 max-w-[85vw] flex-col bg-[#1e2230] pb-[env(safe-area-inset-bottom)] text-white transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        {/* برند */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
            <Frame className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">آتلیه رزی</p>
            <p className="text-[11px] text-white/50">پنل مدیریت</p>
          </div>
          <button className="mr-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        {/* منو */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = section === item.id;
                const classes = cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 min-h-[44px] text-sm transition-colors",
                  active
                    ? "bg-accent/90 text-white font-medium"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white",
                );
                if (item.href) {
                  return (
                    <a key={item.id} href={item.href} className={classes} onClick={() => setSidebarOpen(false)}>
                      <span className="shrink-0 text-white/50">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                      <ArrowUpLeft className="mr-auto h-3.5 w-3.5 text-white/40" />
                    </a>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={classes}
                  >
                    <span className={cn("shrink-0", active ? "text-white" : "text-white/50")}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="mr-auto rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* پاورقی کاربر */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/30 text-xs font-semibold text-accent">
              {user?.name?.charAt(0) ?? "م"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name ?? "ادمین"}</p>
              <p className="truncate text-[11px] text-white/40">{user?.email ?? ""}</p>
            </div>
            {!ADMIN_LOGIN_DISABLED && (
              <button
                onClick={() => router.push(`/admin/${locale}/login`)}
                className="text-white/40 hover:text-white"
                title="خروج از حساب"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── ناحیه محتوای اصلی ── */}
      <div className="flex min-w-0 flex-1 flex-col lg:mr-64">
        {/* نوار بالا */}
        <header className="sticky top-0 z-20 flex min-h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-3 border-b border-[#e2e6ea] bg-white px-4 pt-[env(safe-area-inset-top)] md:px-6">
          <button
            className="flex h-10 min-h-[44px] w-10 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-secondary lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* مسیرنما */}
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden text-foreground-secondary sm:inline">مدیریت</span>
            <ChevronLeft className="hidden h-3.5 w-3.5 text-muted sm:inline" />
            <span className="truncate font-medium text-foreground">{activeLabel}</span>
          </div>

          <div className="mr-auto flex items-center gap-2">
            {/* وضعیت ذخیره */}
            {status === "ok" && (
              <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                ذخیره شد
              </span>
            )}
            {status === "error" && (
              <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-medium text-error">
                {saveError === "conflict"
                  ? "تغییر هم‌زمان؛ بازبینی لازم است"
                  : saveError === "relationships" ? "ارجاع محتوا نیاز به اصلاح دارد" : "خطا در ذخیره"}
              </span>
            )}
            {dirty && status === "idle" && (
              <span className="hidden rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning sm:inline">
                تغییرات ذخیره نشده
              </span>
            )}

            <button className="hidden h-8 w-8 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-secondary sm:flex">
              <Bell className="h-4 w-4" />
            </button>

            <button className="hidden h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-foreground-secondary hover:bg-background-secondary md:flex">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">جستجو…</span>
            </button>

            <button
              onClick={reset}
              className="hidden h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-foreground-secondary hover:bg-background-secondary md:flex"
              title="بازگرداندن به محتوای اولیه"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">بازنشانی</span>
            </button>

            <button
              onClick={() => { void save().catch(() => undefined); }}
              disabled={!dirty || status === "saving"}
              aria-label={status === "saving" ? "در حال ذخیره تغییرات" : "ذخیره تغییرات"}
              aria-busy={status === "saving"}
              className={cn(
                "flex h-9 min-h-[44px] items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
                dirty && status !== "saving"
                  ? "bg-[#1e2230] text-white hover:bg-[#2a3045]"
                  : "cursor-not-allowed bg-[#1e2230]/30 text-white/50",
              )}
            >
              <Save className="h-4 w-4" />
              <span className="hidden xs:inline">{status === "saving" ? "…" : "ذخیره"}</span>
            </button>
          </div>
        </header>

        {/* بدنه صفحه */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {saveError && data && (
            <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-error/30 bg-error/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-foreground">
                <p className="font-semibold">
                  {saveError === "conflict"
                    ? "نسخهٔ محتوای سایت هم‌زمان تغییر کرده است."
                    : saveError === "relationships" ? "ارجاع‌های بین محتواها معتبر نیستند." : "وضعیت ذخیره‌سازی تأیید نشد."}
                </p>
                <p className="mt-1 text-xs text-foreground-secondary">
                  {saveError === "conflict"
                    ? "پیش‌نویس فعلی شما حفظ شده و بازنویسی نشده است. بارگذاری نسخهٔ سرور، تغییرات محلی ذخیره‌نشده را جایگزین می‌کند."
                    : saveError === "relationships"
                      ? relationErrorMessage
                      : "برای اطمینان از وضعیت سرور، نسخهٔ فعلی را بارگذاری کنید؛ این کار پیش‌نویس محلی را جایگزین می‌کند."}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-error/30 px-3 py-2 text-xs font-semibold text-error hover:bg-error/10"
                onClick={() => {
                  if (dirty && !confirm("بارگذاری نسخهٔ سرور، تمام تغییرات ذخیره‌نشدهٔ این صفحه را جایگزین می‌کند. ادامه می‌دهید؟")) return;
                  void load();
                }}
              >
                بارگذاری نسخهٔ سرور
              </button>
            </div>
          )}
          {loadError === "unauthorized" ? (
            <div className="max-w-lg space-y-3">
              <ErrorState
                message="سرور ۴۰۱ برگرداند — نشست ادمین منقضی شده. دوباره وارد شوید."
                onRetry={() => void load()}
              />
              <p className="text-center text-sm text-muted">
                <Link
                  href={`/admin/${locale}/login`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  رفتن به صفحه ورود
                </Link>
              </p>
            </div>
          ) : loadError === "error" ? (
            <ErrorState
              message="ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید."
              onRetry={() => void load()}
            />
          ) : !data ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : (
            <div key={section} className="anim-fade-up">
              {section === "dashboard" && (
                <OverviewDashboard data={data} setSection={setSection} />
              )}
              {section === "pages" && (
                <PagesManager data={data} update={update} locale={locale} />
              )}
              {section === "portfolios" && (
                <PortfoliosManager data={data} update={update} locale={locale} />
              )}
              {section === "education" && (
                <AcademyManager data={data} update={update} locale={locale} />
              )}
              {section === "banners" && (
                <BannersEditor
                  banners={data.banners}
                  education={data.education}
                  onChange={(banners) => update({ banners })}
                />
              )}
              {section === "announcements" && (
                <AnnouncementManager
                  announcements={data.announcementBars ?? []}
                  education={data.education}
                  locale={locale}
                  onChange={(announcementBars) => update({ announcementBars })}
                />
              )}
              {section === "users" && <UsersManager />}
              {section === "seo" && (
                <SeoEditor seo={data.seo} onChange={(seo) => update({ seo })} />
              )}
            </div>
          )}
        </main>

        {/* ── Bottom navigation for mobile (PWA) ── */}
        <MobileAdminNav
          activeSection={section}
          onSelect={(id) => {
            setSection(id as Section);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onOpenMenu={() => setSidebarOpen(true)}
          dirty={dirty}
          saving={status === "saving"}
          onSave={() => { void save().catch(() => undefined); }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   بخش‌های صفحه اصلی
   ============================================================ */
/* ============================================================
   ویرایشگر بنرها
   ============================================================ */
function BannersEditor({
  banners,
  education,
  onChange,
}: {
  banners: Banner[];
  education: EducationItem[];
  onChange: (b: Banner[]) => void;
}) {
  const events = education.filter((item) => (item.type === "workshop" || item.type === "webinar") && item.liveEvent?.isOnline);
  const set = (id: string, patch: Partial<Banner>) =>
    onChange(banners.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const enabledCount = banners.filter((banner) => banner.enabled).length;
  const academyCount = banners.filter((banner) => banner.placement === "academy").length;

  return (
    <section className="academy-banners-admin space-y-5">
      <header className="academy-banners-admin__header">
        <div className="min-w-0">
          <span className="academy-banners-admin__eyebrow">ACADEMY · PROMOTIONS</span>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Sparkles className="h-5 w-5 text-[#b79a68]" />
            بنرهای آکادمی
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            پیام‌های تبلیغاتی را مدیریت کنید؛ جایگاه، لینک و وضعیت نمایش هر بنر را جداگانه تنظیم کنید.
          </p>
        </div>
        <Button
          onClick={() =>
            onChange([
              ...banners,
              {
                id: `b-${Date.now().toString(36)}`,
                title: { fa: "", en: "" },
                text: { fa: "", en: "" },
                href: "/academy",
                enabled: true,
                placement: "academy",
                showJoinButton: false,
                joinLabel: { fa: "ورود به اتاق پخش", en: "Join live room" },
              },
            ])
          }
          className="academy-banners-admin__add"
        >
          <Plus className="h-4 w-4" />
          افزودن بنر
        </Button>
      </header>

      <div className="academy-banners-admin__summary" aria-label="خلاصه بنرها">
        <div><span>همهٔ بنرها</span><strong>{banners.length.toLocaleString("fa-IR")}</strong></div>
        <div><span>فعال</span><strong>{enabledCount.toLocaleString("fa-IR")}</strong></div>
        <div><span>جایگاه آکادمی</span><strong>{academyCount.toLocaleString("fa-IR")}</strong></div>
      </div>

      {banners.length === 0 ? (
        <div className="academy-banners-admin__empty">
          <span className="academy-banners-admin__empty-icon"><Sparkles className="h-5 w-5" /></span>
          <h3>هنوز بنری ثبت نشده است</h3>
          <p>با افزودن بنر، پیام‌های مهم آکادمی را در جایگاه مناسب نمایش دهید.</p>
          <Button
            variant="outline"
            onClick={() => onChange([{
              id: `b-${Date.now().toString(36)}`,
              title: { fa: "", en: "" },
              text: { fa: "", en: "" },
              href: "/academy",
              enabled: true,
              placement: "academy",
              showJoinButton: false,
              joinLabel: { fa: "ورود به اتاق پخش", en: "Join live room" },
            }])}
          >
            <Plus className="h-4 w-4" /> افزودن اولین بنر
          </Button>
        </div>
      ) : (
        <ul className="academy-banners-admin__list">
          {banners.map((banner, index) => (
            <li key={banner.id} className="academy-banner-editor-card">
              <div className="academy-banner-editor-card__top">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="academy-banner-editor-card__number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {banner.title.fa || banner.title.en || "بنر بدون عنوان"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {banner.placement === "academy" ? "آکادمی" : banner.placement === "shop" ? "فروشگاه" : "بالای سایت"}
                    </p>
                  </div>
                  <span className={cn("academy-banner-editor-card__status", banner.enabled ? "is-enabled" : "is-disabled")}>
                    <span aria-hidden="true" />{banner.enabled ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <IconBtn label="حذف بنر" onClick={() => onChange(banners.filter((item) => item.id !== banner.id))}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>

              <div className="academy-banner-editor-card__body">
                <div className="academy-banner-editor-card__fields">
                  <LocalizedField label="عنوان" value={banner.title} onChange={(value) => set(banner.id, { title: value })} />
                  <LocalizedField label="متن" value={banner.text} onChange={(value) => set(banner.id, { text: value })} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="لینک مقصد">
                      <Input dir="ltr" value={banner.href} placeholder="/academy یا https://…" onChange={(event) => set(banner.id, { href: event.target.value })} />
                    </Field>
                    <Field label="محل نمایش">
                      <Select value={banner.placement} onChange={(event) => set(banner.id, { placement: event.target.value as Banner["placement"] })}>
                        <option value="top">بالای سایت</option>
                        <option value="shop">فروشگاه</option>
                        <option value="academy">آکادمی</option>
                      </Select>
                    </Field>
                  </div>
                  <Field label="اتصال بنر به ورکشاپ یا وبینار (اختیاری)">
                    <Select value={banner.eventSlug ?? ""} onChange={(event) => {
                      const eventSlug = event.target.value || undefined;
                      const previousHref = banner.eventSlug ? `/academy/${banner.eventSlug}` : "";
                      const followsEvent = !banner.href || banner.href === "/academy" || banner.href === previousHref;
                      set(banner.id, {
                        eventSlug,
                        showJoinButton: Boolean(eventSlug),
                        ...(eventSlug ? { joinLabel: banner.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" } } : {}),
                        ...(followsEvent ? { href: eventSlug ? `/academy/${eventSlug}` : "/academy" } : {}),
                      });
                    }}>
                      <option value="">بدون اتصال به رویداد</option>
                      {events.map((event) => <option key={event.id} value={event.slug}>{event.type === "webinar" ? "وبینار · " : "ورکشاپ · "}{event.title.fa || event.title.en}</option>)}
                    </Select>
                  </Field>
                  {banner.eventSlug && (
                    <div className="space-y-3 rounded-xl border border-[#e4e9e5] bg-[#f8faf8] p-3">
                      <label className="academy-banner-editor-card__toggle">
                        <input type="checkbox" checked={banner.showJoinButton ?? true} onChange={(event) => set(banner.id, { showJoinButton: event.target.checked })} />
                        <span className="academy-banner-editor-card__switch" aria-hidden="true" />
                        <span>نمایش دکمهٔ جداگانهٔ ورود به اتاق پخش</span>
                      </label>
                      {(banner.showJoinButton ?? true) && <LocalizedField label="متن دکمهٔ ورود" value={banner.joinLabel ?? { fa: "ورود به اتاق پخش", en: "Join live room" }} onChange={(joinLabel) => set(banner.id, { joinLabel })} />}
                    </div>
                  )}
                  <label className="academy-banner-editor-card__toggle">
                    <input type="checkbox" checked={banner.enabled} onChange={(event) => set(banner.id, { enabled: event.target.checked })} />
                    <span className="academy-banner-editor-card__switch" aria-hidden="true" />
                    <span>نمایش این بنر در سایت</span>
                  </label>
                </div>

                <div className="academy-banner-preview">
                  <div className="academy-banner-preview__label"><Eye className="h-3.5 w-3.5" /> پیش‌نمایش</div>
                  <div className="academy-banner-preview__surface" dir="rtl">
                    <span className="academy-banner-preview__sparkle"><Sparkles className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{banner.title.fa || "عنوان بنر"}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5">{banner.text.fa || "متن کوتاه بنر در این بخش نمایش داده می‌شود."}</p>
                    </div>
                    {banner.href && <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    {banner.eventSlug && (banner.showJoinButton ?? true) && <span className="shrink-0 rounded-full bg-[#203a30] px-2 py-1 text-[10px] font-semibold text-white">{banner.joinLabel?.fa || "ورود به اتاق پخش"}</span>}
                  </div>
                  <p className="academy-banner-preview__note">نمایش در جایگاه {banner.placement === "academy" ? "آکادمی" : banner.placement === "shop" ? "فروشگاه" : "بالای سایت"}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ============================================================
   ویرایشگر SEO
   ============================================================ */
function SeoEditor({
  seo,
  onChange,
}: {
  seo: SeoMeta[];
  onChange: (s: SeoMeta[]) => void;
}) {
  const entries = mergeSeoEntries(seo);
  const set = (path: string, patch: Partial<SeoMeta>) =>
    onChange(entries.map((entry) => (entry.path === path ? { ...entry, ...patch } : entry)));
  const reset = (path: string) => {
    const defaults = SEO_ROUTE_DEFAULTS.find((route) => route.path === path);
    if (defaults) set(path, { title: defaults.title, description: defaults.description });
  };

  return (
    <Card
      title="متادیتای SEO"
      desc="عنوان و توضیح دوزبانهٔ صفحه‌های عمومی فهرست‌شده؛ URLهای جزئیات از محتوای همان رکورد استفاده می‌کنند و مسیرهای خصوصی عمداً در این فهرست نیستند."
    >
      <ul className="space-y-4">
        {entries.map((entry) => {
          const route = SEO_ROUTE_DEFAULTS.find((candidate) => candidate.path === entry.path);
          return (
            <li key={entry.path} className="rounded-lg border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted" />
                <strong className="text-xs text-foreground">{route?.label ?? "مسیر ذخیره‌شدهٔ قدیمی"}</strong>
                <code className="font-mono text-xs text-muted">{entry.path}</code>
                {route && (
                  <button type="button" onClick={() => reset(entry.path)} className="ms-auto text-[11px] text-accent hover:underline">
                    بازگردانی پیش‌فرض
                  </button>
                )}
              </div>
              {route ? (
                <>
                  <LocalizedField
                    label="عنوان"
                    value={entry.title}
                    onChange={(value) => set(entry.path, { title: value })}
                  />
                  <LocalizedField
                    label="توضیحات"
                    value={entry.description}
                    onChange={(value) => set(entry.path, { description: value })}
                    textarea
                  />
                </>
              ) : (
                <p className="text-xs leading-5 text-muted">این مسیر به ویرایشگر SEO فعلی وصل نیست؛ مقدار ذخیره‌شده حفظ می‌شود، اما قابل ویرایش نیست.</p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ============================================================
   کامپوننت‌های پایه
   ============================================================ */
function Card({
  title,
  desc,
  action,
  children,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white shadow-soft">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}

function LocalizedField({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: Localized;
  onChange: (v: Localized) => void;
  textarea?: boolean;
}) {
  const C = textarea ? Textarea : Input;
  return (
    <div className="mb-3 grid gap-3 sm:grid-cols-2">
      <Field label={`${label} (فارسی)`}>
        <C
          dir="rtl"
          value={value.fa}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            onChange({ ...value, fa: e.target.value })
          }
        />
      </Field>
      <Field label={`${label} (انگلیسی)`}>
        <C
          dir="ltr"
          value={value.en}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            onChange({ ...value, en: e.target.value })
          }
        />
      </Field>
    </div>
  );
}
