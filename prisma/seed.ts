import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateAliquotId } from "../src/lib/codegen";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      passwordHash: hash,
      role: "scientist",
    },
  });
  console.log("Created user: demo@example.com / demo1234");

  const batch = await prisma.batch.create({
    data: {
      lotNumber: "12345ABC",
      manufacturer: "Sigma-Aldrich",
      supplierName: "Sigma-Aldrich",
      supplierUrl: "https://www.sigmaaldrich.com",
      qcStatus: "PENDING_QC",
      receivedDate: new Date("2024-01-15"),
      expiryDate: new Date("2026-01-15"),
      notes: "Fetal Bovine Serum, premium grade",
    },
  });
  console.log(`Created batch: ${batch.lotNumber}`);

  const sample = await prisma.sample.create({
    data: {
      name: "Fetal Bovine Serum",
      typeCategory: "Serum",
      batchId: batch.id,
      manufacturer: "Sigma-Aldrich",
      supplierName: "Sigma-Aldrich",
      supplierUrl: "https://www.sigmaaldrich.com",
      notes: "FBS",
    },
  });
  console.log(`Created sample: ${sample.name}`);

  const aliquots = [];
  const madeDate = new Date("2024-01-18");
  for (let i = 1; i <= 5; i++) {
    const aliquotId = await generateAliquotId(
      sample.name,
      batch.lotNumber,
      madeDate,
      i
    );
    const a = await prisma.aliquot.create({
      data: {
        aliquotId,
        sampleId: sample.id,
        batchId: batch.id,
        volume: 5,
        unit: "mL",
        concentration: 10,
        status: i === 3 ? "QUARANTINED" : "PENDING_QC",
        createdById: user.id,
      },
    });
    aliquots.push(a);
    console.log(`Created aliquot: ${aliquotId}`);
  }

  const freezer = await prisma.freezer.create({
    data: { name: "Freezer A" },
  });
  const box = await prisma.box.create({
    data: { freezerId: freezer.id, name: "Shelf 1", rows: 8, cols: 12 },
  });
  await prisma.aliquot.update({
    where: { id: aliquots[0].id },
    data: { freezerId: freezer.id, boxId: box.id, position: "A1" },
  });
  await prisma.aliquot.update({
    where: { id: aliquots[1].id },
    data: { freezerId: freezer.id, boxId: box.id, position: "A2" },
  });
  console.log("Created Freezer A, Box Shelf 1, assigned positions A1–A2");

  const experiment = await prisma.experiment.create({
    data: {
      title: "Cell Culture Optimization Study",
      performedDate: new Date("2024-02-01"),
      ownerId: user.id,
      notes: "Testing different serum concentrations",
      outputs: JSON.stringify([
        { url: "https://example.com/fig1", label: "Figure 1" },
      ]),
    },
  });
  console.log(`Created experiment: ${experiment.title}`);

  for (let i = 0; i < 3; i++) {
    await prisma.experimentAliquot.create({
      data: {
        experimentId: experiment.id,
        aliquotId: aliquots[i].id,
        usageNotes: `Used ${2.5 + i * 0.5} mL in trial ${i + 1}`,
      },
    });
  }
  console.log("Linked 3 aliquots to experiment");

  console.log("\n✅ Seeding completed!");
  console.log("Login: demo@example.com / demo1234");
  console.log("- Batches, Samples, Aliquots, Experiments, Storage, Alerts, Import/Export");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
