import geoip from "geoip-lite";
import { AttendanceEvent, Device, WorkSession } from "@/src/db/models";
import { env } from "@/src/lib/env";
import { computeTotalSeconds } from "@/src/attendance/math";

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

function geoFromIp(ip: string) {
  const lookup = geoip.lookup(ip);
  if (!lookup) {
    return { country: env.geoFallbackCountry, city: "", ll: [] as number[] };
  }

  return {
    country: lookup.country || env.geoFallbackCountry,
    city: lookup.city || "",
    ll: lookup.ll || [],
  };
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
    geo: geoFromIp(params.ip),
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
    geo: geoFromIp(params.ip),
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
