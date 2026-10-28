/**
 * Page-level settings for the two public pages.
 *
 * Everything here has a default that matches the shipped design, so a document
 * saved before this existed renders exactly as it always did. The admin panel's
 * «مدیریت صفحه‌ها» section is the only writer.
 */

export type PageKey = "portfolio" | "academy";

export interface PageHeroSlide {
  id: string;
  /** Same-origin path or uploaded media URL. */
  src: string;
  captionFa?: string;
  captionEn?: string;
}

export interface PageHeroSettings {
  /** Cinematic sequence; an empty list falls back to the static photograph. */
  slides: PageHeroSlide[];
  /** Auto-advance in milliseconds. 0 keeps the first frame still. */
  intervalMs: number;
  /** Legibility scrim strength, 0–100. Lower = brighter photograph. */
  scrim: number;
  /** Optional overrides — empty means "use the built-in copy". */
  eyebrowFa?: string;
  eyebrowEn?: string;
  titleFa?: string;
  titleEn?: string;
  subtitleFa?: string;
  subtitleEn?: string;
}

export interface PageSectionSetting {
  id: string;
  visible: boolean;
}

export interface PageSettings {
  hero: PageHeroSettings;
  /** Ordered list; any known section missing from it renders at its default slot. */
  sections: PageSectionSetting[];
}

export type PagesSettings = Record<PageKey, PageSettings>;

export const PORTFOLIO_SECTIONS = [
  { id: "intro", labelFa: "معرفی آتلیه و مدرس", labelEn: "Studio introduction" },
  { id: "works", labelFa: "آثار و پروژه‌ها", labelEn: "Works & projects" },
  { id: "trust", labelFa: "نوار اعتماد (کارفرما و حوزه)", labelEn: "Clients & disciplines strip" },
  { id: "academy", labelFa: "پل آکادمی", labelEn: "Academy bridge" },
  { id: "collaboration", labelFa: "همکاری با آتلیه", labelEn: "Collaboration" },
] as const;

export const ACADEMY_SECTIONS = [
  { id: "categories", labelFa: "نوار دسته‌بندی‌ها", labelEn: "Category strip" },
  { id: "trust", labelFa: "نوار تضمین‌ها", labelEn: "Guarantee strip" },
  { id: "catalogue", labelFa: "فهرست دوره‌ها", labelEn: "Course catalogue" },
  { id: "learn", labelFa: "چه یاد می‌گیرید", labelEn: "What you learn" },
  { id: "curriculum", labelFa: "برنامهٔ درسی دورهٔ شاخص", labelEn: "Featured curriculum" },
  { id: "videos", labelFa: "ویدیوهای درس", labelEn: "Lesson videos" },
  { id: "portfolio", labelFa: "پل پورتفولیو", labelEn: "Portfolio bridge" },
  { id: "testimonials", labelFa: "نقل‌قول هنرجویان", labelEn: "Student quotes" },
  { id: "process", labelFa: "مسیر یادگیری", labelEn: "Learning path" },
] as const;

export const SECTION_LABELS: Record<PageKey, readonly { id: string; labelFa: string; labelEn: string }[]> = {
  portfolio: PORTFOLIO_SECTIONS,
  academy: ACADEMY_SECTIONS,
};

/** The shipped defaults — identical to what the pages render today. */
export const DEFAULT_PAGES: PagesSettings = {
  portfolio: {
    hero: {
      slides: [
        { id: "pf-1", src: "/images/portfolios/hero-01.jpg", captionFa: "مجموعهٔ مسکونی", captionEn: "Residential" },
        { id: "pf-2", src: "/images/portfolios/pf-bedroom.jpg", captionFa: "کاغذدیواری سفارشی", captionEn: "Bespoke wallpaper" },
        { id: "pf-3", src: "/images/portfolios/hero-02.jpg", captionFa: "پارچه و پرده", captionEn: "Textile & drapery" },
        { id: "pf-4", src: "/images/portfolios/hero-03.jpg", captionFa: "میز طراحی", captionEn: "The drawing table" },
      ],
      intervalMs: 7000,
      scrim: 60,
      eyebrowFa: "",
      eyebrowEn: "",
      titleFa: "",
      titleEn: "",
      subtitleFa: "",
      subtitleEn: "",
    },
    sections: PORTFOLIO_SECTIONS.map((section) => ({ id: section.id, visible: true })),
  },
  academy: {
    hero: {
      slides: [
        { id: "ac-1", src: "/images/education/e04.jpg", captionFa: "نقش و تزئین", captionEn: "Ornament" },
        { id: "ac-2", src: "/images/portfolios/razieh-textile-process.jpg", captionFa: "کارگاه ساخت", captionEn: "In the making" },
        { id: "ac-3", src: "/images/education/e02.jpg", captionFa: "مطالعهٔ تکرار", captionEn: "Repeat study" },
        { id: "ac-4", src: "/images/hero/hero-preview-02.jpg", captionFa: "رنگ‌بندی نهایی", captionEn: "Colourway" },
      ],
      intervalMs: 7500,
      scrim: 60,
      eyebrowFa: "",
      eyebrowEn: "",
      titleFa: "",
      titleEn: "",
      subtitleFa: "",
      subtitleEn: "",
    },
    sections: ACADEMY_SECTIONS.map((section) => ({ id: section.id, visible: true })),
  },
};

