import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const freezers = await prisma.freezer.findMany({
    orderBy: { name: "asc" },
    include: { boxes: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json({ freezers });
}
