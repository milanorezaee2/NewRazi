import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { LOCALES, dirOf, type Locale } from "@/lib/i18n/types";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b2e4b",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rosieatelier.com"),
  title: "Rosie Atelier",
  description: "Pattern, design, creativity and lifestyle.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('ra-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale?: string }> }>) {
  const requestHeaders = await headers();
  const { locale } = await params;
  const headerLocale = requestHeaders.get("x-locale") ?? undefined;
  const lang = (
    LOCALES.includes(headerLocale as Locale)
      ? headerLocale
      : LOCALES.includes(locale as Locale)
        ? locale
        : "fa"
  ) as Locale;
  const dir = dirOf(lang);
  const nonce = requestHeaders.get("x-nonce") ?? undefined;

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
