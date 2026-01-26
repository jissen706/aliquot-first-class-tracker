"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createSample } from "./actions";

type Batch = { id: string; lotNumber: string };

export function CreateSampleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => setBatches(d.batches ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createSample(formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to create sample.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Create sample
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-gray-600">
          Name *
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="typeCategory" className="block text-xs font-medium text-gray-600">
          Type / category
        </label>
        <input
          id="typeCategory"
          name="typeCategory"
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="batchId" className="block text-xs font-medium text-gray-600">
          Batch *
        </label>
        <select
          id="batchId"
          name="batchId"
          required
          className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.lotNumber}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="manufacturer" className="block text-xs font-medium text-gray-600">
          Manufacturer
        </label>
        <input
          id="manufacturer"
          name="manufacturer"
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="supplierName" className="block text-xs font-medium text-gray-600">
          Supplier name
        </label>
        <input
          id="supplierName"
          name="supplierName"
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="supplierUrl" className="block text-xs font-medium text-gray-600">
          Supplier URL
        </label>
        <input
          id="supplierUrl"
          name="supplierUrl"
          type="url"
          className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
