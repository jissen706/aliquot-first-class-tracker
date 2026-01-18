"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function attachAliquot(experimentId: string, formData: FormData) {
  const aliquotCode = (formData.get("aliquotCode") as string).trim();
  const usageNotes = formData.get("usageNotes") as string | null;

  // Find aliquot by code
  const aliquot = await prisma.aliquot.findUnique({
    where: { code: aliquotCode },
    select: { id: true },
  });

  if (!aliquot) {
    throw new Error(`Aliquot with code "${aliquotCode}" not found`);
  }

  // Check if already attached
  const existing = await prisma.experimentAliquot.findUnique({
    where: {
      experimentId_aliquotId: {
        experimentId,
        aliquotId: aliquot.id,
      },
    },
  });

  if (existing) {
    throw new Error("Aliquot is already attached to this experiment");
  }

  // Attach
  await prisma.experimentAliquot.create({
    data: {
      experimentId,
      aliquotId: aliquot.id,
      usageNotes: usageNotes || null,
    },
  });

  revalidatePath(`/experiments/${experimentId}`);
}

export async function detachAliquot(experimentId: string, aliquotId: string) {
  await prisma.experimentAliquot.delete({
    where: {
      experimentId_aliquotId: {
        experimentId,
        aliquotId,
      },
    },
  });

  revalidatePath(`/experiments/${experimentId}`);
}

