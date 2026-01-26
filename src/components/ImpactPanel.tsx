import Link from "next/link";

type Experiment = {
  id: string;
  title: string;
  performedDate: Date;
  ownerName: string;
  ownerEmail: string;
};

type Output = { url: string; label: string; experimentId: string };

type Props = {
  type: "aliquot" | "batch";
  siblingOrAliquotCount: number;
  experimentCount: number;
  experiments: Experiment[];
  affectedUserIds: Set<string>;
  outputsToReview: Output[];
};

export function ImpactPanel({
  type,
  siblingOrAliquotCount,
  experimentCount,
  experiments,
  affectedUserIds,
  outputsToReview,
}: Props) {
  const label =
    type === "aliquot"
      ? "Sibling aliquots (same batch)"
      : "Aliquots in batch";

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Impact</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {siblingOrAliquotCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Experiments using {type === "aliquot" ? "this aliquot" : "batch"}
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {experimentCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Affected users
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {affectedUserIds.size}
          </dd>
        </div>
      </dl>

      {experiments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">Affected experiments</h3>
          <ul className="mt-2 divide-y divide-gray-100">
            {experiments.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2">
                <div>
                  <Link
                    href={`/experiments/${e.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {e.title}
                  </Link>
                  <span className="ml-2 text-sm text-gray-500">
                    {e.performedDate.toLocaleDateString()} · {e.ownerName}
                  </span>
                </div>
                <Link
                  href={`/experiments/${e.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outputsToReview.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">Outputs needing review</h3>
          <ul className="mt-2 space-y-1">
            {outputsToReview.map((o, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {o.label || o.url}
                </a>
                <Link
                  href={`/experiments/${o.experimentId}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  (experiment)
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {experimentCount === 0 && outputsToReview.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          No experiments or outputs linked yet.
        </p>
      )}
    </section>
  );
}
