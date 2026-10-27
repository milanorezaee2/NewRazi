import "server-only";
import sharp from "sharp";

/**
 * Social-card renderer used by `/og`.
 *
 * 1200×630 JPEG built from the item's own cover: the photo is cropped to the
 * card ratio, darkened from the bottom, and stamped with the studio wordmark and
 * the item's Latin slug. Text stays Latin on purpose — the SVG stack that
 * librsvg ships with only guarantees Latin glyph coverage and Arabic shaping is
 * not reliable there, so Persian titles travel in `og:title` instead of being
 * baked into the pixels.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export function latinLabel(input: string | null | undefined, fallback = ""): string {
  const raw = (input ?? "").normalize("NFKD");
  const latin = raw.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
  const cleaned = latin || fallback;
  return cleaned.slice(0, 46);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface OgOptions {
  title: string;
  eyebrow?: string;
}

/** Gradient + wordmark overlay, drawn above the photo. */
function overlaySvg({ title, eyebrow }: OgOptions): Buffer {
  const label = escapeXml(latinLabel(title, "Rosie Atelier"));
  const kicker = escapeXml(latinLabel(eyebrow, "Rosie Atelier").toUpperCase());
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stop-color="#0d1117" stop-opacity="0"/>
          <stop offset="1" stop-color="#0d1117" stop-opacity="0.92"/>
        </linearGradient>
      </defs>
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#fade)"/>
      <rect x="72" y="458" width="64" height="3" fill="#c9a227"/>
      <text x="72" y="520" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">${label}</text>
      <text x="72" y="566" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="#e7e2d8">${kicker}</text>
      <text x="${OG_WIDTH - 72}" y="566" text-anchor="end" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="2" fill="#e7e2d8">ROSIEATELIER.COM</text>
    </svg>`,
  );
}

/** Solid fallback used when the cover cannot be fetched; never throws. */
function fallbackSvg(options: OgOptions): Buffer {
  const label = escapeXml(latinLabel(options.title, "Rosie Atelier"));
  const kicker = escapeXml(latinLabel(options.eyebrow, "Rosie Atelier").toUpperCase());
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#0d1117"/>
      <rect x="72" y="458" width="64" height="3" fill="#c9a227"/>
      <text x="72" y="520" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">${label}</text>
      <text x="72" y="566" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="#e7e2d8">${kicker}</text>
    </svg>`,
  );
}

export async function renderOgImage(input: { cover?: Buffer | null; title: string; eyebrow?: string }): Promise<Buffer> {
  const base = input.cover
    ? sharp(input.cover)
        .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "attention" })
        .modulate({ brightness: 0.92, saturation: 0.95 })
    : sharp(fallbackSvg(input));

  const composed = base
    .composite([{ input: overlaySvg(input), top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true, progressive: true });

  return composed.toBuffer();
}
