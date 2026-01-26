"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createExperiment(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) throw new Error("Must be signed in to create experiment");

  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title required");

  const performedDateStr = formData.get("performedDate") as string;
  const performedDate = performedDateStr ? new Date(performedDateStr) : new Date();
  const notes = (formData.get("notes") as string)?.trim() || null;

  await prisma.experiment.create({
    data: {
      title,
      performedDate,
      notes,
      ownerId: userId,
    },
  });

  revalidatePath("/experiments");
}

export async function attachAliquot(
  experimentId: string,
  aliquotIdOrCode: string,
  usageNotes?: string | null
) {
  const aliquot = await prisma.aliquot.findFirst({
    where: {
      OR: [
        { id: aliquotIdOrCode },
        { aliquotId: aliquotIdOrCode },
      ],
    },
    select: { id: true },
  });
  if (!aliquot) throw new Error("Aliquot not found");

  const existing = await prisma.experimentAliquot.findUnique({
    where: {
      experimentId_aliquotId: { experimentId, aliquotId: aliquot.id },
    },
  });
  if (existing) throw new Error("Aliquot already attached");

  await prisma.experimentAliquot.create({
    data: {
      experimentId,
      aliquotId: aliquot.id,
      usageNotes: usageNotes ?? null,
    },
  });

  revalidatePath(`/experiments/${experimentId}`);
}

export async function attachAliquotAction(formData: FormData) {
  const experimentId = formData.get("experimentId") as string;
  if (!experimentId) throw new Error("Experiment ID required");
  const aliquotIdOrCode = (formData.get("aliquotId") as string)?.trim();
  if (!aliquotIdOrCode) throw new Error("Aliquot ID required");
  const usageNotes = (formData.get("usageNotes") as string)?.trim() || null;
  await attachAliquot(experimentId, aliquotIdOrCode, usageNotes);
}

export async function detachAliquot(experimentId: string, aliquotId: string) {
  await prisma.experimentAliquot.delete({
    where: {
      experimentId_aliquotId: { experimentId, aliquotId },
    },
  });
  revalidatePath(`/experiments/${experimentId}`);
}

export async function detachAliquotAction(formData: FormData) {
  const experimentId = formData.get("experimentId") as string;
  const aliquotId = formData.get("aliquotId") as string;
  if (!experimentId || !aliquotId) throw new Error("IDs required");
  await detachAliquot(experimentId, aliquotId);
}

export async function updateExperiment(
  experimentId: string,
  formData: FormData
) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title required");
  const performedDateStr = formData.get("performedDate") as string;
  const performedDate = performedDateStr ? new Date(performedDateStr) : new Date();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const outputsStr = (formData.get("outputs") as string)?.trim() || null;

  await prisma.experiment.update({
    where: { id: experimentId },
    data: { title, performedDate, notes, outputs: outputsStr },
  });
  revalidatePath(`/experiments/${experimentId}`);
}
