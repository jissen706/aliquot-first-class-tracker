"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { attachAliquot } from "./actions";

export function AttachAliquotForm({ experimentId }: { experimentId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCode, setSearchCode] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await attachAliquot(experimentId, formData);
      router.refresh();
      setSearchCode("");
      const form = document.getElementById("attach-aliquot-form") as HTMLFormElement;
      form?.reset();
    } catch (error: any) {
      console.error("Error attaching aliquot:", error);
      alert(error.message || "Failed to attach aliquot. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="attach-aliquot-form" action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="aliquotCode" className="block text-sm font-medium text-gray-700 mb-1">
          Search Aliquot by Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="aliquotCode"
            name="aliquotCode"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter aliquot code..."
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Attaching..." : "Attach"}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Enter the full aliquot code (e.g., FBS-12345ABC-20260118-A10-K7P2)
        </p>
      </div>

      <div>
        <label htmlFor="usageNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Usage Notes (optional)
        </label>
        <textarea
          id="usageNotes"
          name="usageNotes"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </form>
  );
}

