import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BoxGrid } from "./BoxGrid";

export const revalidate = 0;

export default async function BoxGridPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const box = await prisma.box.findUnique({
    where: { id },
    include: {
      freezer: true,
      aliquots: { include: { sample: true } },
    },
  });

  if (!box) notFound();

  const byPos = new Map<string | null, (typeof box.aliquots)[0]>();
  for (const a of box.aliquots) {
    byPos.set(a.position, a);
  }

  const rows = Array.from({ length: box.rows }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const cols = Array.from({ length: box.cols }, (_, i) => i + 1);

  return (
    <div>
      <div className="mb-4">
        <Link href="/storage" className="text-sm text-gray-500 hover:text-gray-700">
          ← Storage
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900">
        {box.freezer.name} / {box.name}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {box.rows}×{box.cols} grid. Click a position to view aliquot.
      </p>
      <BoxGrid
        boxId={box.id}
        rows={rows}
        cols={cols}
        byPos={Object.fromEntries(byPos)}
      />
    </div>
  );
}
