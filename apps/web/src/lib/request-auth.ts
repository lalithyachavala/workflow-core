import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/src/lib/tokens";
import { enforceUserPermission } from "@/src/security/casbin/enforcer";

export async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring("Bearer ".length);
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requirePermission(
  req: NextRequest,
  resource: string,
  action: string,
) {
  const user = await requireAuth(req);
  if (!user?.sub) {
    return { allowed: false, user: null, unauthenticated: true };
  }

  const allowed = await enforceUserPermission(user.sub, resource, action);
  return { allowed, user, unauthenticated: false };
}
