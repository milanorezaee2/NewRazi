import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync("src/lib/page-settings.ts", "utf8");
const exports = {};
new Function(
  "exports",
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
)(exports);

const {
  DEFAULT_PAGES,
  ACADEMY_SECTIONS,
  PORTFOLIO_SECTIONS,
  resolvePages,
  heroSlides,
  isSectionVisible,
} = exports;

const read = (file) => fs.readFileSync(file, "utf8");

test("an empty document resolves to the shipped defaults", () => {
  const pages = resolvePages(undefined);
  assert.deepEqual(pages.portfolio.hero.slides, DEFAULT_PAGES.portfolio.hero.slides);
  assert.equal(pages.portfolio.hero.intervalMs, 7000);
  assert.equal(pages.academy.hero.intervalMs, 7500);
  assert.equal(pages.portfolio.sections.length, PORTFOLIO_SECTIONS.length);
  assert.equal(pages.academy.sections.length, ACADEMY_SECTIONS.length);
  assert.ok(pages.portfolio.sections.every((section) => section.visible));
});

test("a partial document only overrides what it names", () => {
  const pages = resolvePages({
    portfolio: {
      hero: { slides: [{ id: "x", src: "/images/a.jpg" }], intervalMs: 0, scrim: 30 },
      sections: [{ id: "works", visible: false }],
    },
  });
  assert.equal(pages.portfolio.hero.slides.length, 1);
  assert.equal(pages.portfolio.hero.intervalMs, 0);
  assert.equal(pages.portfolio.hero.scrim, 30);
  assert.equal(isSectionVisible(pages, "portfolio", "works"), false);
  /* Sections missing from the stored list keep their default slot, visible. */
  assert.equal(isSectionVisible(pages, "portfolio", "intro"), true);
  assert.equal(pages.portfolio.sections.length, PORTFOLIO_SECTIONS.length);
  /* The other page is untouched. */
  assert.equal(pages.academy.hero.intervalMs, 7500);
});

test("slide ids stay unique and empty sources are dropped", () => {
  const pages = resolvePages({
    academy: {
      hero: {
        slides: [
          { id: "same", src: "/images/a.jpg" },
          { id: "same", src: "/images/b.jpg" },
          { id: "", src: "   " },
        ],
      },
    },
  });
  const ids = pages.academy.hero.slides.map((slide) => slide.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(pages.academy.hero.slides.length, 2);
});

test("scrim and interval are clamped to sane values", () => {
  const pages = resolvePages({
    portfolio: { hero: { scrim: 500, intervalMs: 999999, slides: [] } },
  });
  assert.equal(pages.portfolio.hero.scrim, 90);
  assert.equal(pages.portfolio.hero.intervalMs, 20000);

  const low = resolvePages({ portfolio: { hero: { scrim: -20, intervalMs: -5, slides: [] } } });
  assert.equal(low.portfolio.hero.scrim, 10);
  assert.equal(low.portfolio.hero.intervalMs, 0);
});

test("an explicitly emptied sequence is respected (static hero)", () => {
  const pages = resolvePages({ portfolio: { hero: { slides: [] } } });
  assert.deepEqual(pages.portfolio.hero.slides, []);
});

test("unknown or duplicated section ids are dropped, order is kept", () => {
  const pages = resolvePages({
    academy: {
      sections: [
        { id: "process", visible: true },
        { id: "nope", visible: true },
        { id: "process", visible: false },
        { id: "catalogue", visible: false },
      ],
    },
  });
  const ids = pages.academy.sections.map((section) => section.id);
  assert.equal(ids[0], "process");
  assert.equal(ids[1], "catalogue");
  assert.equal(ids.filter((id) => id === "process").length, 1);
  assert.equal(ids.includes("nope"), false);
  assert.equal(pages.academy.sections.length, ACADEMY_SECTIONS.length);
});

test("hero slides localize their captions", () => {
  const pages = resolvePages(undefined);
  const fa = heroSlides(pages, "portfolio", "fa");
  const en = heroSlides(pages, "portfolio", "en");
  assert.equal(fa[0].src, "/images/portfolios/hero-01.jpg");
  assert.ok(fa[0].caption && en[0].caption);
  assert.notEqual(fa[0].caption, en[0].caption);
});

test("both public pages read the panel settings", () => {
  const portfolio = read("src/app/[locale]/portfolio/page.tsx");
  assert.match(portfolio, /resolvePages\(content\.pages\)/);
  assert.match(portfolio, /heroSlides\(pages, "portfolio", locale\)/);
  assert.match(portfolio, /isSectionVisible\(pages, "portfolio", "trust"\)/);

  const academy = read("src/app/[locale]/academy/page.tsx");
  assert.match(academy, /resolvePages\(site\.pages\)/);
  assert.match(academy, /heroSlides\(pages, "academy", locale\)/);
  assert.match(academy, /isSectionVisible\(pages, "academy", id\)/);
});

test("the admin panel owns both pages and their hero sequences", () => {
  const manager = read("src/components/admin/PagesManager.tsx");
  assert.match(manager, /PAGE_TABS/);
  assert.match(manager, /portfolio/);
  assert.match(manager, /academy/);
  assert.match(manager, /PageHeroManager/);
  assert.match(manager, /moveSection/);
  assert.match(manager, /toggleSection/);

  const app = read("src/components/admin/AdminApp.tsx");
  assert.match(app, /"pages"/);
  assert.match(app, /<PagesManager/);
});

test("the media library endpoint is admin-only and cannot escape public/", () => {
  const route = read("src/app/api/admin/media-library/route.ts");
  assert.match(route, /getAdminSession/);
  assert.match(route, /status: 401/);
  assert.match(route, /process\.cwd\(\), "public"/);
  assert.match(route, /IMAGE_EXTENSIONS/);
});

test("storage normalizes pages so a saved document is always complete", () => {
  const store = read("src/lib/data/store.ts");
  assert.match(store, /pages: resolvePages\(normalized\.pages\)/);
});

test("slide paths are validated at the admin boundary", () => {
  const validation = read("src/lib/admin-content-validation.ts");
  assert.match(validation, /pages\.\$\{pageKey\}\.hero\.slides/);
  assert.match(validation, /same-origin image path/);
});
