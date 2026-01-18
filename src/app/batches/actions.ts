"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBatch(formData: FormData) {
  const vendor = formData.get("vendor") as string;
  const productName = formData.get("productName") as string;
  const catalogNumber = formData.get("catalogNumber") as string | null;
  const lotNumber = formData.get("lotNumber") as string;
  const receivedDateStr = formData.get("receivedDate") as string;
  const expiryDateStr = formData.get("expiryDate") as string | null;
  const notes = formData.get("notes") as string | null;

  const receivedDate = new Date(receivedDateStr);
  const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

  await prisma.batch.create({
    data: {
      vendor,
      productName,
      catalogNumber: catalogNumber || null,
      lotNumber,
      receivedDate,
      expiryDate,
      notes: notes || null,
    },
  });

  revalidatePath("/batches");
}

