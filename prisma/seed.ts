import { PrismaClient } from "@prisma/client";
import { generateAliquotCode } from "../src/lib/codegen";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a batch
  const batch = await prisma.batch.create({
    data: {
      vendor: "Sigma-Aldrich",
      productName: "Fetal Bovine Serum",
      catalogNumber: "F2442",
      lotNumber: "12345ABC",
      receivedDate: new Date("2024-01-15"),
      expiryDate: new Date("2026-01-15"),
      notes: "Premium grade, heat inactivated",
    },
  });

  console.log(`Created batch: ${batch.productName} (${batch.lotNumber})`);

  // Generate 5 aliquots
  const madeDate = new Date("2024-01-18");
  const aliquots = [];

  for (let i = 1; i <= 5; i++) {
    const code = await generateAliquotCode(
      batch.productName,
      batch.lotNumber,
      madeDate,
      i
    );

    const aliquot = await prisma.aliquot.create({
      data: {
        batchId: batch.id,
        madeDate,
        aliquotIndex: i,
        volume: 5.0,
        unit: "mL",
        storageLocation: `Freezer A, Shelf 1, Box ${Math.ceil(i / 2)}`,
        status: i === 3 ? "QUARANTINED" : "OK", // Make aliquot 3 quarantined for demo
        code,
      },
    });

    aliquots.push(aliquot);
    console.log(`Created aliquot: ${code}`);
  }

  // Create an experiment and link aliquots
  const experiment = await prisma.experiment.create({
    data: {
      title: "Cell Culture Optimization Study",
      performedDate: new Date("2024-02-01"),
      operator: "Dr. Jane Smith",
      notes: "Testing different serum concentrations for optimal growth",
    },
  });

  console.log(`Created experiment: ${experiment.title}`);

  // Link first 3 aliquots to the experiment
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
  console.log(`\nYou can now:`);
  console.log(`- View batches at /batches`);
  console.log(`- View experiments at /experiments`);
  console.log(`- Mark aliquot ${aliquots[2].code} as CONTAMINATED to see blast radius`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

