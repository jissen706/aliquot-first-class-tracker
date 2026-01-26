import ExcelJS from "exceljs";
import { z } from "zod";
import { prisma } from "./db";

// ---------- Sample import ----------
export const sampleImportSchema = z.object({
  name: z.string().min(1, "Name required"),
  typeCategory: z.string().optional(),
  batchId: z.string().optional(),
  lotNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  supplierName: z.string().optional(),
  supplierUrl: z.string().optional(),
  creationDate: z.string().optional(),
  notes: z.string().optional(),
});

export type SampleImportRow = z.infer<typeof sampleImportSchema>;

export async function parseSamplesXLSX(buffer: Buffer): Promise<{
  rows: SampleImportRow[];
  errors: { row: number; message: string }[];
}> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return { rows: [], errors: [{ row: 0, message: "No worksheet" }] };

  const rows: SampleImportRow[] = [];
  const errors: { row: number; message: string }[] = [];
  const headers = new Map<string, number>();
  const rawHeaders = ws.getRow(1)?.values as unknown[];
  if (Array.isArray(rawHeaders)) {
    rawHeaders.forEach((h, i) => {
      if (typeof h === "string") headers.set(h.trim().toLowerCase(), i);
    });
  }

  const col = (key: string) => headers.get(key) ?? -1;
  const get = (row: ExcelJS.Row, k: string): string => {
    const i = col(k);
    if (i < 0) return "";
    const v = row.getCell(i).value;
    if (v == null) return "";
    return String(v).trim();
  };

  for (let r = 2; r <= (ws.rowCount ?? 2); r++) {
    const row = ws.getRow(r);
    const name = get(row, "name");
    if (!name) continue;

    const raw: Record<string, unknown> = {
      name,
      typeCategory: get(row, "type category") || get(row, "typecategory") || undefined,
      lotNumber: get(row, "lot number") || get(row, "lotnumber") || undefined,
      manufacturer: get(row, "manufacturer") || undefined,
      supplierName: get(row, "supplier name") || get(row, "suppliername") || undefined,
      supplierUrl: get(row, "supplier url") || get(row, "supplierurl") || undefined,
      creationDate: get(row, "creation date") || get(row, "creationdate") || undefined,
      notes: get(row, "notes") || undefined,
    };

    const parsed = sampleImportSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({ row: r, message: parsed.error.errors[0]?.message ?? "Invalid row" });
      continue;
    }
    rows.push(parsed.data);
  }

  return { rows, errors };
}

// ---------- Aliquot import ----------
export const aliquotImportSchema = z.object({
  aliquotId: z.string().min(1, "Aliquot ID required"),
  sampleId: z.string().optional(),
  sampleName: z.string().optional(),
  batchId: z.string().optional(),
  volume: z.coerce.number().optional(),
  concentration: z.coerce.number().optional(),
  unit: z.string().optional(),
  status: z.enum(["PENDING_QC", "RELEASED_QC_PASSED", "QUARANTINED", "CONTAMINATED", "CONSUMED"]).optional(),
  freezerName: z.string().optional(),
  boxName: z.string().optional(),
  position: z.string().optional(),
  createdAt: z.string().optional(),
});

export type AliquotImportRow = z.infer<typeof aliquotImportSchema>;

export async function parseAliquotsXLSX(buffer: Buffer): Promise<{
  rows: AliquotImportRow[];
  errors: { row: number; message: string }[];
}> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return { rows: [], errors: [{ row: 0, message: "No worksheet" }] };

  const rows: AliquotImportRow[] = [];
  const errors: { row: number; message: string }[] = [];
  const headers = new Map<string, number>();
  const rawHeaders = ws.getRow(1)?.values as unknown[];
  if (Array.isArray(rawHeaders)) {
    rawHeaders.forEach((h, i) => {
      if (typeof h === "string") headers.set(h.trim().toLowerCase().replace(/\s+/g, ""), i);
    });
  }

  const col = (key: string) => headers.get(key) ?? headers.get(key.replace(/\s/g, "")) ?? -1;
  const get = (row: ExcelJS.Row, k: string): string => {
    const i = col(k);
    if (i < 0) return "";
    const v = row.getCell(i).value;
    if (v == null) return "";
    return String(v).trim();
  };

  for (let r = 2; r <= (ws.rowCount ?? 2); r++) {
    const row = ws.getRow(r);
    const aliquotId = get(row, "aliquotid") || get(row, "aliquot id");
    if (!aliquotId) continue;

    const raw: Record<string, unknown> = {
      aliquotId,
      sampleId: get(row, "sampleid") || undefined,
      sampleName: get(row, "samplename") || undefined,
      batchId: get(row, "batchid") || undefined,
      volume: get(row, "volume") ? Number(get(row, "volume")) : undefined,
      concentration: get(row, "concentration") ? Number(get(row, "concentration")) : undefined,
      unit: get(row, "unit") || undefined,
      status: (get(row, "status") || undefined) as AliquotImportRow["status"],
      freezerName: get(row, "freezername") || undefined,
      boxName: get(row, "boxname") || undefined,
      position: get(row, "position") || undefined,
      createdAt: get(row, "createdat") || undefined,
    };

    const parsed = aliquotImportSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({ row: r, message: parsed.error.errors[0]?.message ?? "Invalid row" });
      continue;
    }
    rows.push(parsed.data);
  }

  return { rows, errors };
}

// ---------- Templates ----------
export async function createSamplesTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Samples");
  ws.columns = [
    { header: "name", key: "name", width: 24 },
    { header: "type category", key: "typeCategory", width: 16 },
    { header: "lot number", key: "lotNumber", width: 14 },
    { header: "manufacturer", key: "manufacturer", width: 18 },
    { header: "supplier name", key: "supplierName", width: 18 },
    { header: "supplier url", key: "supplierUrl", width: 28 },
    { header: "creation date", key: "creationDate", width: 14 },
    { header: "notes", key: "notes", width: 32 },
  ];
  ws.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function createAliquotsTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Aliquots");
  ws.columns = [
    { header: "aliquot id", key: "aliquotId", width: 28 },
    { header: "sample id", key: "sampleId", width: 28 },
    { header: "sample name", key: "sampleName", width: 24 },
    { header: "batch id", key: "batchId", width: 28 },
    { header: "volume", key: "volume", width: 10 },
    { header: "concentration", key: "concentration", width: 14 },
    { header: "unit", key: "unit", width: 8 },
    { header: "status", key: "status", width: 18 },
    { header: "freezer name", key: "freezerName", width: 14 },
    { header: "box name", key: "boxName", width: 14 },
    { header: "position", key: "position", width: 10 },
    { header: "created at", key: "createdAt", width: 12 },
  ];
  ws.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
