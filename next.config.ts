import type { NextConfig } from "next";

/**
 * Public routes that were retired when the site was reduced to the academy and
 * the portfolio. They answer with a permanent 301 to the closest surviving page
 * so old links, bookmarks and search results keep resolving.
 *
 * Front-door tiles map to the portfolio; learning topics map to the academy.
 */
const RETIRED_TO_ACADEMY = ["patterns", "styles", "spaces", "collections"] as const;
/** Old contact/enquiry pages now point at the single entry page. */
const RETIRED_TO_START = ["contact", "custom-order", "collaborate", "hire"] as const;
const RETIRED_TO_PORTFOLIO = [
  "about",
  "razieh",
  "artists",
  "artist",
  "projects",
  "custom",
  "stories",
  "shop",
  "marketplace",
  "checkout",
  "account",
  "favorites",
  "delivery",
  "verify",
  "faq",
  "returns",
  "legal",
  "search",
  "creators/join",
] as const;

// Browser-hosted previews cannot run the native Sharp image-optimisation service.
// Keep this separate from production and normal Node development.
const stackblitzPreview =
  process.env.ROSIE_STACKBLITZ === "1" && process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.e2b.app",
    "*.webcontainer-api.io",
    "*.local-credentialless.webcontainer-api.io",
    "*.stackblitz.io",
  ],
  // Keep server routes, API handlers, middleware, and authentication in the distributable bundle.
  output: "standalone",
  distDir: "dist/.next",
  async redirects() {
    return [
      // Resolve the short admin URL to the panel; middleware applies the current temporary access mode.
      { source: "/admin", destination: "/admin/fa", permanent: false },
      // Legacy locale-prefixed admin links land in the matching admin panel.
      { source: "/fa/admin", destination: "/admin/fa", permanent: false },
      { source: "/en/admin", destination: "/admin/en", permanent: false },
      // Retired sections → the page that now carries their content (301, locale-aware).
      ...RETIRED_TO_ACADEMY.flatMap((section) =>
        ["fa", "en"].flatMap((locale) => [
          { source: `/${locale}/${section}`, destination: `/${locale}/academy`, statusCode: 301 as const },
          { source: `/${locale}/${section}/:path*`, destination: `/${locale}/academy`, statusCode: 301 as const },
        ]),
      ),
      ...RETIRED_TO_START.flatMap((section) =>
        ["fa", "en"].flatMap((locale) => [
          { source: `/${locale}/${section}`, destination: `/${locale}/start`, statusCode: 301 as const },
          { source: `/${locale}/${section}/:path*`, destination: `/${locale}/start`, statusCode: 301 as const },
        ]),
      ),
      ...RETIRED_TO_PORTFOLIO.flatMap((section) =>
        ["fa", "en"].flatMap((locale) => [
          { source: `/${locale}/${section}`, destination: `/${locale}/portfolio`, statusCode: 301 as const },
          { source: `/${locale}/${section}/:path*`, destination: `/${locale}/portfolio`, statusCode: 301 as const },
        ]),
      ),
    ];
  },
  images: {
    unoptimized: stackblitzPreview,
    // The default candidate list tops out at 3840w, which appends dead weight to every srcset.
    // Nothing on this site renders wider than 2×1920; capping the list trims ~40% off each <img>.
    deviceSizes: [640, 750, 1080, 1200, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // SiteImage requests quality 100; retain legacy values for cached URLs and callers.
    qualities: [75, 85, 90, 95, 100],
  },
};

export default nextConfig;
