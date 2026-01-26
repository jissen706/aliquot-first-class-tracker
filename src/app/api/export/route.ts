import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { getAliquotImpact } from "@/lib/impact";
import { getBatchImpact } from "@/lib/impact";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  if (!type) {
    return NextResponse.json({ error: "type required" }, { status: 400 });
  }

  try {
    const wb = new ExcelJS.Workbook();
    if (type === "samples") {
      const samples = await prisma.sample.findMany({
        include: { batch: { select: { lotNumber: true } } },
        orderBy: { name: "asc" },
      });
      const ws = wb.addWorksheet("Samples");
      ws.columns = [
        { header: "id", key: "id", width: 28 },
        { header: "name", key: "name", width: 24 },
        { header: "typeCategory", key: "typeCategory", width: 16 },
        { header: "lotNumber", key: "lotNumber", width: 14 },
        { header: "manufacturer", key: "manufacturer", width: 18 },
        { header: "supplierName", key: "supplierName", width: 18 },
        { header: "supplierUrl", key: "supplierUrl", width: 28 },
        { header: "notes", key: "notes", width: 32 },
      ];
      ws.getRow(1).font = { bold: true };
      for (const s of samples) {
        ws.addRow({
          id: s.id,
          name: s.name,
          typeCategory: s.typeCategory,
          lotNumber: s.batch.lotNumber,
          manufacturer: s.manufacturer,
          supplierName: s.supplierName,
          supplierUrl: s.supplierUrl,
          notes: s.notes,
        });
      }
    } else if (type === "aliquots") {
      const aliquots = await prisma.aliquot.findMany({
        include: {
          sample: { select: { name: true } },
          batch: { select: { lotNumber: true } },
          freezer: { select: { name: true } },
          box: { select: { name: true } },
        },
        orderBy: { aliquotId: "asc" },
      });
      const ws = wb.addWorksheet("Aliquots");
      ws.columns = [
        { header: "id", key: "id", width: 28 },
        { header: "aliquotId", key: "aliquotId", width: 28 },
        { header: "sampleName", key: "sampleName", width: 24 },
        { header: "lotNumber", key: "lotNumber", width: 14 },
        { header: "volume", key: "volume", width: 10 },
        { header: "concentration", key: "concentration", width: 12 },
        { header: "unit", key: "unit", width: 8 },
        { header: "status", key: "status", width: 18 },
        { header: "freezer", key: "freezer", width: 14 },
        { header: "box", key: "box", width: 14 },
        { header: "position", key: "position", width: 10 },
      ];
      ws.getRow(1).font = { bold: true };
      for (const a of aliquots) {
        ws.addRow({
          id: a.id,
          aliquotId: a.aliquotId,
          sampleName: a.sample.name,
          lotNumber: a.batch.lotNumber,
          volume: a.volume,
          concentration: a.concentration,
          unit: a.unit,
          status: a.status,
          freezer: a.freezer?.name,
          box: a.box?.name,
          position: a.position,
        });
      }
    } else if (type === "experiments") {
      const experiments = await prisma.experiment.findMany({
        include: {
          owner: { select: { name: true, email: true } },
          aliquots: { include: { aliquot: { select: { aliquotId: true } } } },
        },
        orderBy: { performedDate: "desc" },
      });
      const ws = wb.addWorksheet("Experiments");
      ws.columns = [
        { header: "id", key: "id", width: 28 },
        { header: "title", key: "title", width: 32 },
        { header: "performedDate", key: "performedDate", width: 14 },
        { header: "ownerName", key: "ownerName", width: 18 },
        { header: "ownerEmail", key: "ownerEmail", width: 24 },
        { header: "notes", key: "notes", width: 32 },
        { header: "aliquotIds", key: "aliquotIds", width: 48 },
      ];
      ws.getRow(1).font = { bold: true };
      for (const e of experiments) {
        ws.addRow({
          id: e.id,
          title: e.title,
          performedDate: e.performedDate.toISOString().slice(0, 10),
          ownerName: e.owner.name,
          ownerEmail: e.owner.email,
          notes: e.notes,
          aliquotIds: e.aliquots.map((ea) => ea.aliquot.aliquotId).join("; "),
        });
      }
    } else if (type === "impact") {
      const aliquots = await prisma.aliquot.findMany({
        select: { id: true, aliquotId: true },
        orderBy: { aliquotId: "asc" },
      });
      const ws = wb.addWorksheet("Impact");
      ws.columns = [
        { header: "aliquotId", key: "aliquotId", width: 28 },
        { header: "experimentCount", key: "experimentCount", width: 16 },
        { header: "experimentTitles", key: "experimentTitles", width: 48 },
      ];
      ws.getRow(1).font = { bold: true };
      for (const a of aliquots) {
        const impact = await getAliquotImpact(a.id);
        ws.addRow({
          aliquotId: a.aliquotId,
          experimentCount: impact.experimentCount,
          experimentTitles: impact.experiments.map((e) => e.title).join("; "),
        });
      }
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    const buf = await wb.xlsx.writeBuffer();
    const buffer = Buffer.from(buf);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}-export.xlsx"`,
      },
    });
  } catch (e) {
    console.error("Export error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}
