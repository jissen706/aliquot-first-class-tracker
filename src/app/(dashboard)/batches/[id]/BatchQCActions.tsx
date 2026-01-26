"use client";

import { useRouter } from "next/navigation";
import { releaseBatch, failBatchQC } from "./actions";

type QCStatus = "PENDING_QC" | "RELEASED_QC_PASSED" | "FAILED_QC";

export function BatchQCActions({
  batchId,
  qcStatus,
}: {
  batchId: string;
  qcStatus: QCStatus;
}) {
  const router = useRouter();

  async function handleRelease() {
    if (!confirm("Release this batch (QC Passed)? All aliquots in the batch will be updated to Released / QC Passed."))
      return;
    try {
      await releaseBatch(batchId);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to release batch.");
    }
  }

  async function handleFail() {
    if (
      !confirm(
        "Mark this batch as Failed QC? All aliquots will be quarantined. Affected experiments will be flagged."
      )
    )
      return;
    try {
      await failBatchQC(batchId);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to mark batch as Failed QC.");
    }
  }

  if (qcStatus === "RELEASED_QC_PASSED") {
    return (
      <div className="text-sm text-gray-500">
        Batch released. No further QC actions.
      </div>
    );
  }
  if (qcStatus === "FAILED_QC") {
    return (
      <div className="text-sm text-red-600">
        Batch failed QC. Aliquots quarantined.
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleRelease}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Release batch (QC Passed)
      </button>
      <button
        type="button"
        onClick={handleFail}
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Mark batch Failed QC
      </button>
    </div>
  );
}
