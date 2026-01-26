"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { getAliquotImpact } from "@/lib/impact";
import { revalidatePath } from "next/cache";
import { notifyEmail } from "@/lib/notifications";

export async function updateAliquotStatus(
  aliquotId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  const status = formData.get("status") as string;
  const valid = [
    "PENDING_QC",
    "RELEASED_QC_PASSED",
    "QUARANTINED",
    "CONTAMINATED",
    "CONSUMED",
  ];
  if (!valid.includes(status)) throw new Error("Invalid status");

  const reason = (formData.get("reason") as string)?.trim() || null;

  await prisma.aliquot.update({
    where: { id: aliquotId },
    data: { status: status as (typeof valid)[number] },
  });

  await logAudit({
    entityType: "ALIQUOT",
    entityId: aliquotId,
    action: "STATUS_UPDATE",
    userId,
    reason,
    metadata: { status },
  });

  revalidatePath(`/aliquots/${aliquotId}`);
  revalidatePath("/aliquots");
}

export async function assignLocation(
  aliquotId: string,
  formData: FormData
) {
  const freezerId = (formData.get("freezerId") as string)?.trim() || null;
  const boxId = (formData.get("boxId") as string)?.trim() || null;
  const position = (formData.get("position") as string)?.trim() || null;

  await prisma.aliquot.update({
    where: { id: aliquotId },
    data: { freezerId, boxId, position },
  });

  revalidatePath(`/aliquots/${aliquotId}`);
  revalidatePath("/aliquots");
  revalidatePath("/storage");
}

export async function markAliquotContaminated(
  aliquotId: string,
  reason?: string
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  const aliquot = await prisma.aliquot.findUnique({
    where: { id: aliquotId },
    include: { sample: true, batch: true },
  });
  if (!aliquot) throw new Error("Aliquot not found");

  await prisma.aliquot.update({
    where: { id: aliquotId },
    data: { status: "CONTAMINATED" },
  });

  await logAudit({
    entityType: "ALIQUOT",
    entityId: aliquotId,
    action: "MARK_CONTAMINATED",
    userId,
    reason: reason ?? undefined,
  });

  const impact = await getAliquotImpact(aliquotId);
  const alert = await prisma.alert.create({
    data: {
      type: "CONTAMINATION",
      entityType: "ALIQUOT",
      entityId: aliquotId,
      title: `Aliquot ${aliquot.aliquotId} marked contaminated`,
      message: reason ?? `Aliquot contaminated. ${impact.experimentCount} experiment(s) affected.`,
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
        subject: `Aliquot First-Class: ${aliquot.aliquotId} contaminated`,
        body: `Aliquot ${aliquot.aliquotId} has been marked contaminated. Please check the Impact panel.`,
      });
    }
  }

  revalidatePath(`/aliquots/${aliquotId}`);
  revalidatePath("/aliquots");
  revalidatePath("/alerts");
}
