import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const read = (file) => fs.readFileSync(file, "utf8");
const exists = (file) => fs.existsSync(file);

/* The OG URL builder is dependency-free, so it can be executed directly. */
const ogSource = read("src/lib/seo/og-url.ts");
const ogExports = {};
new Function(
  "exports",
  ts.transpileModule(ogSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
)(ogExports);
const { ogImageUrl } = ogExports;

test("the start page is the single extra entry point and offers both real paths", () => {
  assert.ok(exists("src/app/[locale]/start/page.tsx"), "the start page exists");
  const page = read("src/app/[locale]/start/page.tsx");
  assert.match(page, /\/academy"\)\}\?from=start/);
  assert.match(page, /\/portfolio"\)\}\?from=start/);
  assert.match(page, /mailto:/);
  /* Enquiries are attributed, not anonymous. */
  assert.match(page, /from=start/);

  const sitemap = read("src/app/sitemap.ts");
  assert.match(sitemap, /"\/start"/);
});

test("the footer links the two public pages plus the start page", () => {
  const footer = read("src/components/layout/Footer.tsx");
  assert.ok(footer.indexOf('path: "/portfolio"') < footer.indexOf('path: "/academy"'));
  assert.match(footer, /path: "\/start"/);
});

test("per-item OG cards are rendered server-side and stay a same-origin path", () => {
  const route = read("src/app/og/route.ts");
  assert.match(route, /src\.startsWith\("\/"\) && !src\.startsWith\("\/\/"\)/, "absolute URLs are rejected");
  assert.match(route, /renderOgImage/);
  assert.match(route, /Cache-Control/);

  const renderer = read("src/lib/seo/og-image.ts");
  assert.match(renderer, /sharp\(/);
  assert.match(renderer, /1200/);
  assert.match(renderer, /630/);

  /**
   * Latin-only text: librsvg's glyph coverage for Persian is unreliable, so the
   * card never bakes Persian titles into pixels.
   */
  assert.match(renderer, /\[\\u0000-\\u007F\]|\\x20-\\x7E/);
});

test("ogImageUrl encodes every parameter and omits empty ones", () => {
  const url = ogImageUrl({ src: "/images/portfolios/pf-1.jpg", title: "Penthouse Elaheye", eyebrow: "Portfolio" });
  assert.match(url, /^\/og\?/);
  const params = new URLSearchParams(url.slice(url.indexOf("?") + 1));
  assert.equal(params.get("src"), "/images/portfolios/pf-1.jpg");
  assert.equal(params.get("title"), "Penthouse Elaheye");
  assert.equal(params.get("eyebrow"), "Portfolio");

  const bare = ogImageUrl({ title: "Only a title" });
  assert.equal(new URLSearchParams(bare.slice(bare.indexOf("?") + 1)).get("src"), null);
});

test("detail pages declare both languages and their own social card", () => {
  for (const file of ["src/app/[locale]/portfolio/[slug]/page.tsx", "src/app/[locale]/academy/[slug]/page.tsx"]) {
    const page = read(file);
    assert.match(page, /languages: \{ fa: `\/fa\//, `${file} declares hreflang alternates`);
    assert.match(page, /ogImageUrl\(/, `${file} uses a per-item OG card`);
  }
});

test("structured data covers the work, the course, the event and the person", () => {
  assert.match(read("src/app/[locale]/portfolio/[slug]/page.tsx"), /"@type": "CreativeWork"/);
  assert.match(read("src/app/[locale]/academy/[slug]/page.tsx"), /"@type": "Course"/);
  assert.match(read("src/app/[locale]/academy/[slug]/page.tsx"), /"@type": "Event"/);
  assert.match(read("src/app/[locale]/start/page.tsx"), /"@type": "Person"/);
  assert.match(read("src/components/ui/Breadcrumb.tsx"), /BreadcrumbList/);
});

test("portfolio listing filters by discipline through the URL", () => {
  const page = read("src/app/[locale]/portfolio/page.tsx");
  assert.match(page, /searchParams/);
  assert.match(page, /initialDiscipline/);

  const grid = read("src/components/portfolio/PortfolioGrid.tsx");
  assert.match(grid, /params\.set\("discipline"/);
  assert.match(grid, /router\.replace/);
});

test("case studies and trust facts are rendered from content, not hard-coded", () => {
  const caseStudy = read("src/components/portfolio/CaseStudySection.tsx");
  assert.match(caseStudy, /study\.problem/);
  assert.match(caseStudy, /outcomeMetrics/);
  assert.match(caseStudy, /tools/);

  const trust = read("src/components/portfolio/TrustBar.tsx");
  assert.doesNotMatch(trust, /"۱۲\+"|"120\+"/, "no invented headline numbers");
});

test("student quotes stay hidden until an admin adds real ones", () => {
  const component = read("src/components/academy/Testimonials.tsx");
  assert.match(component, /if \(!all\.length\) return null;/);
  const editor = read("src/components/admin/TestimonialsEditor.tsx");
  assert.match(editor, /update\(\{ testimonials \}\)|onChange\(/);
  assert.match(read("src/components/admin/AcademyManager.tsx"), /TestimonialsEditor/);
});

test("enrolment captures the entry point for attribution", () => {
  const route = read("src/app/api/academy/enroll/route.ts");
  assert.match(route, /ATTRIBUTION_SOURCES/);
  assert.match(route, /source,/);

  const form = read("src/components/academy/EnrollForm.tsx");
  assert.match(form, /new URLSearchParams\(window\.location\.search\)\.get\("from"\)/);

  const reservations = read("src/lib/data/reservations.ts");
  assert.match(reservations, /source\?: string/);
});

test("both editors can schedule a publish time", () => {
  for (const file of ["src/components/admin/PortfoliosManager.tsx", "src/components/admin/AcademyManager.tsx"]) {
    const editor = read(file);
    assert.match(editor, /type="datetime-local"/, `${file} exposes a schedule input`);
    assert.match(editor, /publishAt/, `${file} writes publishAt`);
  }
});

test("cross-links carry the attribution parameter both ways", () => {
  assert.match(read("src/app/[locale]/portfolio/page.tsx"), /from=portfolio/);
  assert.match(read("src/app/[locale]/academy/page.tsx"), /from=academy/);
  assert.match(read("src/app/[locale]/portfolio/[slug]/page.tsx"), /from=portfolio/);
  assert.match(read("src/app/[locale]/academy/[slug]/page.tsx"), /from=academy/);
});

test("the sticky call to action is dismissible and does not cover a viewed section", () => {
  const cta = read("src/components/ui/StickyCta.tsx");
  assert.match(cta, /sessionStorage/);
  assert.match(cta, /watchId/);
  assert.match(cta, /revealAfter/);
});
