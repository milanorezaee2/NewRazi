import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_LOGIN_DISABLED } from "@/lib/admin-access";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/types";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { applySecurityHeaders, createContentSecurityPolicy } from "@/lib/security/headers";
import { ensureCsrfToken } from "@/lib/security/csrf";

function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const nonce = createNonce();

  // Next.js reads the forwarded CSP nonce and attaches it to its streamed RSC and hydration scripts.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  // The root layout sits above the [locale] segment and receives no params,
  // so forward the locale for correct <html lang/dir> per locale.
  const firstSeg = pathname.split("/").filter(Boolean);
  const pathLocale =
    firstSeg[0] === "admin"
      ? firstSeg[1]
      : firstSeg[0];
  requestHeaders.set(
    "x-locale",
    LOCALES.includes(pathLocale as never) ? (pathLocale as string) : DEFAULT_LOCALE,
  );
  requestHeaders.set("Content-Security-Policy", createContentSecurityPolicy(req, nonce));
  let res = NextResponse.next({ request: { headers: requestHeaders } });
  res = applySecurityHeaders(req, res, nonce);
  ensureCsrfToken(req, res);

  /* -------- مسیرهای پنل ادمین (/admin/[locale]/) -------- */
  // این مسیرها از layout سایت جدا هستند
  const adminMatch = pathname.match(/^\/admin\/([^/]+)(\/.*)?$/);
  if (adminMatch) {
    const rest = adminMatch[2] ?? "";

    // TEMPORARY: the owner requested direct public access to the admin panel.
    if (ADMIN_LOGIN_DISABLED) {
      if (rest === "/login" || rest === "/login/") {
        const panelUrl = req.nextUrl.clone();
        panelUrl.pathname = `/admin/${adminMatch[1]}`;
        return applySecurityHeaders(req, NextResponse.redirect(panelUrl), nonce);
      }
      return res;
    }

    // صفحه لاگین ادمین نیازی به بررسی نشست ندارد
    if (rest === "/login" || rest === "/login/") return res;

    // بقیه مسیرهای ادمین نیاز به نقش admin دارند
    const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
    const session = await readSessionToken(sessionToken);
    if (!session || session.role !== "admin") {
      const locale = adminMatch[1];
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = `/admin/${locale}/login`;
      loginUrl.search = "";
      loginUrl.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
      return applySecurityHeaders(req, NextResponse.redirect(loginUrl), nonce);
    }
    return res;
  }

  /* -------- i18n locale prefix (برای مسیرهای سایت اصلی) -------- */
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const cookie = req.cookies.get("ra-locale")?.value;
    const locale = LOCALES.includes(cookie as never) ? cookie : DEFAULT_LOCALE;
    const url = req.nextUrl.clone();
    // The site's front door is the portfolio, so "/" lands there in one hop.
    url.pathname = `/${locale}${pathname === "/" ? "/portfolio" : pathname}`;
    return applySecurityHeaders(req, NextResponse.redirect(url), nonce);
  }

  /*
   * The portfolio is the homepage of the two-page site. A bare locale root
   * (/fa, /en) answers with a real HTTP redirect instead of rendering a page
   * that only bounces the browser client-side.
   */
  const bareLocalePath = pathname.replace(/\/+$/, "");
  if (LOCALES.some((locale) => bareLocalePath === `/${locale}`)) {
    const url = req.nextUrl.clone();
    url.pathname = `${bareLocalePath}/portfolio`;
    return applySecurityHeaders(req, NextResponse.redirect(url, 308), nonce);
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|fonts|images|favicon.ico|.*\\..*).*)"],
};
