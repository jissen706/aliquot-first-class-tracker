"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFreezer(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name required");
  await prisma.freezer.create({ data: { name } });
  revalidatePath("/storage");
}

export async function createBox(formData: FormData) {
  const freezerId = formData.get("freezerId") as string;
  const boxName = (formData.get("boxName") as string)?.trim();
  if (!freezerId || !boxName) throw new Error("Freezer and box name required");
  const rows = Math.max(1, Math.min(24, Number(formData.get("rows")) || 8));
  const cols = Math.max(1, Math.min(24, Number(formData.get("cols")) || 12));
  await prisma.box.create({
    data: { freezerId, name: boxName, rows, cols },
  });
  revalidatePath("/storage");
}
