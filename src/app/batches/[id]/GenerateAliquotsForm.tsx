"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateAliquots } from "./actions";

export function GenerateAliquotsForm({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await generateAliquots(batchId, formData);
      router.refresh();
      const form = document.getElementById("generate-aliquots-form") as HTMLFormElement;
      form?.reset();
    } catch (error) {
      console.error("Error generating aliquots:", error);
      alert("Failed to generate aliquots. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generate Aliquots</h2>
      <form id="generate-aliquots-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="madeDate" className="block text-sm font-medium text-gray-700 mb-1">
              Made Date *
            </label>
            <input
              type="date"
              id="madeDate"
              name="madeDate"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Aliquots *
            </label>
            <input
              type="number"
              id="count"
              name="count"
              required
              min="1"
              max="100"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
              Volume
            </label>
            <input
              type="number"
              id="volume"
              name="volume"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              placeholder="e.g., mL, μL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Storage Location Template
          </label>
          <input
            type="text"
            id="storageLocation"
            name="storageLocation"
            placeholder="e.g., Freezer A, Shelf 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Generating..." : "Generate Aliquots"}
        </button>
      </form>
    </div>
  );
}

