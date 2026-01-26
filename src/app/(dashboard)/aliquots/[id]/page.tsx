import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAliquotImpact } from "@/lib/impact";
import { getAuditLogs } from "@/lib/audit";
import { ImpactPanel } from "@/components/ImpactPanel";
import { UpdateAliquotStatusForm } from "./UpdateAliquotStatusForm";
import { AssignLocationForm } from "./AssignLocationForm";
import { MarkContaminatedButton } from "./MarkContaminatedButton";

export const revalidate = 0;

export default async function AliquotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const aliquot = await prisma.aliquot.findUnique({
    where: { id },
    include: {
      sample: true,
      batch: true,
      createdBy: { select: { name: true, email: true } },
      freezer: true,
      box: true,
    },
  });

  if (!aliquot) notFound();

  const impact = await getAliquotImpact(id);
  const auditLogs = await getAuditLogs("ALIQUOT", id, 20);
  const statusBadge =
    aliquot.status === "RELEASED_QC_PASSED"
      ? "bg-green-100 text-green-800"
      : aliquot.status === "CONTAMINATED" || aliquot.status === "QUARANTINED"
        ? "bg-red-100 text-red-800"
        : aliquot.status === "CONSUMED"
          ? "bg-gray-100 text-gray-700"
          : "bg-amber-100 text-amber-800";

  const labelsUrl = `/api/labels?aliquotIds=${id}`;
  const labelsXlsxUrl = `${labelsUrl}&format=xlsx`;

  return (
    <div>
      <div className="mb-4">
        <Link href="/aliquots" className="text-sm text-gray-500 hover:text-gray-700">
          ← Aliquots
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-mono text-gray-900">
            {aliquot.aliquotId}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {aliquot.sample.name} · Lot {aliquot.batch.lotNumber}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusBadge}`}
          >
            {aliquot.status.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={labelsUrl}
            download
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Labels PDF
          </a>
          <a
            href={labelsXlsxUrl}
            download
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Labels XLSX
          </a>
          {aliquot.status !== "CONTAMINATED" && (
            <MarkContaminatedButton aliquotId={id} />
          )}
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Volume
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {aliquot.volume != null
              ? `${aliquot.volume} ${aliquot.unit ?? ""}`.trim()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Concentration
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {aliquot.concentration != null
              ? `${aliquot.concentration} ${aliquot.unit ?? ""}`.trim()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Location
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {aliquot.freezer?.name ?? "—"} / {aliquot.box?.name ?? "—"}{" "}
            {aliquot.position ?? ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Created
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {aliquot.createdAt.toLocaleString()}
            {aliquot.createdBy && (
              <span className="ml-1 text-gray-500">by {aliquot.createdBy.name}</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-6">
        <UpdateAliquotStatusForm aliquotId={id} currentStatus={aliquot.status} />
        <AssignLocationForm
          aliquotId={id}
          freezerId={aliquot.freezerId}
          boxId={aliquot.boxId}
          position={aliquot.position}
        />
      </div>

      <ImpactPanel
        type="aliquot"
        siblingOrAliquotCount={impact.siblingAliquotCount}
        experimentCount={impact.experimentCount}
        experiments={impact.experiments}
        affectedUserIds={impact.affectedUserIds}
        outputsToReview={impact.outputsToReview}
      />

      {auditLogs.length > 0 && (
        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <ul className="mt-4 space-y-2">
            {auditLogs.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center gap-2 text-sm text-gray-600"
              >
                <span className="font-medium text-gray-900">{log.action}</span>
                {log.reason && <span>— {log.reason}</span>}
                {log.user && <span>by {log.user.name}</span>}
                <span className="text-gray-400">
                  {log.createdAt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
