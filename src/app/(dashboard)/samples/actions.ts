"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSample(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name required");

  const batchId = formData.get("batchId") as string;
  if (!batchId) throw new Error("Batch required");

  const typeCategory = (formData.get("typeCategory") as string)?.trim() || null;
  const manufacturer = (formData.get("manufacturer") as string)?.trim() || null;
  const supplierName = (formData.get("supplierName") as string)?.trim() || null;
  const supplierUrl = (formData.get("supplierUrl") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  await prisma.sample.create({
    data: {
      name,
      batchId,
      typeCategory,
      manufacturer,
      supplierName,
      supplierUrl,
      notes,
    },
  });

  revalidatePath("/samples");
}

export async function updateSample(
  id: string,
  formData: FormData
) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name required");

  const batchId = formData.get("batchId") as string;
  if (!batchId) throw new Error("Batch required");

  const typeCategory = (formData.get("typeCategory") as string)?.trim() || null;
  const manufacturer = (formData.get("manufacturer") as string)?.trim() || null;
  const supplierName = (formData.get("supplierName") as string)?.trim() || null;
  const supplierUrl = (formData.get("supplierUrl") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  await prisma.sample.update({
    where: { id },
    data: {
      name,
      batchId,
      typeCategory,
      manufacturer,
      supplierName,
      supplierUrl,
      notes,
    },
  });

  revalidatePath("/samples");
  revalidatePath(`/samples/${id}/edit`);
}
