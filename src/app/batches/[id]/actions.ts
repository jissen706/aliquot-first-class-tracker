"use server";

import { prisma } from "@/lib/db";
import { generateAliquotCode } from "@/lib/codegen";
import { revalidatePath } from "next/cache";

export async function generateAliquots(batchId: string, formData: FormData) {
  const madeDateStr = formData.get("madeDate") as string;
  const countStr = formData.get("count") as string;
  const volumeStr = formData.get("volume") as string | null;
  const unit = formData.get("unit") as string | null;
  const storageLocation = formData.get("storageLocation") as string | null;

  const madeDate = new Date(madeDateStr);
  const count = parseInt(countStr, 10);

  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  // Get batch info for code generation
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { productName: true, lotNumber: true },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  // Get the next aliquot index for this batch and date
  const existingAliquots = await prisma.aliquot.findMany({
    where: {
      batchId,
      madeDate,
    },
    orderBy: { aliquotIndex: "desc" },
    take: 1,
  });

  const startIndex = existingAliquots.length > 0
    ? existingAliquots[0].aliquotIndex + 1
    : 1;

  // Generate all aliquots
  const aliquots = [];
  for (let i = 0; i < count; i++) {
    const aliquotIndex = startIndex + i;
    const code = await generateAliquotCode(
      batch.productName,
      batch.lotNumber,
      madeDate,
      aliquotIndex
    );

    aliquots.push({
      batchId,
      madeDate,
      aliquotIndex,
      code,
      volume: volumeStr ? parseFloat(volumeStr) : null,
      unit: unit || null,
      storageLocation: storageLocation || null,
      status: "OK" as const,
    });
  }

  // Bulk create
  await prisma.aliquot.createMany({
    data: aliquots,
  });

  revalidatePath(`/batches/${batchId}`);
}

