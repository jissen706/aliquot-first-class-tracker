"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAliquotStatus } from "./actions";

type AliquotStatus = "OK" | "QUARANTINED" | "CONTAMINATED" | "CONSUMED";

export function UpdateStatusForm({
  aliquotId,
  currentStatus,
}: {
  aliquotId: string;
  currentStatus: AliquotStatus;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await updateAliquotStatus(aliquotId, formData);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          New Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="OK">OK</option>
          <option value="QUARANTINED">QUARANTINED</option>
          <option value="CONTAMINATED">CONTAMINATED</option>
          <option value="CONSUMED">CONSUMED</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Updating..." : "Update Status"}
      </button>
    </form>
  );
}

