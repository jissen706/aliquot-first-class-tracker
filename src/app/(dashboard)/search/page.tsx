import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  if (!term) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Search</h1>
        <p className="mt-2 text-gray-500">Enter aliquot ID, sample name, or batch ID above.</p>
      </div>
    );
  }

  const aliquots = await prisma.aliquot.findMany({
    where: {
      OR: [
        { aliquotId: { contains: term } },
        { sample: { name: { contains: term } } },
        { batch: { lotNumber: { contains: term } } },
      ],
    },
    include: { sample: true, batch: true },
    take: 50,
    orderBy: { aliquotId: "asc" },
  });

  const samples = await prisma.sample.findMany({
    where: {
      OR: [
        { name: { contains: term } },
        { batch: { lotNumber: { contains: term } } },
      ],
    },
    include: { batch: true },
    take: 30,
    orderBy: { name: "asc" },
  });

  const batches = await prisma.batch.findMany({
    where: { lotNumber: { contains: term } },
    take: 20,
    orderBy: { lotNumber: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Search: &quot;{term}&quot;</h1>

      {aliquots.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-gray-500">Aliquots</h2>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {aliquots.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-mono text-sm text-gray-900">{a.aliquotId}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {a.sample.name} · Lot {a.batch.lotNumber}
                  </span>
                </div>
                <Link
                  href={`/aliquots/${a.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {samples.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-gray-500">Samples</h2>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {samples.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-900">{s.name}</span>
                <span className="text-sm text-gray-500">Lot {s.batch.lotNumber}</span>
                <Link
                  href={`/samples/${s.id}/edit`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {batches.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-gray-500">Batches</h2>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {batches.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-sm text-gray-900">{b.lotNumber}</span>
                <Link
                  href={`/batches/${b.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {aliquots.length === 0 && samples.length === 0 && batches.length === 0 && (
        <p className="mt-6 text-gray-500">No results for &quot;{term}&quot;.</p>
      )}
    </div>
  );
}
