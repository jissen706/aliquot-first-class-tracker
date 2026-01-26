"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateExperiment } from "../actions";

type Experiment = {
  id: string;
  title: string;
  performedDate: Date;
  notes: string | null;
  outputs: string | null;
};

export function EditExperimentForm({ experiment }: { experiment: Experiment }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateExperiment(experiment.id, formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to update experiment.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit experiment
        </button>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="mt-4 max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="text-sm font-medium text-gray-900">Edit experiment</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-gray-600">
            Title *
          </label>
          <input
            id="title"
            name="title"
            defaultValue={experiment.title}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            defaultValue={experiment.performedDate.toISOString().slice(0, 10)}
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-600">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={experiment.notes ?? ""}
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="outputs" className="block text-xs font-medium text-gray-600">
          Outputs (JSON array of &#123;&quot;url&quot;: &quot;…&quot;, &quot;label&quot;: &quot;…&quot;&#125;)
        </label>
        <textarea
          id="outputs"
          name="outputs"
          rows={3}
          defaultValue={experiment.outputs ?? ""}
          placeholder='[{"url":"https://...","label":"Figure 1"}]'
          className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
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
