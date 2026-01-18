"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createExperiment(formData: FormData) {
  const title = formData.get("title") as string;
  const performedDateStr = formData.get("performedDate") as string;
  const operator = formData.get("operator") as string | null;
  const notes = formData.get("notes") as string | null;

  const performedDate = new Date(performedDateStr);

  await prisma.experiment.create({
    data: {
      title,
      performedDate,
      operator: operator || null,
      notes: notes || null,
    },
  });

  revalidatePath("/experiments");
}

