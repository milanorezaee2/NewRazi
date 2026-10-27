import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("the portfolio is the front door of the site", () => {
  const localePage = read("src/app/[locale]/page.tsx");
  assert.match(localePage, /redirect\(`\/\$\{locale\}\/portfolio`\)/);

  const rootPage = read("src/app/page.tsx");
  assert.match(rootPage, /redirect\("\/fa\/portfolio"\)/);

  /* Middleware turns a bare locale root into a real HTTP redirect. */
  const middleware = read("src/middleware.ts");
  assert.match(middleware, /\/portfolio\`/);
  assert.match(middleware, /NextResponse\.redirect\(url, 308\)/);
});

test("navigation and the wordmark lead with the portfolio", () => {
  const header = read("src/components/layout/Header.tsx");
  const portfolioIndex = header.indexOf('{ key: "portfolio"');
  const academyIndex = header.indexOf('{ key: "academy"');
  assert.ok(portfolioIndex > -1 && academyIndex > -1, "both destinations are in the header");
  assert.ok(portfolioIndex < academyIndex, "the portfolio link comes first");
  assert.match(header, /<Link href=\{href\(locale, "\/portfolio"\)\} className="flex items-center shrink-0 group"/);

  const footer = read("src/components/layout/Footer.tsx");
  assert.ok(footer.indexOf('path: "/portfolio"') < footer.indexOf('path: "/academy"'));
});

test("retired public routes answer with a permanent 301 to a surviving page", () => {
  const config = read("next.config.ts");
  const academyList = config.match(/const RETIRED_TO_ACADEMY = \[([\s\S]*?)\] as const;/);
  const portfolioList = config.match(/const RETIRED_TO_PORTFOLIO = \[([\s\S]*?)\] as const;/);
  assert.ok(academyList && portfolioList, "both redirect lists exist");

  const entries = [...academyList[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const section of ["patterns", "styles", "spaces", "collections"]) assert.ok(entries.includes(section));

  const portfolioEntries = [...portfolioList[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const section of ["shop", "marketplace", "artists", "about", "contact"]) {
    assert.ok(portfolioEntries.includes(section));
  }

  assert.match(config, /statusCode: 301 as const/);
  assert.match(config, /source: `\/\$\{locale\}\/\$\{section\}\/:path\*`/);
});

test("the 404 page offers exactly the two destinations the site still has", () => {
  const view = read("src/components/ui/NotFoundView.tsx");
  assert.match(view, /\/\$\{locale\}\/portfolio/);
  assert.match(view, /\/\$\{locale\}\/academy/);
  for (const removed of ["/patterns", "/shop", "/marketplace", "/artists"]) {
    assert.equal(view.includes(`"${removed}"`), false, `404 must not link to removed ${removed}`);
  }
});

test("each page links to the other so the two sections form a loop", () => {
  const portfolio = read("src/app/[locale]/portfolio/page.tsx");
  assert.match(portfolio, /href\(locale, "\/academy"\)/, "portfolio links to the academy");
  assert.match(portfolio, /<EducationCard item=\{item\}/, "portfolio shows academy courses");

  const academy = read("src/app/[locale]/academy/page.tsx");
  assert.match(academy, /href\(locale, "\/portfolio"\)/, "academy links to the portfolio");
  assert.match(academy, /<PortfolioCard item=\{work\}/, "academy shows portfolio works");
});
