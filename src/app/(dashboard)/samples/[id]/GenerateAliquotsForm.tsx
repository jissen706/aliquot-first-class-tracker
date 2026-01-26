"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateAliquots } from "./actions";

export function GenerateAliquotsForm({ sampleId }: { sampleId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await generateAliquots(sampleId, formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to generate aliquots.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Generate aliquots
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <div>
        <label htmlFor="madeDate" className="block text-xs font-medium text-gray-600">
          Made date *
        </label>
        <input
          id="madeDate"
          name="madeDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="count" className="block text-xs font-medium text-gray-600">
          Number *
        </label>
        <input
          id="count"
          name="count"
          type="number"
          required
          min={1}
          max={100}
          defaultValue={5}
          className="mt-1 block w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="volume" className="block text-xs font-medium text-gray-600">
          Volume
        </label>
        <input
          id="volume"
          name="volume"
          type="number"
          step="0.01"
          className="mt-1 block w-24 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="unit" className="block text-xs font-medium text-gray-600">
          Unit
        </label>
        <input
          id="unit"
          name="unit"
          type="text"
          placeholder="mL"
          className="mt-1 block w-16 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="concentration" className="block text-xs font-medium text-gray-600">
          Concentration
        </label>
        <input
          id="concentration"
          name="concentration"
          type="number"
          step="0.01"
          className="mt-1 block w-24 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
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
