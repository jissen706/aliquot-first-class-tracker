import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { UpdateStatusForm } from "./UpdateStatusForm";

export const revalidate = 0;

export default async function AliquotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aliquot = await prisma.aliquot.findUnique({
    where: { id },
    include: {
      batch: true,
      experimentAliquots: {
        include: {
          experiment: true,
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!aliquot) {
    notFound();
  }

  // Find adjacent aliquots (same batch, same date, index +/- 1)
  const adjacentAliquots = await prisma.aliquot.findMany({
    where: {
      batchId: aliquot.batchId,
      madeDate: aliquot.madeDate,
      aliquotIndex: {
        in: [aliquot.aliquotIndex - 1, aliquot.aliquotIndex + 1],
      },
    },
    orderBy: { aliquotIndex: "asc" },
  });

  const statusColors = {
    OK: "bg-green-100 text-green-800",
    QUARANTINED: "bg-yellow-100 text-yellow-800",
    CONTAMINATED: "bg-red-100 text-red-800",
    CONSUMED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/batches/${aliquot.batchId}`}
            className="text-gray-600 hover:text-gray-900 underline mb-2 inline-block"
          >
            ← Back to Batch
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            <code className="font-mono">{aliquot.code}</code>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Aliquot Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Code</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900">{aliquot.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      statusColors[aliquot.status]
                    }`}
                  >
                    {aliquot.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Index</dt>
                <dd className="mt-1 text-sm text-gray-900">{aliquot.aliquotIndex}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Made Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {aliquot.madeDate.toLocaleDateString()}
                </dd>
              </div>
              {aliquot.volume && aliquot.unit && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Volume</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {aliquot.volume} {aliquot.unit}
                  </dd>
                </div>
              )}
              {aliquot.storageLocation && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Storage Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{aliquot.storageLocation}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {aliquot.createdAt.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Batch Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Product</dt>
                <dd className="mt-1 text-sm text-gray-900">{aliquot.batch.productName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                <dd className="mt-1 text-sm text-gray-900">{aliquot.batch.vendor}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Lot Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{aliquot.batch.lotNumber}</dd>
              </div>
              {aliquot.batch.catalogNumber && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Catalog Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {aliquot.batch.catalogNumber}
                  </dd>
                </div>
              )}
              <div>
                <Link
                  href={`/batches/${aliquot.batchId}`}
                  className="text-blue-600 hover:text-blue-900 underline text-sm"
                >
                  View Full Batch →
                </Link>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Update Status</h2>
          <UpdateStatusForm aliquotId={id} currentStatus={aliquot.status} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Blast Radius: Experiments Using This Aliquot (
            {aliquot.experimentAliquots.length})
          </h2>
          {aliquot.experimentAliquots.length === 0 ? (
            <p className="text-gray-500">This aliquot has not been used in any experiments.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aliquot.experimentAliquots.map((ea) => (
                  <tr key={ea.experimentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ea.experiment.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ea.experiment.performedDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ea.experiment.operator || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ea.usageNotes || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/experiments/${ea.experimentId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {adjacentAliquots.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Adjacent Aliquots (Same Batch & Date)
            </h2>
            <div className="space-y-2">
              {adjacentAliquots.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div>
                    <code className="font-mono text-sm">{adj.code}</code>
                    <span className="ml-3 text-sm text-gray-600">
                      Index: {adj.aliquotIndex}
                    </span>
                    <span
                      className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[adj.status]
                      }`}
                    >
                      {adj.status}
                    </span>
                  </div>
                  <Link
                    href={`/aliquots/${adj.id}`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

