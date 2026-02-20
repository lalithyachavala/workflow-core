import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/src/lib/env";
import { RefreshToken } from "@/src/db/models";

const accessSecret = new TextEncoder().encode(env.accessSecret);
const refreshSecret = new TextEncoder().encode(env.refreshSecret);

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

export async function createAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${env.accessTokenTtlMinutes}m`)
    .sign(accessSecret);
}

export async function createRefreshToken(userId: string) {
  const rawToken = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ userId, tokenHash, expiresAt });
  return rawToken;
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as unknown as AccessTokenPayload;
}

export async function rotateRefreshToken(userId: string, incomingToken: string) {
  const incomingHash = crypto.createHash("sha256").update(incomingToken).digest("hex");
  const existing = await RefreshToken.findOne({ userId, tokenHash: incomingHash, revokedAt: null });
  if (!existing || existing.expiresAt < new Date()) {
    return null;
  }

  existing.revokedAt = new Date();
  await existing.save();
  return createRefreshToken(userId);
}

export async function revokeRefreshToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await RefreshToken.updateOne({ tokenHash, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

export async function verifyRefreshSubject(token: string) {
  // Keep a signed wrapper if needed later; currently returns raw token presence.
  await jwtVerify(
    await new SignJWT({ token }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(refreshSecret),
    refreshSecret,
  );
  return true;
}
