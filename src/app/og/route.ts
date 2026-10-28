import { NextResponse } from "next/server";
import { renderOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-dynamic";

/**
 * GET /og?src=/images/…&title=…&eyebrow=…
 *
 * Per-item social card: the item's cover, cropped and stamped. `src` is only
 * ever a same-origin relative path — absolute URLs are rejected so the route
 * cannot be used as an open image proxy (SSRF).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const src = url.searchParams.get("src") ?? "";
  const title = (url.searchParams.get("title") ?? "").slice(0, 120);
  const eyebrow = (url.searchParams.get("eyebrow") ?? "").slice(0, 60);

  let cover: Buffer | null = null;
  if (src.startsWith("/") && !src.startsWith("//")) {
    try {
      const res = await fetch(new URL(src, url.origin), { cache: "no-store" });
      if (res.ok) cover = Buffer.from(await res.arrayBuffer());
    } catch {
      cover = null;
    }
  }

  try {
    const jpeg = await renderOgImage({ cover, title, eyebrow });
    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        /* Deterministic for a given cover+title, so cache hard at the edge. */
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[og] render failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
