import Link from "next/link";
import { prisma } from "@/lib/db";
import { CreateFreezerForm } from "./CreateFreezerForm";
import { CreateBoxForm } from "./CreateBoxForm";

export const revalidate = 0;

export default async function StoragePage() {
  const freezers = await prisma.freezer.findMany({
    orderBy: { name: "asc" },
    include: {
      boxes: { orderBy: { name: "asc" }, include: { _count: { select: { aliquots: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Storage</h1>
      <p className="mt-1 text-sm text-gray-500">
        Freezers → Boxes → Position (e.g. A1). Assign locations when creating or editing aliquots.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <CreateFreezerForm />
        <CreateBoxForm freezers={freezers} />
      </div>

      <div className="mt-8 space-y-6">
        {freezers.length === 0 ? (
          <p className="text-gray-500">No freezers yet. Create one above.</p>
        ) : (
          freezers.map((f) => (
            <section key={f.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{f.name}</h2>
              </div>
              {f.boxes.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No boxes.</p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {f.boxes.map((b) => (
                    <li key={b.id} className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900">{b.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {b.rows}×{b.cols} · {b._count.aliquots} aliquots
                        </span>
                      </div>
                      <Link
                        href={`/storage/box/${b.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Grid →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
