"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createExperiment } from "./actions";

export function CreateExperimentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createExperiment(formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to create experiment.");
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
        Create experiment
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <div>
        <label htmlFor="title" className="block text-xs font-medium text-gray-600">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-1 block w-64 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="performedDate" className="block text-xs font-medium text-gray-600">
          Date *
        </label>
        <input
          id="performedDate"
          name="performedDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-600">
          Notes
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="Optional"
          className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
