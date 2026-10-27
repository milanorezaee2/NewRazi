import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync("src/lib/seo-pages.ts", "utf8");
const exports = {};
new Function(
  "exports",
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
)(exports);

const { SEO_ROUTE_DEFAULTS, createSeoMetadata, mergeSeoEntries, resolveSeoEntry } = exports;

test("SEO editor defaults cover exactly the public routes of the two-page site", () => {
  const sitemap = fs.readFileSync("src/app/sitemap.ts", "utf8");
  const staticMatch = sitemap.match(/const STATIC_PAGES = \[([\s\S]*?)\] as const/);
  assert.ok(staticMatch, "could not find the sitemap's static route list");
  const staticSegments = [...staticMatch[1].matchAll(/["']([^"']*)["']/g)].map((match) => match[1]);
  const configuredPaths = new Set(SEO_ROUTE_DEFAULTS.map((route) => route.path));
  for (const segment of staticSegments) {
    const path = segment.startsWith("/") ? segment : `/${segment}`;
    assert.ok(configuredPaths.has(path), `SEO editor is missing sitemap route ${path}`);
  }
  /* Removed routes must not come back as editable or indexable entries. */
  for (const legacy of ["/shop", "/patterns", "/artists", "/marketplace", "/about", "/contact"]) {
    assert.equal(configuredPaths.has(legacy), false, `${legacy} should no longer be managed`);
  }
});

test("stored SEO values for the remaining routes override the defaults", () => {
  const stored = [
    { path: "/academy", title: { fa: "آکادمی سفارشی", en: "Custom academy" }, description: { fa: "توضیح", en: "Description" } },
    { path: "/shop", title: { fa: "قدیمی", en: "Legacy shop" }, description: { fa: "", en: "" } },
  ];
  const merged = mergeSeoEntries(stored);
  assert.equal(merged.find((entry) => entry.path === "/academy").title.fa, "آکادمی سفارشی");
  assert.equal(merged.find((entry) => entry.path === "/portfolio").title.en, "Portfolio — Rosie Atelier");
  assert.equal(merged.some((entry) => entry.path === "/shop"), false, "removed routes are dropped");
  assert.equal(resolveSeoEntry([], "/academy").title.en, "Academy — Rosie Atelier");
});

test("managed SEO metadata follows locale, emits canonical, Open Graph and Twitter fields", () => {
  const entry = { path: "/portfolio", title: { fa: "پورتفولیوی ویرایش‌شده", en: "Edited portfolio" }, description: { fa: "شرح فارسی", en: "English description" } };
  const metadata = createSeoMetadata([entry], "/portfolio", "fa", "Fallback title");
  assert.deepEqual(metadata.title, { absolute: "پورتفولیوی ویرایش‌شده" });
  assert.equal(metadata.description, "شرح فارسی");
  assert.equal(metadata.alternates.canonical, "/fa/portfolio");
  assert.equal(metadata.openGraph.title, "پورتفولیوی ویرایش‌شده");
  assert.equal(metadata.twitter.title, "پورتفولیوی ویرایش‌شده");
});

test("the two public pages and their detail routes use managed metadata and canonicals", () => {
  for (const [path, file] of [
    ["/academy", "src/app/[locale]/academy/page.tsx"],
    ["/portfolio", "src/app/[locale]/portfolio/page.tsx"],
  ]) {
    const page = fs.readFileSync(file, "utf8");
    assert.ok(
      page.includes(`getEditableRouteMetadata("${path}"`) || page.includes(`getEditableRouteMetadata(\n    "${path}"`),
      `${file} does not use managed SEO for ${path}`,
    );
  }

  for (const [file, route] of [
    ["src/app/[locale]/academy/[slug]/page.tsx", "/academy/${slug}"],
    ["src/app/[locale]/portfolio/[slug]/page.tsx", "/portfolio/${slug}"],
  ]) {
    assert.ok(fs.readFileSync(file, "utf8").includes(`canonical: \`/\${locale}${route}\``), `${file} needs a route-specific canonical`);
  }
});
