-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lotNumber" TEXT NOT NULL,
    "manufacturer" TEXT,
    "supplierName" TEXT,
    "supplierUrl" TEXT,
    "qcStatus" TEXT NOT NULL DEFAULT 'PENDING_QC',
    "receivedDate" DATETIME,
    "expiryDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "typeCategory" TEXT,
    "batchId" TEXT NOT NULL,
    "manufacturer" TEXT,
    "supplierName" TEXT,
    "supplierUrl" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sample_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Freezer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freezerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL DEFAULT 8,
    "cols" INTEGER NOT NULL DEFAULT 12,
    CONSTRAINT "Box_freezerId_fkey" FOREIGN KEY ("freezerId") REFERENCES "Freezer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aliquot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aliquotId" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "volume" REAL,
    "concentration" REAL,
    "unit" TEXT,
    "createdById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_QC',
    "freezerId" TEXT,
    "boxId" TEXT,
    "position" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Aliquot_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Aliquot_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Aliquot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Aliquot_freezerId_fkey" FOREIGN KEY ("freezerId") REFERENCES "Freezer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Aliquot_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "performedDate" DATETIME NOT NULL,
    "notes" TEXT,
    "outputs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Experiment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "readAt" DATETIME
);

-- CreateTable
CREATE TABLE "AlertExperiment" (
    "alertId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "acknowledgedAt" DATETIME,
    "acknowledgedById" TEXT,
    PRIMARY KEY ("alertId", "experimentId"),
    CONSTRAINT "AlertExperiment_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlertExperiment_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlertExperiment_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Batch_lotNumber_idx" ON "Batch"("lotNumber");

-- CreateIndex
CREATE INDEX "Batch_qcStatus_idx" ON "Batch"("qcStatus");

-- CreateIndex
CREATE INDEX "Sample_batchId_idx" ON "Sample"("batchId");

-- CreateIndex
CREATE INDEX "Sample_name_idx" ON "Sample"("name");

-- CreateIndex
CREATE INDEX "Box_freezerId_idx" ON "Box"("freezerId");

-- CreateIndex
CREATE UNIQUE INDEX "Aliquot_aliquotId_key" ON "Aliquot"("aliquotId");

-- CreateIndex
CREATE INDEX "Aliquot_sampleId_idx" ON "Aliquot"("sampleId");

-- CreateIndex
CREATE INDEX "Aliquot_batchId_idx" ON "Aliquot"("batchId");

-- CreateIndex
CREATE INDEX "Aliquot_aliquotId_idx" ON "Aliquot"("aliquotId");

-- CreateIndex
CREATE INDEX "Aliquot_status_idx" ON "Aliquot"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Aliquot_boxId_position_key" ON "Aliquot"("boxId", "position");

-- CreateIndex
CREATE INDEX "Experiment_ownerId_idx" ON "Experiment"("ownerId");

-- CreateIndex
CREATE INDEX "Experiment_performedDate_idx" ON "Experiment"("performedDate");

-- CreateIndex
CREATE INDEX "ExperimentAliquot_aliquotId_idx" ON "ExperimentAliquot"("aliquotId");

-- CreateIndex
CREATE INDEX "Alert_entityType_entityId_idx" ON "Alert"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "AlertExperiment_experimentId_idx" ON "AlertExperiment"("experimentId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
