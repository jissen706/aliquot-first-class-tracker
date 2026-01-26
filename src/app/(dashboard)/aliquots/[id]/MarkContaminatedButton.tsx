"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markAliquotContaminated } from "./actions";

export function MarkContaminatedButton({ aliquotId }: { aliquotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const reason = prompt("Reason (optional):");
    if (reason === null) return;
    setLoading(true);
    try {
      await markAliquotContaminated(aliquotId, reason.trim() || undefined);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to mark as contaminated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Updating…" : "Mark as contaminated"}
    </button>
  );
}
