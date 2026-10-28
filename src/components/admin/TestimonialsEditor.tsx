"use client";

import { Plus, Quote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { EducationItem, Testimonial } from "@/lib/types";

/**
 * Student-quote manager.
 *
 * Quotes are the only proof block on the academy pages, so they are never
 * invented in code: this editor is the single place they enter the site, and the
 * public section renders nothing while the list is empty.
 */
export function TestimonialsEditor({
  testimonials,
  education,
  onChange,
}: {
  testimonials: Testimonial[];
  education: EducationItem[];
  onChange: (next: Testimonial[]) => void;
}) {
  const update = (index: number, patch: Partial<Testimonial>) => {
    onChange(testimonials.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const add = () => {
    onChange([
      ...testimonials,
      {
        id: `testimonial-${Date.now().toString(36)}`,
        name: "",
        quote: { fa: "", en: "" },
        rating: 5,
        featured: true,
      },
    ]);
  };

  const remove = (index: number) => onChange(testimonials.filter((_, i) => i !== index));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= testimonials.length) return;
    const next = [...testimonials];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Quote className="h-4 w-4 text-accent" />
            نقل‌قول هنرجویان
          </h3>
          <p className="mt-1 text-xs text-muted">
            تا وقتی حداقل یک نقل‌قول واقعی ثبت نشود، این بخش در سایت نمایش داده نمی‌شود.
          </p>
        </div>
        <Button onClick={add} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          افزودن نقل‌قول
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-12 text-center text-sm text-muted">
          هنوز نقل‌قولی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-border bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="نام">
                  <Input value={item.name} onChange={(event) => update(index, { name: event.target.value })} />
                </Field>
                <Field label="دورهٔ مرتبط (اختیاری)">
                  <Select
                    value={item.educationSlug ?? ""}
                    onChange={(event) => update(index, { educationSlug: event.target.value || undefined })}
                  >
                    <option value="">— عمومی —</option>
                    {education.map((course) => (
                      <option key={course.id} value={course.slug}>
                        {course.title.fa || course.slug}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="عنوان دوره در متن (اختیاری)">
                  <Input
                    value={item.course?.fa ?? ""}
                    onChange={(event) => update(index, { course: { fa: event.target.value, en: event.target.value } })}
                  />
                </Field>
                <Field label="امتیاز (۱ تا ۵)">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={item.rating ?? 5}
                    onChange={(event) => update(index, { rating: Number(event.target.value) })}
                  />
                </Field>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="متن (فارسی)">
                  <Textarea
                    rows={3}
                    dir="rtl"
                    value={item.quote.fa}
                    onChange={(event) => update(index, { quote: { fa: event.target.value, en: item.quote.en } })}
                  />
                </Field>
                <Field label="متن (English)">
                  <Textarea
                    rows={3}
                    dir="ltr"
                    value={item.quote.en}
                    onChange={(event) => update(index, { quote: { fa: item.quote.fa, en: event.target.value } })}
                  />
                </Field>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground-secondary">
                  <input
                    type="checkbox"
                    checked={item.featured !== false}
                    onChange={(event) => update(index, { featured: event.target.checked })}
                    className="accent-accent"
                  />
                  نمایش در بخش عمومی
                </label>
                <div className="mr-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-background-secondary"
                  >
                    بالا
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-background-secondary"
                  >
                    پایین
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
