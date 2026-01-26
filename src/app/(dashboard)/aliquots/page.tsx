import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 0;

export default async function AliquotsPage() {
  const aliquots = await prisma.aliquot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sample: { select: { name: true } },
      batch: { select: { lotNumber: true } },
      freezer: { select: { name: true } },
      box: { select: { name: true } },
    },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Aliquots</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create aliquots from samples (see Samples → Edit → Generate aliquots). Use search to find by aliquot ID, sample, or batch.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Aliquot ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Sample
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Lot
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {aliquots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No aliquots yet. Create samples and generate aliquots from them.
                </td>
              </tr>
            ) : (
              aliquots.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-900">
                    {a.aliquotId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.sample.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.batch.lotNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        a.status === "RELEASED_QC_PASSED"
                          ? "bg-green-100 text-green-800"
                          : a.status === "CONTAMINATED" || a.status === "QUARANTINED"
                            ? "bg-red-100 text-red-800"
                            : a.status === "CONSUMED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {a.freezer?.name ?? "—"} / {a.box?.name ?? "—"} {a.position ?? ""}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    <Link
                      href={`/aliquots/${a.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
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
