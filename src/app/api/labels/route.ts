import { NextRequest, NextResponse } from "next/server";
import { generateLabelsPDF, generateLabelsXLSX } from "@/lib/labels";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aliquotIdsParam = searchParams.get("aliquotIds");
    const format = (searchParams.get("format") ?? "pdf").toLowerCase();

    if (!aliquotIdsParam) {
      return NextResponse.json(
        { error: "aliquotIds parameter is required" },
        { status: 400 }
      );
    }

    const aliquotIds = aliquotIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
    if (aliquotIds.length === 0) {
      return NextResponse.json(
        { error: "At least one aliquot ID is required" },
        { status: 400 }
      );
    }

    if (format === "xlsx") {
      const buf = await generateLabelsXLSX(aliquotIds);
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="aliquot-labels.xlsx"',
        },
      });
    }

    const pdfBytes = await generateLabelsPDF(aliquotIds);
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="aliquot-labels.pdf"',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to generate labels";
    console.error("Labels API error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
