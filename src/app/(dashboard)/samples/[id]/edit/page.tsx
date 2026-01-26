import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditSampleForm } from "../EditSampleForm";
import { GenerateAliquotsForm } from "../GenerateAliquotsForm";

export const revalidate = 0;

export default async function EditSamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      batch: { select: { id: true, lotNumber: true } },
      aliquots: { orderBy: { aliquotId: "asc" }, take: 50 },
    },
  });

  if (!sample) notFound();

  const batches = await prisma.batch.findMany({
    orderBy: { lotNumber: "asc" },
    select: { id: true, lotNumber: true },
  });

  return (
    <div>
      <div className="mb-4">
        <Link href="/samples" className="text-sm text-gray-500 hover:text-gray-700">
          ← Samples
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900">Edit sample: {sample.name}</h1>
      <EditSampleForm sample={sample} batches={batches} />
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Aliquots ({sample.aliquots.length})</h2>
        {sample.aliquots.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No aliquots yet. Use &quot;Generate aliquots&quot; above.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sample.aliquots.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span className="font-mono text-sm text-gray-900">{a.aliquotId}</span>
                <Link
                  href={`/aliquots/${a.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
