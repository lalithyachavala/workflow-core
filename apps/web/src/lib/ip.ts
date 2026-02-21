import { NextRequest } from "next/server";

/**
 * Resolves client IP from request, checking common proxy and CDN headers.
 * Order: x-forwarded-for (first hop) > x-real-ip > cf-connecting-ip (Cloudflare)
 * > true-client-ip (Akamai) > x-client-ip > x-cluster-client-ip > fallback.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0].trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const cfConnecting = req.headers.get("cf-connecting-ip");
  if (cfConnecting?.trim()) return cfConnecting.trim();

  const trueClient = req.headers.get("true-client-ip");
  if (trueClient?.trim()) return trueClient.trim();

  const clientIp = req.headers.get("x-client-ip");
  if (clientIp?.trim()) return clientIp.trim();

  const clusterClient = req.headers.get("x-cluster-client-ip");
  if (clusterClient?.trim()) return clusterClient.trim();

  return "0.0.0.0";
}
