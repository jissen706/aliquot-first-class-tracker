"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { getBatchImpact } from "@/lib/impact";
import { revalidatePath } from "next/cache";
import { notifyEmail } from "@/lib/notifications";

export async function releaseBatch(batchId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { aliquots: true },
  });
  if (!batch) throw new Error("Batch not found");
  if (batch.qcStatus === "RELEASED_QC_PASSED") throw new Error("Batch already released");
  if (batch.qcStatus === "FAILED_QC") throw new Error("Batch failed QC; cannot release");

  await prisma.$transaction([
    prisma.batch.update({
      where: { id: batchId },
      data: { qcStatus: "RELEASED_QC_PASSED" },
    }),
    ...batch.aliquots.map((a) =>
      prisma.aliquot.update({
        where: { id: a.id },
        data: { status: "RELEASED_QC_PASSED" },
      })
    ),
  ]);

  await logAudit({
    entityType: "BATCH",
    entityId: batchId,
    action: "QC_RELEASE",
    userId,
    reason: "Batch released (QC Passed)",
  });

  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/batches");
}

export async function failBatchQC(batchId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { aliquots: true },
  });
  if (!batch) throw new Error("Batch not found");
  if (batch.qcStatus === "FAILED_QC") throw new Error("Batch already failed QC");
  if (batch.qcStatus === "RELEASED_QC_PASSED") throw new Error("Cannot fail released batch");

  await prisma.$transaction([
    prisma.batch.update({
      where: { id: batchId },
      data: { qcStatus: "FAILED_QC" },
    }),
    ...batch.aliquots.map((a) =>
      prisma.aliquot.update({
        where: { id: a.id },
        data: { status: "QUARANTINED" },
      })
    ),
  ]);

  await logAudit({
    entityType: "BATCH",
    entityId: batchId,
    action: "QC_FAIL",
    userId,
    reason: "Batch failed QC; aliquots quarantined",
  });

  const impact = await getBatchImpact(batchId);
  const alert = await prisma.alert.create({
    data: {
      type: "QC_FAILURE",
      entityType: "BATCH",
      entityId: batchId,
      title: `Batch ${batch.lotNumber} failed QC`,
      message: `Aliquots quarantined. ${impact.experimentCount} experiment(s) affected.`,
      createdById: userId ?? undefined,
    },
  });

  for (const e of impact.experiments) {
    await prisma.alertExperiment.create({
      data: { alertId: alert.id, experimentId: e.id },
    });
  }

  for (const uid of impact.affectedUserIds) {
    const u = await prisma.user.findUnique({
      where: { id: uid },
      select: { email: true },
    });
    if (u?.email) {
      await notifyEmail({
        to: u.email,
        subject: `Aliquot First-Class: Batch ${batch.lotNumber} failed QC`,
        body: `Batch ${batch.lotNumber} has been marked as Failed QC. Aliquots are quarantined. Please check the Impact panel.`,
      });
    }
  }

  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/batches");
  revalidatePath("/alerts");
}
