import type { Metadata, Viewport } from "next";
import "../../globals.css";
import { notFound } from "next/navigation";
import { AppProviders } from "@/components/providers/AppProviders";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { LOCALES, type Locale } from "@/lib/i18n/types";

export const metadata: Metadata = {
  robots: { index: false },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "پنل رزی",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#b5713a" },
    { media: "(prefers-color-scheme: dark)", color: "#d38f55" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function AdminLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!LOCALES.includes(raw as Locale)) notFound();
  const locale = raw as Locale;

  // The root layout owns document metadata, theme initialization, <html>, and <body>.
  return (
    <div className="min-h-dvh bg-[#f0f2f5]">
      <PwaRegister />
      <PwaInstallPrompt />
      <AppProviders locale={locale}>{children}</AppProviders>
    </div>
  );
}
