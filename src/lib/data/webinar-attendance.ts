import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { EducationType } from "@/lib/types";
import type { Localized } from "@/lib/i18n/types";

const KEY = "rosie-atelier:webinar-attendance";
const FILE = path.join(process.cwd(), "data", "webinar-attendance.json");
const LOCK = `${FILE}.lock`;
const LOCK_WAIT_MS = 5_000;
const LOCK_STALE_MS = 5 * 60_000;
const HEARTBEAT_MIN_MS = 20_000;
const MAX_HEARTBEAT_SECONDS = 40;

export interface LiveAttendanceRecord {
  id: string;
  eventSlug: string;
  eventType: "workshop" | "webinar";
  eventTitle: Localized;
  userId: string;
  name: string;
  email: string;
  firstAccessAt: number;
  lastAccessAt: number;
  roomJoins: number;
  externalHandoffs: number;
  totalDurationSeconds: number;
  lastEntryMode: "room" | "external";
  /** Internal signaling identifiers; removed by the admin API before delivery. */
  activeViewerId?: string;
  lastTouchAt?: number;
}

export type AttendanceMode = "room" | "external";

function redisEnabled() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisCmd(args: string[]) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`redis ${response.status}`);
  return (await response.json()) as { result: unknown };
}

async function readLocal(): Promise<LiveAttendanceRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const value: unknown = JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
    if (!Array.isArray(value)) throw new Error("invalid_attendance_store");
    return value as LiveAttendanceRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(records: LiveAttendanceRecord[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const temporary = `${FILE}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(records, null, 2), { encoding: "utf8", flag: "wx" });
    await fs.rename(temporary, FILE);
  } finally {
    await fs.unlink(temporary).catch(() => undefined);
  }
}

async function withFileLock<T>(operation: () => Promise<T>): Promise<T> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const deadline = Date.now() + LOCK_WAIT_MS;
  let handle: Awaited<ReturnType<typeof fs.open>> | null = null;
  while (!handle) {
    try {
      const candidate = await fs.open(LOCK, "wx");
      await candidate.writeFile(`${process.pid}:${Date.now()}`);
      handle = candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      try {
        const stat = await fs.stat(LOCK);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          await fs.unlink(LOCK).catch(() => undefined);
          continue;
        }
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code === "ENOENT") continue;
        throw statError;
      }
      if (Date.now() >= deadline) throw new Error("attendance_store_busy");
      await new Promise<void>((resolve) => setTimeout(resolve, 25 + Math.random() * 50));
    }
  }
  try {
    return await operation();
  } finally {
    await handle.close().catch(() => undefined);
    await fs.unlink(LOCK).catch(() => undefined);
  }
}

const MUTATE_LUA = `
local records = cjson.decode(redis.call('GET', KEYS[1]) or '[]')
local action = ARGV[1]
local eventSlug = ARGV[2]
local userId = ARGV[3]
local viewerId = ARGV[4]
local now = tonumber(ARGV[5])
local mode = ARGV[6]
local initial = cjson.decode(ARGV[7])
local found = nil
for _, record in ipairs(records) do
  if record.eventSlug == eventSlug and record.userId == userId then found = record break end
end
local changed = false
if action == 'join' then
  if not found then
    found = initial
    table.insert(records, found)
  end
  if found.activeViewerId and found.lastTouchAt then
    local seconds = math.floor(math.min(${MAX_HEARTBEAT_SECONDS}, math.max(0, (now - tonumber(found.lastTouchAt)) / 1000)))
    found.totalDurationSeconds = (tonumber(found.totalDurationSeconds) or 0) + seconds
  end
  found.lastAccessAt = now
  found.lastEntryMode = mode
  if mode == 'room' then
    found.roomJoins = (tonumber(found.roomJoins) or 0) + 1
    found.activeViewerId = viewerId
    found.lastTouchAt = now
  else
    found.externalHandoffs = (tonumber(found.externalHandoffs) or 0) + 1
    found.activeViewerId = nil
    found.lastTouchAt = nil
  end
  changed = true
elseif action == 'touch' and found and found.activeViewerId == viewerId then
  local last = tonumber(found.lastTouchAt) or now
  if now - last >= ${HEARTBEAT_MIN_MS} then
    local seconds = math.floor(math.min(${MAX_HEARTBEAT_SECONDS}, math.max(0, (now - last) / 1000)))
    found.totalDurationSeconds = (tonumber(found.totalDurationSeconds) or 0) + seconds
    found.lastTouchAt = now
    found.lastAccessAt = now
    changed = true
  end
elseif action == 'leave' and found and found.activeViewerId == viewerId then
  local last = tonumber(found.lastTouchAt) or now
  local seconds = math.floor(math.min(${MAX_HEARTBEAT_SECONDS}, math.max(0, (now - last) / 1000)))
  found.totalDurationSeconds = (tonumber(found.totalDurationSeconds) or 0) + seconds
  found.lastTouchAt = nil
  found.activeViewerId = nil
  found.lastAccessAt = now
  changed = true
end
if changed then redis.call('SET', KEYS[1], cjson.encode(records)) end
return cjson.encode({ changed = changed, record = found })
`;

async function mutateRedis(
  action: "join" | "touch" | "leave",
  eventSlug: string,
  userId: string,
  viewerId: string,
  now: number,
  mode: AttendanceMode,
  initial: LiveAttendanceRecord,
) {
  const result = await redisCmd([
    "EVAL", MUTATE_LUA, "1", KEY,
    action, eventSlug, userId, viewerId, String(now), mode, JSON.stringify(initial),
  ]);
  if (typeof result.result !== "string") throw new Error("invalid_attendance_mutation");
  return JSON.parse(result.result) as { changed: boolean; record: LiveAttendanceRecord | null };
}

function makeInitial(input: {
  eventSlug: string;
  eventType: "workshop" | "webinar";
  eventTitle: Localized;
  userId: string;
  name: string;
  email: string;
}, now: number): LiveAttendanceRecord {
  return {
    id: `att-${crypto.randomBytes(8).toString("hex")}`,
    eventSlug: input.eventSlug,
    eventType: input.eventType,
    eventTitle: input.eventTitle,
    userId: input.userId,
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().toLowerCase().slice(0, 254),
    firstAccessAt: now,
    lastAccessAt: now,
    roomJoins: 0,
    externalHandoffs: 0,
    totalDurationSeconds: 0,
    lastEntryMode: "room",
  };
}

async function mutateLocal(
  action: "join" | "touch" | "leave",
  eventSlug: string,
  userId: string,
  viewerId: string,
  now: number,
  mode: AttendanceMode,
  initial: LiveAttendanceRecord,
) {
  return withFileLock(async () => {
    const records = await readLocal();
    let record = records.find((entry) => entry.eventSlug === eventSlug && entry.userId === userId);
    let changed = false;
    if (action === "join") {
      if (!record) {
        record = initial;
        records.push(record);
      }
      if (record.activeViewerId && record.lastTouchAt) {
        record.totalDurationSeconds += Math.floor(Math.min(MAX_HEARTBEAT_SECONDS, Math.max(0, (now - record.lastTouchAt) / 1000)));
      }
      record.lastAccessAt = now;
      record.lastEntryMode = mode;
      if (mode === "room") {
        record.roomJoins += 1;
        record.activeViewerId = viewerId;
        record.lastTouchAt = now;
      } else {
        record.externalHandoffs += 1;
        delete record.activeViewerId;
        delete record.lastTouchAt;
      }
      changed = true;
    } else if (record?.activeViewerId === viewerId && record.lastTouchAt) {
      if (action === "touch" && now - record.lastTouchAt >= HEARTBEAT_MIN_MS) {
        record.totalDurationSeconds += Math.floor(Math.min(MAX_HEARTBEAT_SECONDS, Math.max(0, (now - record.lastTouchAt) / 1000)));
        record.lastTouchAt = now;
        record.lastAccessAt = now;
        changed = true;
      } else if (action === "leave") {
        record.totalDurationSeconds += Math.floor(Math.min(MAX_HEARTBEAT_SECONDS, Math.max(0, (now - record.lastTouchAt) / 1000)));
        delete record.activeViewerId;
        delete record.lastTouchAt;
        record.lastAccessAt = now;
        changed = true;
      }
    }
    if (changed) await writeLocal(records);
    return { changed, record: record ?? null };
  });
}

async function mutate(
  action: "join" | "touch" | "leave",
  input: {
    eventSlug: string;
    userId: string;
    viewerId: string;
    now: number;
    mode?: AttendanceMode;
    eventType: "workshop" | "webinar";
    eventTitle: Localized;
    name: string;
    email: string;
  },
) {
  const initial = makeInitial(input, input.now);
  if (redisEnabled()) {
    return mutateRedis(action, input.eventSlug, input.userId, input.viewerId, input.now, input.mode ?? "room", initial);
  }
  return mutateLocal(action, input.eventSlug, input.userId, input.viewerId, input.now, input.mode ?? "room", initial);
}

export async function recordLiveAttendance(input: {
  eventSlug: string;
  eventType: "workshop" | "webinar";
  eventTitle: Localized;
  userId: string;
  name: string;
  email: string;
  viewerId: string;
  mode: AttendanceMode;
}) {
  const result = await mutate("join", { ...input, now: Date.now() });
  if (!result.record) throw new Error("attendance_record_missing");
  return result.record;
}

export async function touchLiveAttendance(input: {
  eventSlug: string;
  eventType: "workshop" | "webinar";
  eventTitle: Localized;
  userId: string;
  name: string;
  email: string;
  viewerId: string;
}) {
  return mutate("touch", { ...input, now: Date.now(), mode: "room" });
}

export async function closeLiveAttendance(input: {
  eventSlug: string;
  eventType: "workshop" | "webinar";
  eventTitle: Localized;
  userId: string;
  name: string;
  email: string;
  viewerId: string;
}) {
  return mutate("leave", { ...input, now: Date.now(), mode: "room" });
}

export async function getAllLiveAttendance(): Promise<LiveAttendanceRecord[]> {
  if (!redisEnabled()) return readLocal();
  const { result } = await redisCmd(["GET", KEY]);
  if (result === null || result === undefined) return [];
  if (typeof result !== "string") throw new Error("invalid_attendance_store");
  const records: unknown = JSON.parse(result);
  if (!Array.isArray(records)) throw new Error("invalid_attendance_store");
  return records as LiveAttendanceRecord[];
}

export function educationTypeToLiveEvent(type: EducationType): "workshop" | "webinar" | null {
  return type === "workshop" || type === "webinar" ? type : null;
}
