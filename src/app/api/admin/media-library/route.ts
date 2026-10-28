import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { getAdminSession } from "@/lib/auth";
import { withNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const ROOTS = ["images"];
const MAX_PER_ROOT = 400;

/**
 * GET /api/admin/media-library
 *
 * Read-only index of the image files already shipped in `public/images`, so the
 * page manager can pick a backdrop or a cover from a real grid instead of typing
 * paths. Admin-only, no filesystem writes, no traversal outside the roots.
 */
async function walk(dir: string, relative: string, collected: { path: string; name: string; folder: string }[]) {
  if (collected.length >= MAX_PER_ROOT) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (collected.length >= MAX_PER_ROOT) return;
    if (entry.name.startsWith(".")) continue;
    const absolute = path.join(dir, entry.name);
    const rel = `${relative}/${entry.name}`;
    if (entry.isDirectory()) {
      await walk(absolute, rel, collected);
      continue;
    }
    if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      collected.push({ path: `/${rel}`, name: entry.name, folder: relative });
    }
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, withNoStore({ status: 401 }));

  const files: { path: string; name: string; folder: string }[] = [];
  for (const root of ROOTS) {
    await walk(path.join(process.cwd(), "public", root), root, files);
  }

  return NextResponse.json({ ok: true, files }, withNoStore());
}