function clampScrim(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 60;
  return Math.min(90, Math.max(10, Math.round(value)));
}

function clampInterval(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(20000, Math.max(0, Math.round(value)));
}

function normalizeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeSlides(slides: unknown, fallback: PageHeroSlide[]): PageHeroSlide[] {
  if (!Array.isArray(slides)) return fallback;
  const seen = new Set<string>();
  const normalized: PageHeroSlide[] = [];
  slides.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const slide = raw as Partial<PageHeroSlide>;
    const src = typeof slide.src === "string" ? slide.src.trim() : "";
    if (!src) return;
    let id = typeof slide.id === "string" && slide.id.trim() ? slide.id.trim() : `slide-${index + 1}`;
    if (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    normalized.push({
      id,
      src,
      ...(normalizeText(slide.captionFa) ? { captionFa: normalizeText(slide.captionFa) } : {}),
      ...(normalizeText(slide.captionEn) ? { captionEn: normalizeText(slide.captionEn) } : {}),
    });
  });
  /* An explicitly emptied list means "static photograph", and is respected. */
  return Array.isArray(slides) ? normalized : fallback;
}

function normalizeSections(
  sections: unknown,
  vocabulary: readonly { id: string }[],
  fallback: PageSectionSetting[],
): PageSectionSetting[] {
  const known = new Set(vocabulary.map((section) => section.id));
  const seen = new Set<string>();
  const ordered: PageSectionSetting[] = [];
  if (Array.isArray(sections)) {
    for (const raw of sections) {
      if (!raw || typeof raw !== "object") continue;
      const entry = raw as Partial<PageSectionSetting>;
      const id = typeof entry.id === "string" ? entry.id : "";
      if (!known.has(id) || seen.has(id)) continue;
      seen.add(id);
      ordered.push({ id, visible: entry.visible !== false });
    }
  }
  /* Sections added after the document was saved keep their default slot. */
  for (const fallbackSection of fallback) {
    if (!seen.has(fallbackSection.id)) ordered.push({ ...fallbackSection });
  }
  return ordered;
}

function normalizePage(page: unknown, defaults: PageSettings, vocabulary: readonly { id: string }[]): PageSettings {
  const raw = (page && typeof page === "object" ? page : {}) as Partial<PageSettings>;
  const hero = (raw.hero && typeof raw.hero === "object" ? raw.hero : {}) as Partial<PageHeroSettings>;
  return {
    hero: {
      slides: normalizeSlides(hero.slides, defaults.hero.slides),
      intervalMs: clampInterval(hero.intervalMs, defaults.hero.intervalMs),
      scrim: clampScrim(hero.scrim),
      eyebrowFa: normalizeText(hero.eyebrowFa),
      eyebrowEn: normalizeText(hero.eyebrowEn),
      titleFa: normalizeText(hero.titleFa),
      titleEn: normalizeText(hero.titleEn),
      subtitleFa: normalizeText(hero.subtitleFa),
      subtitleEn: normalizeText(hero.subtitleEn),
    },
    sections: normalizeSections(raw.sections, vocabulary, defaults.sections),
  };
}

/** Always returns a complete, ordered settings object. Never throws. */
export function resolvePages(pages?: Partial<PagesSettings> | null): PagesSettings {
  const source = (pages ?? {}) as Partial<PagesSettings>;
  return {
    portfolio: normalizePage(source.portfolio, DEFAULT_PAGES.portfolio, PORTFOLIO_SECTIONS),
    academy: normalizePage(source.academy, DEFAULT_PAGES.academy, ACADEMY_SECTIONS),
  };
}

/** Visibility map for a page's sections, in render order. */
export function sectionState(pages: PagesSettings, page: PageKey): { id: string; visible: boolean }[] {
  return pages[page].sections;
}

export function isSectionVisible(pages: PagesSettings, page: PageKey, id: string): boolean {
  return pages[page].sections.find((section) => section.id === id)?.visible !== false;
}

/** Slides for the backdrop, localized captions, ready for `<CinematicBackdrop>`. */
export function heroSlides(pages: PagesSettings, page: PageKey, locale: "fa" | "en") {
  return pages[page].hero.slides.map((slide) => ({
    src: slide.src,
    caption: (locale === "fa" ? slide.captionFa : slide.captionEn) ?? slide.captionFa ?? slide.captionEn,
  }));
}
