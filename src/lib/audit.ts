import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ARCHIVE"
  | "RESTORE"
  | "MOVEMENT";

export async function writeAudit(args: {
  entityType: string;
  entityId: string;
  action: AuditAction;
  actor: CurrentUser;
  before?: unknown;
  after?: unknown;
  requestId?: string;
}) {
  await db.insert(auditLogs).values({
    entityType: args.entityType,
    entityId: args.entityId,
    action: args.action,
    actorSsoUserId: args.actor.id,
    before: (args.before ?? null) as never,
    after: (args.after ?? null) as never,
    requestId: args.requestId ?? null,
  });
}
