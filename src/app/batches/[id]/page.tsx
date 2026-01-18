import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GenerateAliquotsForm } from "./GenerateAliquotsForm";

export const revalidate = 0;

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      aliquots: {
        orderBy: [{ madeDate: "desc" }, { aliquotIndex: "asc" }],
      },
    },
  });

  if (!batch) {
    notFound();
  }

  const aliquotIds = batch.aliquots.map((a) => a.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/batches"
            className="text-gray-600 hover:text-gray-900 underline mb-2 inline-block"
          >
            ← Back to Batches
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{batch.productName}</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Batch Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Vendor</dt>
              <dd className="mt-1 text-sm text-gray-900">{batch.vendor}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Lot Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{batch.lotNumber}</dd>
            </div>
            {batch.catalogNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Catalog Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{batch.catalogNumber}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Received Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {batch.receivedDate.toLocaleDateString()}
              </dd>
            </div>
            {batch.expiryDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {batch.expiryDate.toLocaleDateString()}
                </dd>
              </div>
            )}
            {batch.notes && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">{batch.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mb-6">
          <GenerateAliquotsForm batchId={id} />
        </div>

        {aliquotIds.length > 0 && (
          <div className="mb-4">
            <a
              href={`/api/labels?aliquotIds=${aliquotIds.join(",")}`}
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              download
            >
              Download Labels PDF ({batch.aliquots.length} aliquots)
            </a>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-6 border-b">Aliquots ({batch.aliquots.length})</h2>
          {batch.aliquots.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No aliquots yet. Generate aliquots above.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Index
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Made Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batch.aliquots.map((aliquot) => {
                  const statusColors = {
                    OK: "bg-green-100 text-green-800",
                    QUARANTINED: "bg-yellow-100 text-yellow-800",
                    CONTAMINATED: "bg-red-100 text-red-800",
                    CONSUMED: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <tr key={aliquot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900">
                          {aliquot.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {aliquot.aliquotIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aliquot.madeDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {aliquot.volume && aliquot.unit
                          ? `${aliquot.volume} ${aliquot.unit}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {aliquot.storageLocation || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[aliquot.status]
                          }`}
                        >
                          {aliquot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/aliquots/${aliquot.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

