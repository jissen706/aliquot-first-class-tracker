import { NextRequest, NextResponse } from "next/server";
import { generateLabelsPDF } from "@/lib/labels";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aliquotIdsParam = searchParams.get("aliquotIds");

    if (!aliquotIdsParam) {
      return NextResponse.json(
        { error: "aliquotIds parameter is required" },
        { status: 400 }
      );
    }

    const aliquotIds = aliquotIdsParam.split(",").filter((id) => id.trim());

    if (aliquotIds.length === 0) {
      return NextResponse.json(
        { error: "At least one aliquot ID is required" },
        { status: 400 }
      );
    }

    const pdfBytes = await generateLabelsPDF(aliquotIds);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="aliquot-labels.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating labels PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate labels PDF" },
      { status: 500 }
    );
  }
}

