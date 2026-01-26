import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getBatchImpact } from "@/lib/impact";
import { BatchQCActions } from "./BatchQCActions";
import { ImpactPanel } from "@/components/ImpactPanel";

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
      samples: { orderBy: { name: "asc" } },
      aliquots: {
        include: { sample: true, box: true, freezer: true },
        orderBy: { aliquotId: "asc" },
      },
    },
  });

  if (!batch) notFound();

  const impact = await getBatchImpact(id);
  const statusBadge =
    batch.qcStatus === "RELEASED_QC_PASSED"
      ? "bg-green-100 text-green-800"
      : batch.qcStatus === "FAILED_QC"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";

  return (
    <div>
      <div className="mb-4">
        <Link href="/batches" className="text-sm text-gray-500 hover:text-gray-700">
          ← Batches
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Lot {batch.lotNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {batch.manufacturer ?? "—"} / {batch.supplierName ?? "—"}
          </p>
          {batch.supplierUrl && (
            <a
              href={batch.supplierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline"
            >
              Supplier URL →
            </a>
          )}
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusBadge}`}
          >
            {batch.qcStatus.replace(/_/g, " ")}
          </span>
        </div>
        <BatchQCActions batchId={id} qcStatus={batch.qcStatus} />
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Received
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {batch.receivedDate
              ? batch.receivedDate.toLocaleDateString()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Expiry
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {batch.expiryDate
              ? batch.expiryDate.toLocaleDateString()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Samples
          </dt>
          <dd className="mt-1 text-sm text-gray-900">{batch.samples.length}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Aliquots
          </dt>
          <dd className="mt-1 text-sm text-gray-900">{batch.aliquots.length}</dd>
        </div>
      </dl>
      {batch.notes && (
        <div className="mt-4">
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Notes
          </dt>
          <dd className="mt-1 text-sm text-gray-700">{batch.notes}</dd>
        </div>
      )}

      <ImpactPanel
        type="batch"
        siblingOrAliquotCount={impact.aliquotCount}
        experimentCount={impact.experimentCount}
        experiments={impact.experiments}
        affectedUserIds={impact.affectedUserIds}
        outputsToReview={impact.outputsToReview}
      />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Aliquots in batch</h2>
        {batch.aliquots.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No aliquots yet. Create samples from this batch, then generate aliquots.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
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
              <tbody className="divide-y divide-gray-200">
                {batch.aliquots.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-900">
                      {a.aliquotId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {a.sample.name}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Samples in batch</h2>
        {batch.samples.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No samples yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {batch.samples.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span className="font-medium text-gray-900">{s.name}</span>
                <Link
                  href={`/samples/${s.id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
