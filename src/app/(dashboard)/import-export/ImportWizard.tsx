"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Preview = {
  rows: unknown[];
  errors: { row: number; message: string }[];
  preview?: boolean;
};

type CommitResult = {
  imported: number;
  errors: { row: number; message: string }[];
};

export function ImportWizard() {
  const router = useRouter();
  const [type, setType] = useState<"samples" | "aliquots">("samples");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);

  async function handlePreview() {
    if (!file) {
      alert("Select a file first.");
      return;
    }
    setLoading(true);
    setPreview(null);
    setCommitResult(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("type", type);
      form.set("commit", "false");
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setPreview(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    if (!file) return;
    setLoading(true);
    setCommitResult(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("type", type);
      form.set("commit", "true");
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setCommitResult(data);
      setPreview(null);
      setFile(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Commit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="import-type" className="block text-xs font-medium text-gray-600">
            Type
          </label>
          <select
            id="import-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as "samples" | "aliquots");
              setPreview(null);
              setCommitResult(null);
            }}
            className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="samples">Samples</option>
            <option value="aliquots">Aliquots</option>
          </select>
        </div>
        <div>
          <label htmlFor="import-file" className="block text-xs font-medium text-gray-600">
            XLSX file
          </label>
          <input
            id="import-file"
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setPreview(null);
              setCommitResult(null);
            }}
            className="mt-1 block w-56 text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading || !file}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing…" : "Preview"}
        </button>
      </div>

      {preview && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-900">Preview</h3>
          <p className="mt-1 text-sm text-gray-600">
            {preview.rows.length} row(s) · {preview.errors.length} error(s)
          </p>
          {preview.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-red-600">
              {preview.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  Row {e.row}: {e.message}
                </li>
              ))}
              {preview.errors.length > 10 && (
                <li>… and {preview.errors.length - 10} more</li>
              )}
            </ul>
          )}
          {preview.rows.length > 0 && (
            <button
              type="button"
              onClick={handleCommit}
              disabled={loading}
              className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Importing…" : "Commit import"}
            </button>
          )}
        </div>
      )}

      {commitResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-800">
            Imported {commitResult.imported} record(s).
          </p>
          {commitResult.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
              {commitResult.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
