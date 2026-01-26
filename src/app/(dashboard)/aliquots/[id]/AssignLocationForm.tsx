"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { assignLocation } from "./actions";

type Box = { id: string; name: string; freezerId: string };
type Freezer = { id: string; name: string; boxes: Box[] };

export function AssignLocationForm({
  aliquotId,
  freezerId,
  boxId,
  position,
}: {
  aliquotId: string;
  freezerId: string | null;
  boxId: string | null;
  position: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [freezers, setFreezers] = useState<Freezer[]>([]);
  const boxes = freezers.flatMap((f) => f.boxes.map((b) => ({ ...b, freezerName: f.name })));

  useEffect(() => {
    fetch("/api/storage")
      .then((r) => r.json())
      .then((d) => setFreezers(d.freezers ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await assignLocation(aliquotId, formData);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to assign location.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="text-sm font-medium text-gray-900">Storage location</h3>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="freezerId" className="block text-xs font-medium text-gray-600">
            Freezer
          </label>
          <select
            id="freezerId"
            name="freezerId"
            defaultValue={freezerId ?? ""}
            className="mt-1 block w-36 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">—</option>
            {freezers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="boxId" className="block text-xs font-medium text-gray-600">
            Box
          </label>
          <select
            id="boxId"
            name="boxId"
            defaultValue={boxId ?? ""}
            className="mt-1 block w-32 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">—</option>
            {boxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.freezerName} / {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="position" className="block text-xs font-medium text-gray-600">
            Position (e.g. A1)
          </label>
          <input
            id="position"
            name="position"
            type="text"
            defaultValue={position ?? ""}
            placeholder="A1"
            className="mt-1 block w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
