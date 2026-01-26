import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  parseSamplesXLSX,
  parseAliquotsXLSX,
  type SampleImportRow,
  type AliquotImportRow,
} from "@/lib/xlsx";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string;
  const commit = formData.get("commit") === "true";

  if (!file || !type) {
    return NextResponse.json(
      { error: "file and type required" },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());

  try {
    if (type === "samples") {
      const { rows, errors } = await parseSamplesXLSX(buf);
      if (!commit) {
        return NextResponse.json({ rows, errors, preview: true });
      }
      const imported: string[] = [];
      const commitErrors: { row: number; message: string }[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i] as SampleImportRow;
        try {
          let batchId = r.batchId ?? null;
          if (!batchId && r.lotNumber) {
            const b = await prisma.batch.findFirst({
              where: { lotNumber: r.lotNumber },
              select: { id: true },
            });
            batchId = b?.id ?? null;
          }
          if (!batchId) {
            commitErrors.push({
              row: i + 2,
              message: `No batch found for lot ${r.lotNumber ?? "(none)"}. Create batch first.`,
            });
            continue;
          }
          await prisma.sample.create({
            data: {
              name: r.name,
              batchId,
              typeCategory: r.typeCategory ?? null,
              manufacturer: r.manufacturer ?? null,
              supplierName: r.supplierName ?? null,
              supplierUrl: r.supplierUrl ?? null,
              notes: r.notes ?? null,
            },
          });
          imported.push(r.name);
        } catch (e) {
          commitErrors.push({
            row: i + 2,
            message: e instanceof Error ? e.message : "Import failed",
          });
        }
      }
      return NextResponse.json({
        imported: imported.length,
        errors: [...errors, ...commitErrors],
      });
    }

    if (type === "aliquots") {
      const { rows, errors } = await parseAliquotsXLSX(buf);
      if (!commit) {
        return NextResponse.json({ rows, errors, preview: true });
      }
      const imported: string[] = [];
      const commitErrors: { row: number; message: string }[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i] as AliquotImportRow;
        try {
          let sampleId = r.sampleId ?? null;
          if (!sampleId && r.sampleName) {
            const s = await prisma.sample.findFirst({
              where: { name: r.sampleName },
              include: { batch: true },
            });
            sampleId = s?.id ?? null;
            if (!sampleId) {
              commitErrors.push({
                row: i + 2,
                message: `Sample "${r.sampleName}" not found.`,
              });
              continue;
            }
          }
          if (!sampleId) {
            commitErrors.push({
              row: i + 2,
              message: "sampleId or sampleName required",
            });
            continue;
          }
          const sample = await prisma.sample.findUnique({
            where: { id: sampleId },
            include: { batch: true },
          });
          if (!sample) {
            commitErrors.push({ row: i + 2, message: "Sample not found." });
            continue;
          }
          const batchId = r.batchId ?? sample.batchId;
          const existing = await prisma.aliquot.findUnique({
            where: { aliquotId: r.aliquotId },
            select: { id: true },
          });
          if (existing) {
            commitErrors.push({
              row: i + 2,
              message: `Aliquot ${r.aliquotId} already exists.`,
            });
            continue;
          }
          await prisma.aliquot.create({
            data: {
              aliquotId: r.aliquotId,
              sampleId,
              batchId,
              volume: r.volume ?? null,
              concentration: r.concentration ?? null,
              unit: r.unit ?? null,
              status: (r.status as "PENDING_QC") ?? "PENDING_QC",
              createdById: userId,
            },
          });
          imported.push(r.aliquotId);
        } catch (e) {
          commitErrors.push({
            row: i + 2,
            message: e instanceof Error ? e.message : "Import failed",
          });
        }
      }
      return NextResponse.json({
        imported: imported.length,
        errors: [...errors, ...commitErrors],
      });
    }

    return NextResponse.json({ error: "type must be samples or aliquots" }, { status: 400 });
  } catch (e) {
    console.error("Import error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import failed" },
      { status: 500 }
    );
  }
}
