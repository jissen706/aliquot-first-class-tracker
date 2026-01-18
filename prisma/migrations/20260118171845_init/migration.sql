-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "catalogNumber" TEXT,
    "lotNumber" TEXT NOT NULL,
    "receivedDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Aliquot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "madeDate" DATETIME NOT NULL,
    "aliquotIndex" INTEGER NOT NULL,
    "volume" REAL,
    "unit" TEXT,
    "storageLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OK',
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Aliquot_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "performedDate" DATETIME NOT NULL,
    "operator" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ExperimentAliquot" (
    "experimentId" TEXT NOT NULL,
    "aliquotId" TEXT NOT NULL,
    "usageNotes" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("experimentId", "aliquotId"),
    CONSTRAINT "ExperimentAliquot_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExperimentAliquot_aliquotId_fkey" FOREIGN KEY ("aliquotId") REFERENCES "Aliquot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Batch_lotNumber_idx" ON "Batch"("lotNumber");

-- CreateIndex
CREATE INDEX "Batch_vendor_idx" ON "Batch"("vendor");

-- CreateIndex
CREATE UNIQUE INDEX "Aliquot_code_key" ON "Aliquot"("code");

-- CreateIndex
CREATE INDEX "Aliquot_batchId_idx" ON "Aliquot"("batchId");

-- CreateIndex
CREATE INDEX "Aliquot_code_idx" ON "Aliquot"("code");

-- CreateIndex
CREATE INDEX "Aliquot_status_idx" ON "Aliquot"("status");

-- CreateIndex
CREATE INDEX "Aliquot_madeDate_idx" ON "Aliquot"("madeDate");

-- CreateIndex
CREATE INDEX "Aliquot_batchId_madeDate_aliquotIndex_idx" ON "Aliquot"("batchId", "madeDate", "aliquotIndex");

-- CreateIndex
CREATE INDEX "Experiment_performedDate_idx" ON "Experiment"("performedDate");

-- CreateIndex
CREATE INDEX "ExperimentAliquot_aliquotId_idx" ON "ExperimentAliquot"("aliquotId");
