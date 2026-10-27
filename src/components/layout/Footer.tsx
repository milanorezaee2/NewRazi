"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Mail, Moon, PlayCircle, Send, Sun } from "lucide-react";
import { useLocale, useTheme } from "@/components/providers/AppProviders";
import { href } from "@/lib/utils";
import { Logo } from "./Logo";

/**
 * Site footer for the two-page site: the academy and the studio portfolio.
 * Commerce, legal and editorial columns were removed together with their pages.
 */
export function Footer() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const fa = locale === "fa";
  const other = locale === "fa" ? "en" : "fa";
  const switchHref = pathname.replace(new RegExp(`^/${locale}`), `/${other}`) || `/${other}`;
  const year = new Date().getFullYear();

  const socials = [
    { icon: Camera, label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com" },
    { icon: Send, label: "Telegram", href: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me" },
    { icon: PlayCircle, label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com" },
    { icon: Mail, label: "Email", href: "mailto:hello@rosieatelier.com" },
  ];

  const pages = [
    { label: dict.nav.portfolio, path: "/portfolio" },
    { label: dict.nav.education, path: "/academy" },
    { label: dict.nav.login, path: "/login" },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-background-secondary">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo className="text-[17px] text-foreground" />
            <p className="mt-4 text-body-sm leading-7 text-foreground-secondary">
              {fa
                ? "آکادمی و پورتفولیوی آتلیه رزی — آموزش طراحی پترن و روایت آثار راضیه خیری‌پور."
                : "The Rosie Atelier academy and studio portfolio — pattern-design education and the work of Razieh Kheiripour."}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-secondary transition-colors hover:border-foreground hover:text-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label={fa ? "صفحه‌ها" : "Pages"}>
            <p className="text-label text-muted">{fa ? "صفحه‌ها" : "Pages"}</p>
            <ul className="mt-4 space-y-2.5">
              {pages.map((p) => (
                <li key={p.path}>
                  <Link
                    href={href(locale, p.path)}
                    className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-label text-muted">{fa ? "ارتباط" : "Contact"}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground-secondary">
              <li>
                <a href="mailto:hello@rosieatelier.com" className="transition-colors hover:text-foreground" dir="ltr">
                  hello@rosieatelier.com
                </a>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={switchHref}
                    className="inline-flex h-9 items-center rounded-full border border-border px-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-foreground"
                  >
                    {other === "fa" ? "فارسی" : "English"}
                  </Link>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={dict.nav.theme}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {dict.brand} — {dict.footer.rights}
          </p>
          <p>{dict.footer.founder}</p>
        </div>
      </div>
    </footer>
  );
}
