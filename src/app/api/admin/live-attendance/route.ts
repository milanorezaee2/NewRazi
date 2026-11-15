import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllLiveAttendance } from "@/lib/data/webinar-attendance";
import { withNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, withNoStore({ status: 401 }));
  }

  try {
    const now = Date.now();
    const records = await getAllLiveAttendance();
    const attendees = records
      .map((record) => ({
        id: record.id,
        eventSlug: record.eventSlug,
        eventType: record.eventType,
        eventTitle: record.eventTitle,
        userId: record.userId,
        name: record.name,
        email: record.email,
        firstAccessAt: record.firstAccessAt,
        lastAccessAt: record.lastAccessAt,
        roomJoins: record.roomJoins,
        externalHandoffs: record.externalHandoffs,
        totalDurationSeconds: record.totalDurationSeconds,
        lastEntryMode: record.lastEntryMode,
        activeNow: record.lastEntryMode === "room" && now - record.lastAccessAt <= 60_000,
      }))
      .sort((a, b) => b.lastAccessAt - a.lastAccessAt);
    return NextResponse.json({ ok: true, attendees }, withNoStore());
  } catch (error) {
    console.error("[admin/live-attendance] failed to load attendance:", error);
    return NextResponse.json({ ok: false, error: "attendance_unavailable" }, withNoStore({ status: 503 }));
  }
}
