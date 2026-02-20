import { AuditLog } from "@/src/db/models";

export async function writeAuditLog(actorUserId: string | null, action: string, details: unknown) {
  await AuditLog.create({
    actorUserId: actorUserId || undefined,
    action,
    details,
  });
}
