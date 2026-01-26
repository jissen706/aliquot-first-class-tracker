import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  createSamplesTemplate,
  createAliquotsTemplate,
} from "@/lib/xlsx";
import { ExportButtons } from "./ExportButtons";
import { ImportWizard } from "./ImportWizard";

export const revalidate = 0;

export default async function ImportExportPage() {
  const samplesCount = await prisma.sample.count();
  const aliquotsCount = await prisma.aliquot.count();
  const experimentsCount = await prisma.experiment.count();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Imports & Exports</h1>
      <p className="mt-1 text-sm text-gray-500">
        Excel-first. Download templates, import Samples/Aliquots, export data and impact reports.
      </p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
        <p className="mt-1 text-sm text-gray-500">
          Download XLSX templates, fill them in, then use the import wizard below.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <TemplateLink label="Samples template" fetcher={createSamplesTemplate} filename="samples-template.xlsx" />
          <TemplateLink label="Aliquots template" fetcher={createAliquotsTemplate} filename="aliquots-template.xlsx" />
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Import</h2>
        <ImportWizard />
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Export</h2>
        <p className="mt-1 text-sm text-gray-500">
          Samples: {samplesCount} · Aliquots: {aliquotsCount} · Experiments: {experimentsCount}
        </p>
        <ExportButtons />
      </section>
    </div>
  );
}

async function TemplateLink({
  label,
  fetcher,
  filename,
}: {
  label: string;
  fetcher: () => Promise<Buffer>;
  filename: string;
}) {
  const buf = await fetcher();
  const b64 = buf.toString("base64");
  const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64}`;
  return (
    <a
      href={dataUri}
      download={filename}
      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      {label}
    </a>
  );
}
