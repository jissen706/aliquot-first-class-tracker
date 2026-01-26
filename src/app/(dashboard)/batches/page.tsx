import Link from "next/link";
import { prisma } from "@/lib/db";
import { CreateBatchForm } from "./CreateBatchForm";

export const revalidate = 0;

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { samples: true, aliquots: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Batches</h1>
        <CreateBatchForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Lot number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Manufacturer / Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                QC status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Samples / Aliquots
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No batches yet. Create one above.
                </td>
              </tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-900">
                    {b.lotNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {b.manufacturer ?? "—"} / {b.supplierName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        b.qcStatus === "RELEASED_QC_PASSED"
                          ? "bg-green-100 text-green-800"
                          : b.qcStatus === "FAILED_QC"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.qcStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {b._count.samples} samples · {b._count.aliquots} aliquots
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    <Link href={`/batches/${b.id}`} className="text-blue-600 hover:text-blue-800">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
