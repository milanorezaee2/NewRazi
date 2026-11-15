import type { CapacitorConfig } from "@capacitor/cli";

// The public Android app is a secure web wrapper for the live, server-rendered site.
// It does not bundle or duplicate site content; account and commerce features remain online.
// Override the origin with CAPACITOR_SERVER_URL when building for another deployment.
const siteUrl = (
  process.env.CAPACITOR_SERVER_URL
  ?? process.env.NEXT_PUBLIC_SITE_URL
  ?? "https://rosieatelier.com"
).trim().replace(/\/$/, "");

let parsedSiteUrl: URL;
try {
  parsedSiteUrl = new URL(siteUrl);
} catch {
  throw new Error("CAPACITOR_SERVER_URL must be a valid absolute URL");
}

const allowCleartext = process.env.CAPACITOR_ALLOW_CLEARTEXT === "1";
const siteHost = parsedSiteUrl.hostname.replace(/^www\./, "");
if (parsedSiteUrl.protocol !== "https:" && !allowCleartext) {
  throw new Error("The Android app requires HTTPS. For local device testing only, set CAPACITOR_ALLOW_CLEARTEXT=1.");
}

const config: CapacitorConfig = {
  appId: "com.rosieatelier.app",
  appName: "آتلیه رزی",
  webDir: "capacitor-web",
  server: {
    // Open the existing Persian-language public site without changing its routes or content.
    url: new URL("/fa?source=android", parsedSiteUrl).toString(),
    cleartext: allowCleartext,
    allowNavigation: [siteHost, `*.${siteHost}`],
    errorPath: "offline.html",
  },
};

export default config;
