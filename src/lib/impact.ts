import { prisma } from "./db";

export type ImpactSummary = {
  siblingAliquotCount: number;
  experimentCount: number;
  experiments: { id: string; title: string; performedDate: Date; ownerName: string; ownerEmail: string }[];
  affectedUserIds: Set<string>;
  outputsToReview: { url: string; label: string; experimentId: string }[];
};

/**
 * Impact for a single aliquot: siblings in same batch, experiments that used it (directly or via batch),
 * affected users, outputs needing review.
 */
export async function getAliquotImpact(aliquotId: string): Promise<ImpactSummary> {
  const aliquot = await prisma.aliquot.findUnique({
    where: { id: aliquotId },
    include: { batch: true, sample: true },
  });
  if (!aliquot) {
    return { siblingAliquotCount: 0, experimentCount: 0, experiments: [], affectedUserIds: new Set(), outputsToReview: [] };
  }

  const siblingCount = await prisma.aliquot.count({
    where: { batchId: aliquot.batchId },
  });

  const experimentAliquots = await prisma.experimentAliquot.findMany({
    where: { aliquotId },
    include: {
      experiment: {
        include: { owner: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  const experiments = experimentAliquots.map((ea) => ({
    id: ea.experiment.id,
    title: ea.experiment.title,
    performedDate: ea.experiment.performedDate,
    ownerName: ea.experiment.owner.name,
    ownerEmail: ea.experiment.owner.email,
  }));

  const affectedUserIds = new Set<string>();
  const outputsToReview: { url: string; label: string; experimentId: string }[] = [];

  for (const ea of experimentAliquots) {
    affectedUserIds.add(ea.experiment.ownerId);
    if (ea.experiment.outputs) {
      try {
        const arr = JSON.parse(ea.experiment.outputs) as { url?: string; label?: string }[];
        if (Array.isArray(arr)) {
          for (const o of arr) {
            if (o?.url) outputsToReview.push({
              url: String(o.url),
              label: (o.label as string) ?? "",
              experimentId: ea.experiment.id,
            });
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  return {
    siblingAliquotCount: siblingCount,
    experimentCount: experiments.length,
    experiments,
    affectedUserIds,
    outputsToReview,
  };
}

/**
 * Impact for a batch: all aliquots in batch, experiments using any of them, affected users.
 */
export async function getBatchImpact(batchId: string): Promise<{
  aliquotCount: number;
  experimentCount: number;
  experiments: { id: string; title: string; performedDate: Date; ownerName: string; ownerEmail: string }[];
  affectedUserIds: Set<string>;
  outputsToReview: { url: string; label: string; experimentId: string }[];
}> {
  const aliquotIds = await prisma.aliquot.findMany({
    where: { batchId },
    select: { id: true },
  });
  const ids = aliquotIds.map((a) => a.id);

  const experimentAliquots = await prisma.experimentAliquot.findMany({
    where: { aliquotId: { in: ids } },
    include: {
      experiment: {
        include: { owner: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  const seen = new Set<string>();
  const experiments: { id: string; title: string; performedDate: Date; ownerName: string; ownerEmail: string }[] = [];
  const affectedUserIds = new Set<string>();
  const outputsToReview: { url: string; label: string; experimentId: string }[] = [];

  for (const ea of experimentAliquots) {
    if (seen.has(ea.experimentId)) continue;
    seen.add(ea.experimentId);
    experiments.push({
      id: ea.experiment.id,
      title: ea.experiment.title,
      performedDate: ea.experiment.performedDate,
      ownerName: ea.experiment.owner.name,
      ownerEmail: ea.experiment.owner.email,
    });
    affectedUserIds.add(ea.experiment.ownerId);
    if (ea.experiment.outputs) {
      try {
        const arr = JSON.parse(ea.experiment.outputs) as { url?: string; label?: string }[];
        if (Array.isArray(arr)) {
          for (const o of arr) {
            if (o?.url) outputsToReview.push({
              url: String(o.url),
              label: (o.label as string) ?? "",
              experimentId: ea.experiment.id,
            });
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  return {
    aliquotCount: ids.length,
    experimentCount: experiments.length,
    experiments,
    affectedUserIds,
    outputsToReview,
  };
}
