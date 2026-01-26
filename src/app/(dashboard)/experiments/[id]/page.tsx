import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AttachAliquotForm } from "./AttachAliquotForm";
import { DetachAliquotButton } from "./DetachAliquotButton";
import { ExperimentAlerts } from "./ExperimentAlerts";
import { EditExperimentForm } from "./EditExperimentForm";

export const revalidate = 0;

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      aliquots: {
        include: {
          aliquot: {
            include: {
              sample: true,
              batch: true,
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!experiment) notFound();

  const alerts = await prisma.alertExperiment.findMany({
    where: { experimentId: id },
    include: { alert: true },
    orderBy: { alert: { createdAt: "desc" } },
  });

  return (
    <div>
      <div className="mb-4">
        <Link href="/experiments" className="text-sm text-gray-500 hover:text-gray-700">
          ← Experiments
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{experiment.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {experiment.performedDate.toLocaleDateString()} · {experiment.owner.name}
          </p>
          {experiment.notes && (
            <p className="mt-2 text-sm text-gray-700">{experiment.notes}</p>
          )}
        </div>
      </div>

      <EditExperimentForm experiment={experiment} />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Aliquots used</h2>
        <AttachAliquotForm experimentId={id} />
        {experiment.aliquots.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No aliquots attached yet.</p>
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
                    Usage notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {experiment.aliquots.map((ea) => (
                  <tr key={ea.aliquotId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-900">
                      {ea.aliquot.aliquotId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {ea.aliquot.sample.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          ea.aliquot.status === "RELEASED_QC_PASSED"
                            ? "bg-green-100 text-green-800"
                            : ea.aliquot.status === "CONTAMINATED" || ea.aliquot.status === "QUARANTINED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ea.aliquot.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ea.usageNotes ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      <Link
                        href={`/aliquots/${ea.aliquotId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View aliquot
                      </Link>
                      {" · "}
                      <DetachAliquotButton experimentId={id} aliquotId={ea.aliquotId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {experiment.outputs && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Outputs</h2>
          <p className="mt-1 text-sm text-gray-500">
            JSON array of &#123;url, label&#125;. Edit experiment to change.
          </p>
          <pre className="mt-2 overflow-x-auto rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">
            {experiment.outputs}
          </pre>
        </section>
      )}

      <ExperimentAlerts
        experimentId={id}
        alerts={alerts}
        currentUserId={(session?.user as { id?: string })?.id}
      />
    </div>
  );
}
