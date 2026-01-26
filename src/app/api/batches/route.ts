import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const batches = await prisma.batch.findMany({
    orderBy: { lotNumber: "asc" },
    select: { id: true, lotNumber: true },
  });
  return NextResponse.json({ batches });
}
