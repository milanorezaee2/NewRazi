"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Menu, Moon, Sun, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth, useLocale, useTheme } from "@/components/providers/AppProviders";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { cn, href } from "@/lib/utils";
import { Logo } from "./Logo";

/**
 * Site header.
 *
 * After the storefront was retired the public site is the academy and the
 * studio portfolio, so the navigation is exactly those two destinations.
 */
export function Header() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const fa = locale === "fa";

  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const transparent = isHome && !scrolled && !mobile;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
    setAccountMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountMenu) return;
    const onDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountMenu(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountMenu]);

  const otherLocale = locale === "fa" ? "en" : "fa";
  const switchHref = pathname.replace(new RegExp(`^/${locale}`), `/${otherLocale}`) || `/${otherLocale}`;

  const links: { key: string; label: string; href: string }[] = [
    { key: "academy", label: dict.nav.education, href: href(locale, "/academy") },
    { key: "portfolio", label: dict.nav.portfolio, href: href(locale, "/portfolio") },
  ];

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-[70] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          transparent ? "border-b border-transparent bg-transparent" : "glass border-b border-border/70 shadow-[0_1px_0_0_var(--border)]",
        )}
      >
        <div
          className={cn(
            "site-header__inner container-x flex items-center justify-between gap-4 sm:gap-6 transition-[height] duration-300",
            scrolled ? "h-14 sm:h-[var(--header-h-compact)]" : "h-16 sm:h-[var(--header-h)]",
          )}
        >
          <Link href={href(locale, "/academy")} className="flex items-center shrink-0 group" aria-label={dict.brand}>
            <Logo
              className={cn(
                "text-[17px] transition-opacity duration-300 group-hover:opacity-75",
                transparent ? "text-white [--accent:rgba(255,255,255,0.75)]" : "text-foreground",
              )}
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-md px-3.5 text-[14px] font-medium transition-colors",
                    transparent ? "text-white/85 hover:text-white" : "text-foreground-secondary hover:text-foreground",
                    active && (transparent ? "text-white" : "text-foreground"),
                  )}
                >
                  {l.label}
                  <span className={cn("absolute inset-x-3.5 bottom-1 h-px origin-center scale-x-0 bg-current transition-transform duration-300", active && "scale-x-100")} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href={switchHref}
              hrefLang={otherLocale}
              aria-label={dict.nav.language}
              className={cn(
                "hidden sm:inline-flex h-9 items-center rounded-full border px-3 text-[12px] font-semibold uppercase tracking-wider transition-colors",
                transparent ? "border-white/35 text-white hover:bg-white/10" : "border-border text-foreground hover:border-foreground",
              )}
            >
              {otherLocale === "fa" ? "فا" : "EN"}
            </Link>

            <button
              type="button"
              onClick={toggle}
              aria-label={dict.nav.theme}
              className={cn(
                "hidden sm:flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                transparent ? "text-white/85 hover:bg-white/10" : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground",
              )}
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {user ? (
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenu((open) => !open)}
                  aria-label={dict.nav.account}
                  aria-haspopup="menu"
                  aria-expanded={accountMenu}
                  className={cn(
                    "flex h-10 items-center gap-1.5 rounded-md px-1.5 transition-colors",
                    transparent ? "text-white/85 hover:bg-white/10" : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground",
                  )}
                >
                  <span className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold uppercase select-none",
                    transparent ? "bg-white/20 text-white ring-2 ring-white/40" : "bg-accent text-white ring-2 ring-accent/30",
                  )}>
                    {user.name.trim().charAt(0)}
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", accountMenu && "rotate-180")} />
                </button>

                {accountMenu && (
                  <div
                    role="menu"
                    className="absolute end-0 top-[calc(100%+0.5rem)] w-60 origin-top overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-medium anim-scale-fade"
                  >
                    <div className="border-b border-border px-3 pb-2.5 pt-1">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-caption text-foreground-secondary" dir="ltr">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <nav className="py-1.5">
                        <a
                          href={`/admin/${locale}`}
                          role="menuitem"
                          onClick={() => setAccountMenu(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground-secondary transition hover:bg-background-secondary hover:text-foreground"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {fa ? "پنل مدیریت" : "Admin panel"}
                        </a>
                      </nav>
                    )}
                    <div className="border-t border-border pt-1.5">
                      <SignOutButton variant="menu" label={fa ? "خروج از حساب" : "Sign out"} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={href(locale, "/login")}
                aria-label={dict.nav.login}
                className={cn(
                  "hidden sm:flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors",
                  transparent ? "text-white/85 hover:bg-white/10" : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground",
                )}
              >
                <User className="h-[18px] w-[18px]" />
                <span className="hidden md:inline">{dict.nav.login}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobile((m) => !m)}
              aria-label={mobile ? dict.nav.close : dict.nav.menu}
              aria-expanded={mobile}
              className={cn(
                "lg:hidden flex h-10 w-10 items-center justify-center rounded-md",
                transparent ? "text-white" : "text-foreground",
              )}
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobile} onClose={() => setMobile(false)} links={links} switchHref={switchHref} otherLocale={otherLocale} />
    </>
  );
}

function MobileMenu({ open, onClose, links, switchHref, otherLocale }: {
  open: boolean;
  onClose: () => void;
  links: { key: string; label: string; href: string }[];
  switchHref: string;
  otherLocale: string;
}) {
  const { locale, dict } = useLocale();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const fa = locale === "fa";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={cn("fixed inset-0 z-[65] lg:hidden transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={!open}>
      <div className="absolute inset-0 bg-background pt-[var(--header-h)] overflow-y-auto">
        <div className="container-x pb-[max(3rem,env(safe-area-inset-bottom))] pt-4">
          <nav className="flex flex-col">
            {links.map((l, i) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={onClose}
                className="flex items-center justify-between border-b border-border py-4 font-display text-h2 text-foreground anim-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {l.label}
                <span className="text-muted text-caption tabular">0{i + 1}</span>
              </Link>
            ))}
            <Link onClick={onClose} href={href(locale, user ? "/academy" : "/login")} className="flex items-center justify-between border-b border-border py-4 font-display text-h2 text-foreground">
              {user ? (fa ? "پنل حساب" : "My account") : dict.nav.login}
            </Link>
          </nav>

          {user && (
            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-caption text-foreground-secondary" dir="ltr">{user.email}</p>
              </div>
              <SignOutButton size="sm" />
            </div>
          )}

          {user?.role === "admin" && (
            <a href={`/admin/${locale}`} className="mt-4 flex h-12 items-center justify-center gap-2 rounded-md bg-foreground text-background font-semibold">
              <LayoutDashboard className="h-4 w-4" />
              {fa ? "پنل مدیریت" : "Admin panel"}
            </a>
          )}

          <div className="mt-6 flex items-center gap-2">
            <Link href={switchHref} onClick={onClose} className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-semibold uppercase">
              {otherLocale === "fa" ? "فارسی" : "English"}
            </Link>
            <button type="button" onClick={toggle} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {dict.nav.theme}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
