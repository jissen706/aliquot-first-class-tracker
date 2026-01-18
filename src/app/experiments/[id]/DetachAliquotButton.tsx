"use client";

import { useRouter } from "next/navigation";
import { detachAliquot } from "./actions";

export function DetachAliquotButton({
  experimentId,
  aliquotId,
}: {
  experimentId: string;
  aliquotId: string;
}) {
  const router = useRouter();

  async function handleDetach() {
    if (!confirm("Remove this aliquot from the experiment?")) {
      return;
    }

    try {
      await detachAliquot(experimentId, aliquotId);
      router.refresh();
    } catch (error) {
      console.error("Error detaching aliquot:", error);
      alert("Failed to remove aliquot. Please try again.");
    }
  }

  return (
    <button
      onClick={handleDetach}
      className="text-red-600 hover:text-red-900"
    >
      Remove
    </button>
  );
}

