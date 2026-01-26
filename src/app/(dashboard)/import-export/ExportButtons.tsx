"use client";

import { useState } from "react";

export function ExportButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function exportJson(path: string, filename: string) {
    setLoading(path);
    try {
      const res = await fetch(`/api/export?type=${path}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => exportJson("samples", "samples-export.xlsx")}
        disabled={!!loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "samples" ? "Exporting…" : "Export Samples (XLSX)"}
      </button>
      <button
        type="button"
        onClick={() => exportJson("aliquots", "aliquots-export.xlsx")}
        disabled={!!loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "aliquots" ? "Exporting…" : "Export Aliquots (XLSX)"}
      </button>
      <button
        type="button"
        onClick={() => exportJson("experiments", "experiments-export.xlsx")}
        disabled={!!loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "experiments" ? "Exporting…" : "Export Experiments (XLSX)"}
      </button>
      <button
        type="button"
        onClick={() => exportJson("impact", "impact-report.xlsx")}
        disabled={!!loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "impact" ? "Exporting…" : "Export Impact report (XLSX)"}
      </button>
    </div>
  );
}
