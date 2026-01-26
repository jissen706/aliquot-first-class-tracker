# Aliquot First-Class

A lightweight **sample + aliquot traceability** MVP for small academic biology labs. Answer *"where did it go and who used it?"* in under 30 seconds. Excel-first adoption, scientist-friendly naming, desktop/iPad-friendly.

**Not** a full ELN/LIMS. Use alongside Excel and lab notebooks.

## Problem Statement

- **Batch-level truth**: Vendor shipments (lot-level).
- **Aliquot-level truth**: Individual aliquots from batches, uniquely traceable.
- When something goes wrong: quickly see **Impact** (experiments, users, outputs) and support QC release / fail flows.

## Features (MVP)

- **Samples** (parent stock): name, type/category, batch, manufacturer, supplier (name + URL).
- **Aliquots**: linked to sample, batch; volume, concentration; status (Pending QC, Released/QC Passed, Quarantined, Contaminated, Consumed); storage Freezer → Box → Position (grid).
- **Experiments**: title, owner, date, notes; attach aliquots; optional outputs (JSON `[{url, label}]`).
- **Batches**: lot, manufacturer, supplier, QC status. **Release batch** (QC Passed) or **Fail QC** (quarantine aliquots, flag experiments).
- **Impact panel**: sibling aliquots, experiments using aliquot/batch, affected users, outputs to review.
- **Mark contaminated** (aliquot) / **Fail QC** (batch) → alerts, affected experiments, **Acknowledged** per experiment.
- **Storage**: Freezers, Boxes (e.g. 8×12), grid view; assign positions to aliquots.
- **Labels**: PDF + XLSX (sample name, aliquot ID, concentration, date, QR).
- **Import/Export**: XLSX templates, import wizard (preview + commit), export Samples/Aliquots/Experiments/Impact.
- **Auth**: email/password (MVP). Design allows adding SSO later.
- **Alerts**: in-app list; email stubbed (log/DB).
- **Audit log**: status changes, QC actions (timestamp, user, reason).

## Tech Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS
- Prisma 6 + SQLite (Pin Prisma 6; avoid config-mode/Prisma 7)
- Zod, React Hook Form, Server Actions
- NextAuth (Credentials + JWT)
- pdf-lib, qrcode, exceljs

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Create `.env` in project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

Use a random string for `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).

### 3. Database

```bash
npx prisma migrate dev
npm run seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register or use seed user:

- **Email:** `demo@example.com`  
- **Password:** `demo1234`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:migrate` | Run migrations |
| `npm run seed` | Seed demo data |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home (login/register or app links) |
| `/login`, `/register` | Auth |
| `/samples` | List, create; edit → generate aliquots |
| `/aliquots` | List; detail → Impact, status, location, labels |
| `/experiments` | List, create; detail → attach aliquots, outputs, alerts/ack |
| `/batches` | List, create; detail → QC release/fail, Impact, aliquots |
| `/storage` | Freezers, boxes; box grid (8×12) |
| `/alerts` | Notification center |
| `/import-export` | Templates, import wizard, exports |
| `/search?q=` | Search aliquot ID, sample name, batch |

## Demo Flow

1. Log in as `demo@example.com` / `demo1234`.
2. **Batches** → Create batch (lot, manufacturer, supplier).
3. **Samples** → Create sample (link batch) → Edit → **Generate aliquots**.
4. **Storage** → Add freezer, box → **Aliquots** → assign location.
5. **Experiments** → Create → attach aliquots by ID → add outputs (JSON).
6. **Aliquot** → **Mark as contaminated** → check **Impact**; open experiment → **Acknowledge**.
7. **Batch** → **Release batch** or **Fail QC** → see Impact, alerts.
8. **Import/Export** → download templates, import, export; **Labels** PDF/XLSX.

## Schema Overview

- **User**: name, email, passwordHash, role.
- **Batch**: lotNumber, manufacturer, supplierName, supplierUrl, qcStatus (PENDING_QC | RELEASED_QC_PASSED | FAILED_QC), received/expiry, notes.
- **Sample**: name, typeCategory, batchId, manufacturer, supplier*, creationDate, notes.
- **Aliquot**: aliquotId (unique), sampleId, batchId, volume, concentration, unit, status, freezerId, boxId, position, createdBy.
- **Experiment**: title, ownerId, performedDate, notes, outputs (JSON).
- **ExperimentAliquot**: experimentId, aliquotId, usageNotes, addedAt.
- **Alert**: type (CONTAMINATION | QC_FAILURE), entityType/entityId, title, message; **AlertExperiment** (acknowledged).
- **AuditLog**: entityType, entityId, action, userId, reason, metadata.
- **Freezer**, **Box** (rows/cols), aliquots reference box + position.

## Compliance / Scope

- No auth claims, no permissions model, no compliance framework.
- No proximity-based contamination; impact is via **which experiments used the aliquot/batch**.
- Email notifications are stubbed (console/DB); replace with real provider when needed.

## License

Proof-of-concept for demo use.
