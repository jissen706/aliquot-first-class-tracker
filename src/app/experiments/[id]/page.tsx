import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AttachAliquotForm } from "./AttachAliquotForm";
import { DetachAliquotButton } from "./DetachAliquotButton";

export const revalidate = 0;

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: {
      aliquots: {
        include: {
          aliquot: {
            include: {
              batch: true,
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!experiment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/experiments"
            className="text-gray-600 hover:text-gray-900 underline mb-2 inline-block"
          >
            ← Back to Experiments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{experiment.title}</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Experiment Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900">{experiment.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Performed Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {experiment.performedDate.toLocaleDateString()}
              </dd>
            </div>
            {experiment.operator && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Operator</dt>
                <dd className="mt-1 text-sm text-gray-900">{experiment.operator}</dd>
              </div>
            )}
            {experiment.notes && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">{experiment.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Attach Aliquots</h2>
          <AttachAliquotForm experimentId={id} />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-6 border-b">
            Attached Aliquots ({experiment.aliquots.length})
          </h2>
          {experiment.aliquots.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No aliquots attached yet. Search and attach aliquots above.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aliquot Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {experiment.aliquots.map((ea) => {
                  const statusColors = {
                    OK: "bg-green-100 text-green-800",
                    QUARANTINED: "bg-yellow-100 text-yellow-800",
                    CONTAMINATED: "bg-red-100 text-red-800",
                    CONSUMED: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <tr key={ea.aliquotId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900">
                          {ea.aliquot.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ea.aliquot.batch.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ea.aliquot.batch.lotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[ea.aliquot.status]
                          }`}
                        >
                          {ea.aliquot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ea.usageNotes || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/aliquots/${ea.aliquotId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Aliquot →
                        </Link>
                        <DetachAliquotButton
                          experimentId={experiment.id}
                          aliquotId={ea.aliquotId}
                        />
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

