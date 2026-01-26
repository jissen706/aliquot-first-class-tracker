import { prisma } from "./db";
import { type Prisma } from "@prisma/client";

type EntityType = "ALIQUOT" | "BATCH" | "SAMPLE" | "EXPERIMENT";

export async function logAudit(params: {
  entityType: EntityType;
  entityId: string;
  action: string;
  userId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { entityType, entityId, action, userId, reason, metadata } = params;
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      userId: userId ?? undefined,
      reason: reason ?? undefined,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

export async function getAuditLogs(
  entityType: EntityType,
  entityId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
}
