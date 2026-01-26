import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import ExcelJS from "exceljs";
import { prisma } from "./db";

interface LabelRow {
  aliquotId: string;
  sampleName: string;
  concentration: string;
  date: string;
}

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, fontSize: number, maxWidth: number): string[] {
  if (text.includes("-")) {
    const parts = text.split("-");
    const lines: string[] = [];
    let currentLine = "";

    for (const part of parts) {
      const testLine = currentLine ? `${currentLine}-${part}` : part;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = part;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);
    return lines.length > 0 ? lines : [text];
  }

  const chars = text.split("");
  const lines: string[] = [];
  let currentLine = "";
  for (const char of chars) {
    const testLine = currentLine + char;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
}

async function qrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(code, { width: 200, margin: 1, color: { dark: "#000000", light: "#FFFFFF" } });
}

async function fetchLabelData(aliquotIds: string[]): Promise<LabelRow[]> {
  const aliquots = await prisma.aliquot.findMany({
    where: { id: { in: aliquotIds } },
    include: { sample: true },
    orderBy: { aliquotId: "asc" },
  });
  return aliquots.map((a) => ({
    aliquotId: a.aliquotId,
    sampleName: a.sample.name,
    concentration: a.concentration != null ? `${a.concentration}${a.unit ?? ""}` : "",
    date: a.createdAt.toISOString().slice(0, 10),
  }));
}

/**
 * PDF label sheet: sample name, aliquot_id, concentration, date, QR.
 * 3 columns x N rows.
 */
export async function generateLabelsPDF(aliquotIds: string[]): Promise<Uint8Array> {
  const rows = await fetchLabelData(aliquotIds);
  if (rows.length === 0) throw new Error("No aliquots found");

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  const cols = 3;
  const lw = 190;
  const lh = 100;
  const margin = 20;
  const gap = 10;
  const rowsPerPage = 7;

  let r = 0;
  let c = 0;
  let page = pdf.addPage([612, 792]);
  const textW = lw - 75;
  const textX = 70;

  for (const row of rows) {
    const x = margin + c * (lw + gap);
    const y = page.getHeight() - margin - (r + 1) * (lh + gap);

    page.drawRectangle({
      x,
      y,
      width: lw,
      height: lh,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    const qrUrl = await qrDataUrl(row.aliquotId);
    const qrImg = await pdf.embedPng(qrUrl.split(",")[1] as string);
    page.drawImage(qrImg, { x: x + 5, y: y + 38, width: 55, height: 55 });

    let ty = y + lh - 8;
    const codeLines = wrapText(row.aliquotId, mono, 7, textW);
    for (let i = 0; i < Math.min(codeLines.length, 2); i++) {
      page.drawText(codeLines[i], { x: x + textX, y: ty - i * 10, size: 7, font: mono, color: rgb(0, 0, 0), maxWidth: textW });
    }
    ty -= Math.min(codeLines.length, 2) * 10 + 4;
    page.drawText(row.sampleName, { x: x + textX, y: ty, size: 7, font: font, color: rgb(0.2, 0.2, 0.2), maxWidth: textW });
    ty -= 9;
    if (row.concentration) page.drawText(row.concentration, { x: x + textX, y: ty, size: 6, font: font, color: rgb(0.4, 0.4, 0.4), maxWidth: textW });
    ty -= 8;
    page.drawText(row.date, { x: x + textX, y: ty, size: 6, font: font, color: rgb(0.4, 0.4, 0.4), maxWidth: textW });

    c++;
    if (c >= cols) {
      c = 0;
      r++;
      if (r >= rowsPerPage) {
        page = pdf.addPage([612, 792]);
        r = 0;
      }
    }
  }

  return pdf.save();
}

/**
 * XLSX label sheet: columns Sample name, Aliquot ID, Concentration, Date.
 * Optional column "QR data" = aliquot_id for barcode/QR generation elsewhere.
 */
export async function generateLabelsXLSX(aliquotIds: string[]): Promise<Buffer> {
  const rows = await fetchLabelData(aliquotIds);
  if (rows.length === 0) throw new Error("No aliquots found");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Labels", { views: [{ state: "frozen", ySplit: 1 }] });

  ws.columns = [
    { header: "Sample name", key: "sampleName", width: 24 },
    { header: "Aliquot ID", key: "aliquotId", width: 28 },
    { header: "Concentration", key: "concentration", width: 14 },
    { header: "Date", key: "date", width: 12 },
    { header: "QR data", key: "qrData", width: 28 },
  ];
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };

  for (const row of rows) {
    ws.addRow({
      sampleName: row.sampleName,
      aliquotId: row.aliquotId,
      concentration: row.concentration,
      date: row.date,
      qrData: row.aliquotId,
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
