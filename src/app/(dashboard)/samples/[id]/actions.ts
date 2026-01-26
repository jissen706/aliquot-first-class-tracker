"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateAliquotId } from "@/lib/codegen";
import { revalidatePath } from "next/cache";

export async function generateAliquots(sampleId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  const sample = await prisma.sample.findUnique({
    where: { id: sampleId },
    include: { batch: true },
  });
  if (!sample) throw new Error("Sample not found");

  const madeDateStr = formData.get("madeDate") as string;
  const count = Math.min(100, Math.max(1, Number(formData.get("count")) || 1));
  const volume = (formData.get("volume") as string)?.trim()
    ? Number(formData.get("volume"))
    : null;
  const unit = (formData.get("unit") as string)?.trim() || null;
  const concentration = (formData.get("concentration") as string)?.trim()
    ? Number(formData.get("concentration"))
    : null;

  const madeDate = madeDateStr ? new Date(madeDateStr) : new Date();
  const lotNumber = sample.batch.lotNumber;

  const existing = await prisma.aliquot.findMany({
    where: { sampleId, batchId: sample.batchId },
    orderBy: { aliquotId: "asc" },
  });
  const nextIndex = existing.length + 1;

  for (let i = 0; i < count; i++) {
    const idx = nextIndex + i;
    const aliquotId = await generateAliquotId(
      sample.name,
      lotNumber,
      madeDate,
      idx
    );
    await prisma.aliquot.create({
      data: {
        aliquotId,
        sampleId,
        batchId: sample.batchId,
        volume,
        unit,
        concentration,
        status: "PENDING_QC",
        createdById: userId ?? undefined,
      },
    });
  }

  revalidatePath(`/samples/${sampleId}/edit`);
  revalidatePath("/samples");
  revalidatePath("/aliquots");
  revalidatePath(`/batches/${sample.batchId}`);
}
