"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { attachAliquotAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Attaching…" : "Attach"}
    </button>
  );
}

export function AttachAliquotForm({ experimentId }: { experimentId: string }) {
  const router = useRouter();

  return (
    <form
      action={async (formData: FormData) => {
        formData.set("experimentId", experimentId);
        try {
          await attachAliquotAction(formData);
          router.refresh();
        } catch (e) {
          console.error(e);
        }
      }}
      className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <input type="hidden" name="experimentId" value={experimentId} />
      <div>
        <label htmlFor="aliquotId" className="block text-xs font-medium text-gray-600">
          Aliquot ID or code *
        </label>
        <input
          id="aliquotId"
          name="aliquotId"
          type="text"
          required
          placeholder="e.g. FBS-L123-20250125-A01-K7P2"
          className="mt-1 block w-64 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="usageNotes" className="block text-xs font-medium text-gray-600">
          Usage notes
        </label>
        <input
          id="usageNotes"
          name="usageNotes"
          type="text"
          placeholder="Optional"
          className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
