"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBatch } from "./actions";

export function CreateBatchForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createBatch(formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to create batch.");
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
        Create batch
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <label htmlFor="lotNumber" className="block text-xs font-medium text-gray-600">
          Lot number *
        </label>
        <input
          id="lotNumber"
          name="lotNumber"
          required
          className="mt-1 block w-40 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
          placeholder="https://…"
          className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="receivedDate" className="block text-xs font-medium text-gray-600">
          Received date
        </label>
        <input
          id="receivedDate"
          name="receivedDate"
          type="date"
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-600">
          Expiry date
        </label>
        <input
          id="expiryDate"
          name="expiryDate"
          type="date"
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
