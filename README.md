# Rosie Atelier — Academy & Portfolio

A bilingual (فارسی RTL / English LTR) Next.js 15 site with exactly **two public pages**:

| Page | Route | Content |
| --- | --- | --- |
| آکادمی / Academy | `/[locale]/academy` (+ `/[locale]/academy/[slug]`, `/live`, `/broadcast`) | courses, workshops, live events, lessons, enrollment |
| پورتفولیو / Portfolio | `/[locale]/portfolio` (+ `/[locale]/portfolio/[slug]`) | studio works, gallery, founder introduction, collaboration |

`/[locale]` redirects to `/[locale]/academy`. Locale handling (`fa` | `en`) is unchanged, and the
visitor auth pages (`/[locale]/login`, `/[locale]/signup`) remain because paid live-event access and
the e-mail-code flow need an account.

> **Removed in the two-page redesign:** the shop, patterns, collections, styles, spaces, stories,
> projects, custom production, artists directory, artist dashboards, digital marketplace, checkout,
> licences, favourites, account area, owner pages, contact/newsletter forms and live chat. Their
> routes now return 404, and the matching admin sections, APIs, components and libraries were deleted.
> The content model (`src/lib/types.ts`) still carries the old collections so existing
> `data/content.json` files keep validating; they are simply no longer rendered or edited.

## Run

```bash
npm install
npm run dev      # http://localhost:3000 → /fa/academy
npm run check    # typecheck + lint
npm run build && npm start
```

`npm run dev` auto-detects WebContainer environments (StackBlitz, Bolt.new) and applies the
async-context mitigation required by Next.js 15.5.x there — see [STACKBLITZ.md](STACKBLITZ.md).
Ordinary machines run plain `next dev`.

## Admin panel

`/admin/fa` or `/admin/en` — only the sections that feed the two public pages remain:

| Section | What it edits |
| --- | --- |
| داشبورد | counts of published courses, live events and works, plus review hints |
| آکادمی | courses, workshops, webinars, lessons, video uploads, enrollments (`/api/admin/reservations`) |
| پورتفولیو | works, categories, galleries, publish state |
| هیرو پورتفولیو | hero media, copy and framing for `/[locale]/portfolio` |
| بنرهای آکادمی | academy-placement announcement banners |
| متادیتای صفحه‌ها | SEO title/description for `/academy` and `/portfolio` |

Image uploads go to `POST /api/admin/upload` (admin-only) and are served through `/api/media/[id]`.

Set credentials before use:

```bash
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=…long-random…
AUTH_SECRET=…openssl rand -hex 32…
```

## Structure

```
src/
  app/[locale]/
    page.tsx                 # → /{locale}/academy
    academy/                 # listing, [slug], live, broadcast
    portfolio/               # listing, [slug]
    login/ signup/           # visitor auth (e-mail + code, optional Google)
  app/admin/[locale]/        # admin shell + login
  app/api/                   # academy, admin (content/upload/reservations), auth, media, webinar, health
  components/
    academy/ portfolio/      # page-specific UI
    admin/                   # AdminApp, AcademyManager, PortfoliosManager, PortfolioHeroManager, OverviewDashboard
    cards/ education/portfolio cards
    layout/                  # Header, Footer, Logo, LocaleChrome
    profile/                 # auth forms
    ui/ providers/ pwa/
  lib/
    academy/                 # publication rules
    artist/portfolio.ts      # studio-vs-artist portfolio rules (studio only is public)
    data/                    # content store, queries, seed, reservations
    marketplace/             # storage/email/config plumbing used by uploads & mail
```

## Environment

See `.env.example`. The essentials:

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for persistent admin content
- `RESEND_API_KEY` or `SMTP_*` for real e-mail delivery (sign-in codes, enrollment mail)
- `MARKETPLACE_S3_*` for shared object storage of uploaded images and academy videos

Check the runtime with `GET /api/health` → `"ok": true`.

## Production build

```bash
npm ci && npm run build && npm start
```

`output: "standalone"` with `distDir: "dist/.next"`. `postbuild` copies `public/` and the static
chunks into `dist/.next/standalone/`, and `scripts/preserve-data.mjs` keeps the runtime `data/`
snapshot from being overwritten by the committed one. `next start` is not supported.

```bash
ADMIN_EMAIL=… ADMIN_PASSWORD=… AUTH_SECRET=… PORT=3000 HOSTNAME=0.0.0.0 npm start
```

## Tests

```bash
node --test tests/*.test.mjs
```

The suite covers academy publication rules, portfolio hero/isolation, admin content validation,
e-mail sign-in, CSRF, media delivery, SEO metadata and the StackBlitz runtime. Tests for removed
features were deleted with them.

## Docs

- [ACADEMY.md](ACADEMY.md) — academy content model and enrollment
- [REPORT-PORTFOLIO-PAGE.md](REPORT-PORTFOLIO-PAGE.md) · [REPORT-PORTFOLIO-HERO.md](REPORT-PORTFOLIO-HERO.md)
- [EMAIL-LOGIN.md](EMAIL-LOGIN.md) · [GOOGLE-SIGNIN.md](GOOGLE-SIGNIN.md) · [LOGIN-METHODS-IR.md](LOGIN-METHODS-IR.md)
- [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) · [MEDIA-DELIVERY-IR.md](MEDIA-DELIVERY-IR.md)
- [STACKBLITZ.md](STACKBLITZ.md) · [DEPLOY-ISSUES.md](DEPLOY-ISSUES.md) · [MOBILE-ADMIN-PWA.md](MOBILE-ADMIN-PWA.md)
