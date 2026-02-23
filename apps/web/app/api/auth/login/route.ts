import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { ensureBootstrap } from "@/src/lib/bootstrap";
import { User, Role, LoginHistory } from "@/src/db/models";
import { verifyPassword } from "@/src/lib/password";
import { createAccessToken, createRefreshToken } from "@/src/lib/tokens";
import { checkRateLimit } from "@/src/lib/rate-limit";
import { getClientIp } from "@/src/lib/ip";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  await connectMongo();
  await ensureBootstrap();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }
  const rate = checkRateLimit(parsed.data.email.toLowerCase());
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many attempts." }, { status: 429 });
  }

  const email = parsed.data.email.toLowerCase();
  const user: any = await User.findOne({ email }).lean();
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!isValid) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const roles = await Role.find({ _id: { $in: user.roleIds } }).lean();
  const roleNames = roles.map((role) => role.name);

  // Record login from this device/location for the user (any device, any location)
  const isEmployee = roleNames.includes("employee");
  const isAdmin = roleNames.includes("admin");
  const recordLoginHistory = isEmployee && !isAdmin;

  if (recordLoginHistory) {
    const publicIp = req.headers.get("X-Public-Ip") || req.headers.get("x-public-ip");
    const ipAddress = publicIp || getClientIp(req) || "Unknown";

    // System name parsing
    const systemHeader = req.headers.get("X-Device-System") || req.headers.get("x-device-system");
    let systemName = "Unknown";

    if (systemHeader) {
      systemName = systemHeader;
    } else {
      const userAgent = req.headers.get("user-agent") || "";
      const parser = new UAParser(userAgent);
      const os = parser.getOS();
      const browser = parser.getBrowser();
      const osName = os.name ? `${os.name} ${os.version || ""}`.trim() : "";
      const browserName = browser.name ? browser.name : "";
      if (osName || browserName) {
        systemName = [osName, browserName].filter(Boolean).join(" - ");
      }
    }

    let location = "Unknown Location";
    if (ipAddress && ipAddress !== "127.0.0.1" && ipAddress !== "::1" && ipAddress !== "::ffff:127.0.0.1") {
      try {
        // Try to get highly accurate geographical location first
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.status === "success") {
          location = [geoData.city, geoData.regionName, geoData.country].filter(Boolean).join("/");
        } else {
          // Fallback to local geoip db if network fetch fails
          const geo = geoip.lookup(ipAddress);
          if (geo) {
            location = [geo.city, geo.region, geo.country].filter(Boolean).join("/");
          }
        }
      } catch (err) {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          location = [geo.city, geo.region, geo.country].filter(Boolean).join("/");
        }
      }

      // If it only has mostly empty parts like "//IN" or identical fallbacks, sanitize it
      if (location === "//" || location === "") {
        location = "Unknown Location";
      }
    } else {
      location = "Localhost";
    }

    const now = new Date();
    // E.g. "Feb 22, 2026, 12:30:15 AM"
    const loginTimeFormatted = now.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    await LoginHistory.create({
      userId: user._id,
      loginTime: now,
      loginTimeFormatted,
      ipAddress,
      systemName,
      location,
    });
  }

  const accessToken = await createAccessToken({
    sub: user._id.toString(),
    email: user.email,
    roles: roleNames,
  });
  const refreshToken = await createRefreshToken(user._id.toString());

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      roles: roleNames,
    },
  });
}
