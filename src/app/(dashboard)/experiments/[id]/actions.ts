"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function acknowledgeAlert(alertId: string, experimentId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) throw new Error("Must be signed in to acknowledge");

  await prisma.alertExperiment.update({
    where: {
      alertId_experimentId: { alertId, experimentId },
    },
    data: { acknowledgedAt: new Date(), acknowledgedById: userId },
  });

  revalidatePath(`/experiments/${experimentId}`);
  revalidatePath("/alerts");
}
