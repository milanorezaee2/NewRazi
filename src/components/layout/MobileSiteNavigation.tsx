"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Palette } from "lucide-react";
import { useLocale } from "@/components/providers/AppProviders";
import { href } from "@/lib/utils";

/** Same two public destinations as the desktop header, presented as a phone tab bar. */
export function MobileSiteNavigation() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  if (/\/(?:login|signup|academy\/[^/]+\/join)\/?$/.test(pathname)) return null;
  const items = [
    { href: href(locale, "/portfolio"), label: dict.nav.portfolio, Icon: Palette },
    { href: href(locale, "/academy"), label: dict.nav.education, Icon: GraduationCap },
  ];

  return (
    <nav className="mobile-site-nav" aria-label={locale === "fa" ? "پیمایش سایت" : "Site navigation"}>
      {items.map(({ href: destination, label, Icon }) => {
        const active = pathname.startsWith(destination);
        return (
          <Link key={destination} href={destination} className={`mobile-site-nav__item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
