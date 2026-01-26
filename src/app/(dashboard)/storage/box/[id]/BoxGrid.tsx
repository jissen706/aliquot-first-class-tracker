"use client";

import Link from "next/link";

type Aliquot = {
  id: string;
  aliquotId: string;
  position: string | null;
  sample: { name: string };
};

export function BoxGrid({
  boxId,
  rows,
  cols,
  byPos,
}: {
  boxId: string;
  rows: string[];
  cols: number[];
  byPos: Record<string, Aliquot>;
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="inline-block border-collapse">
        <thead>
          <tr>
            <th className="w-8 border border-gray-300 bg-gray-100 p-1 text-center text-xs font-medium text-gray-600" />
            {cols.map((c) => (
              <th
                key={c}
                className="w-14 border border-gray-300 bg-gray-100 p-1 text-center text-xs font-medium text-gray-600"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="border border-gray-300 bg-gray-100 p-1 text-center text-xs font-medium text-gray-600">
                {r}
              </td>
              {cols.map((c) => {
                const pos = `${r}${c}`;
                const a = byPos[pos];
                return (
                  <td
                    key={pos}
                    className="h-12 w-14 border border-gray-300 p-0.5 text-center align-middle"
                  >
                    {a ? (
                      <Link
                        href={`/aliquots/${a.id}`}
                        className="block h-full w-full rounded bg-blue-50 px-1 py-1 text-xs font-mono text-blue-800 hover:bg-blue-100"
                        title={`${a.aliquotId} — ${a.sample.name}`}
                      >
                        {a.aliquotId.slice(-4)}
                      </Link>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
