"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBatch(formData: FormData) {
  const lotNumber = (formData.get("lotNumber") as string)?.trim();
  if (!lotNumber) throw new Error("Lot number required");

  const manufacturer = (formData.get("manufacturer") as string)?.trim() || null;
  const supplierName = (formData.get("supplierName") as string)?.trim() || null;
  const supplierUrl = (formData.get("supplierUrl") as string)?.trim() || null;
  const receivedStr = (formData.get("receivedDate") as string)?.trim();
  const expiryStr = (formData.get("expiryDate") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  await prisma.batch.create({
    data: {
      lotNumber,
      manufacturer,
      supplierName,
      supplierUrl,
      receivedDate: receivedStr ? new Date(receivedStr) : null,
      expiryDate: expiryStr ? new Date(expiryStr) : null,
      notes,
    },
  });

  revalidatePath("/batches");
}
