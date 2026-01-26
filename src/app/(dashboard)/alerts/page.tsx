import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 0;

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { experiments: true } },
    },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Contamination and QC failure alerts. Acknowledge per experiment on the experiment detail page.
      </p>

      <div className="mt-6 space-y-4">
        {alerts.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            No alerts yet.
          </p>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      a.type === "CONTAMINATION"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {a.type.replace(/_/g, " ")}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {a.entityType} · {a.entityId}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {a.createdAt.toLocaleString()}
                </span>
              </div>
              <h2 className="mt-2 font-medium text-gray-900">{a.title}</h2>
              {a.message && (
                <p className="mt-1 text-sm text-gray-600">{a.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {a._count.experiments} affected experiment(s)
              </p>
              <div className="mt-3 flex gap-2">
                {a.entityType === "ALIQUOT" && (
                  <Link
                    href={`/aliquots/${a.entityId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View aliquot →
                  </Link>
                )}
                {a.entityType === "BATCH" && (
                  <Link
                    href={`/batches/${a.entityId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View batch →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
