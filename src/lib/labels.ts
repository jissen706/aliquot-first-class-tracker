import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "./db";

interface AliquotLabel {
  code: string;
  productName?: string;
  lotNumber?: string;
}

/**
 * Wraps text to fit within a specified width
 * For codes, breaks at dashes for readability
 */
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  // For codes with dashes, try breaking at dash boundaries first
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

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  }

  // For regular text, wrap character by character
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

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Generates QR code as data URL
 */
async function generateQRDataURL(code: string): Promise<string> {
  try {
    return await QRCode.toDataURL(code, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generates a PDF label sheet with aliquot labels
 * 3 columns x N rows layout
 */
export async function generateLabelsPDF(aliquotIds: string[]): Promise<Uint8Array> {
  // Fetch aliquots with batch info
  const aliquots = await prisma.aliquot.findMany({
    where: { id: { in: aliquotIds } },
    include: { batch: true },
    orderBy: { code: "asc" },
  });

  if (aliquots.length === 0) {
    throw new Error("No aliquots found");
  }

  const labels: AliquotLabel[] = aliquots.map((a) => ({
    code: a.code,
    productName: a.batch.productName,
    lotNumber: a.batch.lotNumber,
  }));

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const columns = 3;
  const labelWidth = 190;
  const labelHeight = 100; // Increased height
  const marginX = 20;
  const marginY = 20;
  const spacingX = 10;
  const spacingY = 10;
  const rowsPerPage = 7; // Adjusted for taller labels

  let row = 0;
  let col = 0;
  let page = pdfDoc.addPage([612, 792]); // US Letter size

  for (const label of labels) {
    const x = marginX + col * (labelWidth + spacingX);
    const y = page.getHeight() - marginY - (row + 1) * (labelHeight + spacingY);

    // Draw label border (optional, light gray)
    page.drawRectangle({
      x,
      y,
      width: labelWidth,
      height: labelHeight,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // Generate QR code
    const qrDataURL = await generateQRDataURL(label.code);
    const qrImage = await pdfDoc.embedPng(qrDataURL.split(",")[1] as string);

    // Draw QR code (left side, 55x55 - slightly smaller)
    page.drawImage(qrImage, {
      x: x + 5,
      y: y + 40,
      width: 55,
      height: 55,
    });

    // Calculate text area width (more space for text)
    const textAreaX = x + 70;
    const textAreaWidth = labelWidth - 75;

    // Draw code text (right side, top area) - use monospace and smaller size, allow wrapping
    const codeText = label.code;
    const codeFontSize = 7; // Smaller font to fit long codes
    const codeLines = wrapText(codeText, monoFont, codeFontSize, textAreaWidth);
    
    // Draw code lines from top, going down (subtract from y to go down in PDF coordinates)
    const codeStartY = y + labelHeight - 8; // Start near top
    const lineSpacing = codeFontSize + 3;
    for (let i = 0; i < Math.min(codeLines.length, 3); i++) {
      page.drawText(codeLines[i], {
        x: textAreaX,
        y: codeStartY - (i * lineSpacing),
        size: codeFontSize,
        font: monoFont,
        color: rgb(0, 0, 0),
        maxWidth: textAreaWidth,
      });
    }

    // Draw product/lot info if available (smaller font, at bottom area)
    if (label.productName) {
      const infoText = `${label.productName} (Lot: ${label.lotNumber || "N/A"})`;
      const infoFontSize = 7;
      const infoLines = wrapText(infoText, font, infoFontSize, textAreaWidth);
      const infoStartY = y + 30; // Start near bottom
      const infoLineSpacing = infoFontSize + 2;
      for (let i = 0; i < Math.min(infoLines.length, 2); i++) {
        page.drawText(infoLines[i], {
          x: textAreaX,
          y: infoStartY - (i * infoLineSpacing),
          size: infoFontSize,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
          maxWidth: textAreaWidth,
        });
      }
    }

    // Move to next position
    col++;
    if (col >= columns) {
      col = 0;
      row++;

      // Check if we need a new page
      if (row >= rowsPerPage) {
        page = pdfDoc.addPage([612, 792]);
        row = 0;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

