"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { MediaUploadControl } from "@/components/admin/MediaUploadControl";
import type { PageHeroSettings, PageHeroSlide } from "@/lib/page-settings";
import { cn } from "@/lib/utils";

const INTERVAL_OPTIONS = [
  { value: 0, label: "بدون چرخش (تصویر ثابت)" },
  { value: 5000, label: "۵ ثانیه" },
  { value: 7000, label: "۷ ثانیه" },
  { value: 9000, label: "۹ ثانیه" },
  { value: 12000, label: "۱۲ ثانیه" },
];

/** Library images, fetched once per panel session. */
export function useMediaLibrary(enabled: boolean) {
  const [files, setFiles] = useState<{ path: string; name: string; folder: string }[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || files || failed) return;
    let active = true;
    fetch("/api/admin/media-library", { credentials: "same-origin", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("unavailable"))))
      .then((payload: { files?: { path: string; name: string; folder: string }[] }) => {
        if (active) setFiles(payload.files ?? []);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [enabled, failed, files]);

  return { files, failed };
}

/** Image picker dialog: shipped library + upload. */
export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (path: string) => void;
}) {
  const { files, failed } = useMediaLibrary(open);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!files) return [];
    const q = query.trim().toLowerCase();
    return q ? files.filter((file) => file.path.toLowerCase().includes(q)) : files;
  }, [files, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ImageIcon className="h-4 w-4 text-accent" />
            انتخاب تصویر
          </h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:bg-background-secondary" aria-label="بستن">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جستجو در کتابخانهٔ تصاویر…"
              className="w-full rounded-lg border border-border bg-white py-2 pr-8 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              dir="rtl"
            />
          </div>
          <MediaUploadControl
            mediaType="image"
            onUploaded={(url) => {
              onPick(url);
              onClose();
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {failed && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              فهرست کتابخانه دریافت نشد؛ می‌توانید مسیر تصویر را دستی وارد کنید یا فایل را آپلود کنید.
            </p>
          )}
          {!files && !failed && (
            <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> در حال بارگذاری…
            </p>
          )}
          {files && filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">تصویری پیدا نشد.</p>
          )}
          {filtered.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {filtered.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => {
                    onPick(file.path);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-lg border border-border text-right transition-colors hover:border-accent"
                  title={file.path}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.path} alt={file.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <span className="block truncate px-2 py-1 text-[10px] text-muted group-hover:text-accent">{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Cinematic hero control: the slide sequence, its pace, its scrim, and the copy
 * overrides. Every change is previewed live on the right before it is saved.
 */
export function PageHeroManager({
  hero,
  onChange,
  page,
}: {
  hero: PageHeroSettings;
  onChange: (next: PageHeroSettings) => void;
  page: "portfolio" | "academy";
}) {
  const [picking, setPicking] = useState<number | null>(null);
  const [preview, setPreview] = useState(0);
  const [advanced, setAdvanced] = useState(false);

  const patch = (value: Partial<PageHeroSettings>) => onChange({ ...hero, ...value });

  const updateSlide = (index: number, value: Partial<PageHeroSlide>) => {
    patch({ slides: hero.slides.map((slide, i) => (i === index ? { ...slide, ...value } : slide)) });
  };

  const removeSlide = (index: number) => {
    patch({ slides: hero.slides.filter((_, i) => i !== index) });
    setPreview(0);
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= hero.slides.length) return;
    const next = [...hero.slides];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ slides: next });
  };

  const addSlide = (src = "") => {
    patch({
      slides: [
        ...hero.slides,
        { id: `slide-${Date.now().toString(36)}`, src, captionFa: "", captionEn: "" },
      ],
    });
  };

  const active = hero.slides[Math.min(preview, Math.max(0, hero.slides.length - 1))];
  const scrimAlpha = (Math.min(90, Math.max(0, hero.scrim)) / 100).toFixed(2);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {/* Sequence */}
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">توالی سینمایی هیرو</h3>
              <p className="mt-1 text-xs text-muted">
                {hero.slides.length} فریم — با کراس‌فید و حرکت آهسته نمایش داده می‌شوند. اگر خالی باشد، تصویر ثابت قبلی استفاده می‌شود.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPicking(-1)} className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" /> افزودن از کتابخانه
              </Button>
              <Button onClick={() => addSlide()} className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> فریم خالی
              </Button>
            </div>
          </div>

          {hero.slides.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted">
              هیچ فریمی ثبت نشده — هیرو با تصویر ثابت پیش‌فرض نمایش داده می‌شود.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {hero.slides.map((slide, index) => (
                <li
                  key={slide.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-lg border p-2 transition-colors",
                    index === preview ? "border-accent/60 bg-accent/[0.04]" : "border-border",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setPreview(index)}
                    className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-background-secondary"
                    aria-label={`پیش‌نمایش فریم ${index + 1}`}
                  >
                    {slide.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <ImageIcon className="mx-auto h-5 w-5 text-muted" />
                    )}
                    <span className="absolute bottom-0 left-0 bg-black/60 px-1 text-[9px] tabular text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <Input
                      value={slide.src}
                      onChange={(event) => updateSlide(index, { src: event.target.value })}
                      placeholder="/images/…"
                      dir="ltr"
                      className="text-xs"
                    />
                    <div className="mt-1.5 flex gap-1.5">
                      <Input
                        value={slide.captionFa ?? ""}
                        onChange={(event) => updateSlide(index, { captionFa: event.target.value })}
                        placeholder="عنوان فارسی"
                        className="text-xs"
                      />
                      <Input
                        value={slide.captionEn ?? ""}
                        onChange={(event) => updateSlide(index, { captionEn: event.target.value })}
                        placeholder="English caption"
                        dir="ltr"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPicking(index)}
                      className="rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-accent"
                    >
                      انتخاب
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(index, -1)}
                      disabled={index === 0}
                      className="rounded-md border border-border p-1 text-muted hover:bg-background-secondary disabled:opacity-30"
                      aria-label="بالا"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 1)}
                      disabled={index === hero.slides.length - 1}
                      className="rounded-md border border-border p-1 text-muted hover:bg-background-secondary disabled:opacity-30"
                      aria-label="پایین"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="rounded-md border border-red-200 p-1 text-red-600 hover:bg-red-50"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pace + scrim */}
        <div className="grid gap-4 rounded-xl border border-border bg-white p-4 sm:grid-cols-2">
          <Field label="سرعت چرخش">
            <Select value={hero.intervalMs} onChange={(event) => patch({ intervalMs: Number(event.target.value) })}>
              {INTERVAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </Field>
          <Field label={`شدت پوشش تیرگی — ${hero.scrim}٪`}>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={hero.scrim}
              onChange={(event) => patch({ scrim: Number(event.target.value) })}
              className="mt-2 w-full accent-accent"
            />
            <p className="mt-1 text-[11px] text-muted">کمتر = عکس روشن‌تر؛ بیشتر = متن خواناتر.</p>
          </Field>
        </div>

        {/* Copy overrides */}
        <div className="rounded-xl border border-border bg-white p-4">
          <button
            type="button"
            onClick={() => setAdvanced((value) => !value)}
            className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
          >
            متن هیرو (اختیاری)
            <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", advanced && "rotate-180")} />
          </button>
          {advanced && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="برچسب بالا (فارسی)">
                <Input value={hero.eyebrowFa ?? ""} onChange={(event) => patch({ eyebrowFa: event.target.value })} placeholder="مقدار پیش‌فرض" />
              </Field>
              <Field label="برچسب بالا (English)">
                <Input dir="ltr" value={hero.eyebrowEn ?? ""} onChange={(event) => patch({ eyebrowEn: event.target.value })} placeholder="Default" />
              </Field>
              <Field label="تیتر (فارسی)">
                <Input value={hero.titleFa ?? ""} onChange={(event) => patch({ titleFa: event.target.value })} placeholder="مقدار پیش‌فرض" />
              </Field>
              <Field label="تیتر (English)">
                <Input dir="ltr" value={hero.titleEn ?? ""} onChange={(event) => patch({ titleEn: event.target.value })} placeholder="Default" />
              </Field>
              <Field label="زیرتیتر (فارسی)">
                <Input value={hero.subtitleFa ?? ""} onChange={(event) => patch({ subtitleFa: event.target.value })} placeholder="مقدار پیش‌فرض" />
              </Field>
              <Field label="زیرتیتر (English)">
                <Input dir="ltr" value={hero.subtitleEn ?? ""} onChange={(event) => patch({ subtitleEn: event.target.value })} placeholder="Default" />
              </Field>
              <p className="text-[11px] text-muted sm:col-span-2">
                فیلدهای خالی یعنی متن فعلی صفحه دست‌نخورده بماند.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-border bg-[#0d1512]">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]">
            {active?.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-xs text-white/40">بدون فریم</div>
            )}
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(13,21,18,${scrimAlpha})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1512] via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-[9px] tracking-[0.2em] text-[#e4cba4]" dir="ltr">
                {page === "portfolio" ? "PORTFOLIO" : "ACADEMY"}
              </p>
              <p className="mt-1 text-sm font-semibold">
                {hero.titleFa || (page === "portfolio" ? "تیتر هیرو" : "آکادمی آتلیه رزی")}
              </p>
              <p className="mt-1 text-[10px] text-white/60">
                {hero.subtitleFa || "متن توضیح هیرو"}
              </p>
              <div className="mt-3 flex gap-1">
                {hero.slides.map((slide, index) => (
                  <span
                    key={slide.id}
                    className={cn("h-px", index === preview ? "w-8 bg-[#e4cba4]" : "w-4 bg-white/30")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          پیش‌نمایش تقریبی — تغییرات بعد از «ذخیره» روی سایت اعمال می‌شود.
        </p>
      </div>

      <MediaPicker
        open={picking !== null}
        onClose={() => setPicking(null)}
        onPick={(src) => {
          if (picking === -1) addSlide(src);
          else if (picking !== null) updateSlide(picking, { src });
          setPicking(null);
        }}
      />
    </div>
  );
}
