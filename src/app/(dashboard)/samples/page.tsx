import Link from "next/link";
import { prisma } from "@/lib/db";
import { CreateSampleForm } from "./CreateSampleForm";

export const revalidate = 0;

export default async function SamplesPage() {
  const samples = await prisma.sample.findMany({
    orderBy: { name: "asc" },
    include: {
      batch: { select: { id: true, lotNumber: true } },
      _count: { select: { aliquots: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Samples</h1>
        <CreateSampleForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type / category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Batch (lot)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Manufacturer / Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Aliquots
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {samples.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No samples yet. Create a batch first, then add samples.
                </td>
              </tr>
            ) : (
              samples.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {s.typeCategory ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    <Link
                      href={`/batches/${s.batch.id}`}
                      className="font-mono text-blue-600 hover:underline"
                    >
                      {s.batch.lotNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.manufacturer ?? "—"} / {s.supplierName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {s._count.aliquots}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    <Link
                      href={`/samples/${s.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit →
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
