"use client";

import { useRouter } from "next/navigation";
import { detachAliquotAction } from "../actions";

export function DetachAliquotButton({
  experimentId,
  aliquotId,
}: {
  experimentId: string;
  aliquotId: string;
}) {
  const router = useRouter();

  async function handleClick() {
    if (!confirm("Remove this aliquot from the experiment?")) return;
    const formData = new FormData();
    formData.set("experimentId", experimentId);
    formData.set("aliquotId", aliquotId);
    try {
      await detachAliquotAction(formData);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to remove aliquot.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-red-600 hover:text-red-800"
    >
      Remove
    </button>
  );
}
