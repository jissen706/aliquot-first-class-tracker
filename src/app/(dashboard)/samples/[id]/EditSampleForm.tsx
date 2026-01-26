"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSample } from "../actions";

type Sample = {
  id: string;
  name: string;
  typeCategory: string | null;
  batchId: string;
  manufacturer: string | null;
  supplierName: string | null;
  supplierUrl: string | null;
  notes: string | null;
};

type Batch = { id: string; lotNumber: string };

export function EditSampleForm({
  sample,
  batches,
}: {
  sample: Sample;
  batches: Batch[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateSample(sample.id, formData);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to update sample.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="mt-6 max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          id="name"
          name="name"
          defaultValue={sample.name}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="typeCategory" className="block text-sm font-medium text-gray-700">
          Type / category
        </label>
        <input
          id="typeCategory"
          name="typeCategory"
          defaultValue={sample.typeCategory ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="batchId" className="block text-sm font-medium text-gray-700">
          Batch *
        </label>
        <select
          id="batchId"
          name="batchId"
          defaultValue={sample.batchId}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.lotNumber}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
            Manufacturer
          </label>
          <input
            id="manufacturer"
            name="manufacturer"
            defaultValue={sample.manufacturer ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700">
            Supplier name
          </label>
          <input
            id="supplierName"
            name="supplierName"
            defaultValue={sample.supplierName ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="supplierUrl" className="block text-sm font-medium text-gray-700">
          Supplier URL
        </label>
        <input
          id="supplierUrl"
          name="supplierUrl"
          type="url"
          defaultValue={sample.supplierUrl ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={sample.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
