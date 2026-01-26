"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAliquotStatus } from "./actions";

type Status =
  | "PENDING_QC"
  | "RELEASED_QC_PASSED"
  | "QUARANTINED"
  | "CONTAMINATED"
  | "CONSUMED";

export function UpdateAliquotStatusForm({
  aliquotId,
  currentStatus,
}: {
  aliquotId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateAliquotStatus(aliquotId, formData);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="text-sm font-medium text-gray-900">Update status</h3>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-gray-600">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            className="mt-1 block w-44 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="PENDING_QC">Pending QC</option>
            <option value="RELEASED_QC_PASSED">Released / QC Passed</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="CONTAMINATED">Contaminated</option>
            <option value="CONSUMED">Consumed</option>
          </select>
        </div>
        <div>
          <label htmlFor="reason" className="block text-xs font-medium text-gray-600">
            Reason (optional)
          </label>
          <input
            id="reason"
            name="reason"
            type="text"
            placeholder="e.g. QC pass, sterility fail"
            className="mt-1 block w-48 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
