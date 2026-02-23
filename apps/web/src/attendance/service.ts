import { AttendanceEvent, Device, WorkSession } from "@/src/db/models";
import { env } from "@/src/lib/env";
import { computeTotalSeconds } from "@/src/attendance/math";

/** Lazy-loaded to avoid Turbopack/bundler breaking geoip-lite's __dirname-based data path. */
function getGeoFromIp(ip: string): { country: string; city: string; ll: number[] } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const geoip = require("geoip-lite");
    const lookup = geoip.lookup(ip);
    if (!lookup) {
      return { country: env.geoFallbackCountry, city: "", ll: [] };
    }
    return {
      country: lookup.country || env.geoFallbackCountry,
      city: lookup.city || "",
      ll: lookup.ll || [],
    };
  } catch {
    return { country: env.geoFallbackCountry, city: "", ll: [] };
  }
}

export async function registerDevice(params: {
  userId: string;
  hostname: string;
  osVersion: string;
  deviceFingerprint: string;
  appVersion: string;
}) {
  return Device.findOneAndUpdate(
    {
      userId: params.userId,
      deviceFingerprint: params.deviceFingerprint,
    },
    params,
    { upsert: true, new: true },
  );
}

export async function clockIn(params: {
  userId: string;
  ip: string;
  deviceId: string;
  faceScore: number;
  verificationStatus: string;
}) {
  const existingOpenSession = await WorkSession.findOne({
    userId: params.userId,
    clockOutAt: null,
  });
  if (existingOpenSession) {
    throw new Error("Open work session already exists.");
  }

  const now = new Date();
  await WorkSession.create({
    userId: params.userId,
    clockInAt: now,
    ipAtIn: params.ip,
    deviceIdAtIn: params.deviceId,
  });

  await AttendanceEvent.create({
    userId: params.userId,
    type: "clockIn",
    timestamp: now,
    ip: params.ip,
    geo: getGeoFromIp(params.ip),
    deviceId: params.deviceId,
    faceScore: params.faceScore,
    verificationStatus: params.verificationStatus,
  });
}

export async function clockOut(params: {
  userId: string;
  ip: string;
  deviceId: string;
  faceScore: number;
  verificationStatus: string;
}) {
  const openSession = await WorkSession.findOne({
    userId: params.userId,
    clockOutAt: null,
  });
  if (!openSession) {
    throw new Error("No open session found to clock out.");
  }

  const now = new Date();
  const totalSeconds = computeTotalSeconds(openSession.clockInAt, now);
  openSession.clockOutAt = now;
  openSession.totalSeconds = totalSeconds;
  openSession.ipAtOut = params.ip;
  openSession.deviceIdAtOut = params.deviceId;
  await openSession.save();

  await AttendanceEvent.create({
    userId: params.userId,
    type: "clockOut",
    timestamp: now,
    ip: params.ip,
    geo: getGeoFromIp(params.ip),
    deviceId: params.deviceId,
    faceScore: params.faceScore,
    verificationStatus: params.verificationStatus,
  });

  return openSession;
}

export async function getTodaySummary(userId: string) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  const sessions = await WorkSession.find({
    userId,
    clockInAt: { $gte: start, $lte: end },
  }).lean();

  const totalSeconds = sessions.reduce((acc, s) => acc + (s.totalSeconds || 0), 0);
  return { totalSeconds, sessions };
}

export async function getHoursByDay(userId: string, days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  const sessions = await WorkSession.find({
    userId,
    clockInAt: { $gte: start, $lte: end },
    clockOutAt: { $ne: null },
  }).lean();

  const byDate = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    byDate.set(d.toISOString().slice(0, 10), 0);
  }

  for (const s of sessions) {
    const dateStr = new Date(s.clockInAt).toISOString().slice(0, 10);
    byDate.set(dateStr, (byDate.get(dateStr) ?? 0) + (s.totalSeconds ?? 0));
  }

  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, totalSeconds]) => ({ date, totalSeconds }));
}

export async function getUserAttendance(userId: string, days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const sessions = await WorkSession.find({
    userId,
    clockInAt: { $gte: start },
  })
    .sort({ clockInAt: -1 })
    .limit(100)
    .lean();

  const hoursByDay = await getHoursByDay(userId, days);
  return { sessions, hoursByDay };
}
