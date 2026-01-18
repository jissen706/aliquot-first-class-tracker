"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAliquotStatus(aliquotId: string, formData: FormData) {
  const status = formData.get("status") as "OK" | "QUARANTINED" | "CONTAMINATED" | "CONSUMED";

  if (!["OK", "QUARANTINED", "CONTAMINATED", "CONSUMED"].includes(status)) {
    throw new Error("Invalid status");
  }

  await prisma.aliquot.update({
    where: { id: aliquotId },
    data: { status },
  });

  const aliquot = await prisma.aliquot.findUnique({
    where: { id: aliquotId },
    select: { batchId: true },
  });

  if (aliquot) {
    revalidatePath(`/aliquots/${aliquotId}`);
    revalidatePath(`/batches/${aliquot.batchId}`);
  }
}

