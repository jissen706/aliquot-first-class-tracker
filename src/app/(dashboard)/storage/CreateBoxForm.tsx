"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBox } from "./actions";

type Freezer = { id: string; name: string; boxes: unknown[] };

export function CreateBoxForm({ freezers }: { freezers: Freezer[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createBox(formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to create box.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={freezers.length === 0}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Add box
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <label htmlFor="freezerId" className="block text-xs font-medium text-gray-600">
          Freezer *
        </label>
        <select
          id="freezerId"
          name="freezerId"
          required
          className="mt-1 block w-40 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select</option>
          {freezers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="boxName" className="block text-xs font-medium text-gray-600">
          Box name *
        </label>
        <input
          id="boxName"
          name="boxName"
          required
          className="mt-1 block w-32 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="rows" className="block text-xs font-medium text-gray-600">
          Rows
        </label>
        <input
          id="rows"
          name="rows"
          type="number"
          min={1}
          max={24}
          defaultValue={8}
          className="mt-1 block w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="cols" className="block text-xs font-medium text-gray-600">
          Cols
        </label>
        <input
          id="cols"
          name="cols"
          type="number"
          min={1}
          max={24}
          defaultValue={12}
          className="mt-1 block w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
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
    </form>
  );
}
