# Aliquot First-Class

A proof-of-concept web application for tracking lab aliquots with unique traceable codes. Built with Next.js, Prisma, and SQLite.

## Problem Statement

In laboratory settings, there's a critical distinction between:
- **Batch-level truth**: Vendor shipments arrive as batches (lot-level tracking)
- **Aliquot-level truth**: Individual aliquots are created from batches and need unique traceability

When a contamination occurs, you need to trace which experiments used a specific aliquot—the "blast radius" of contamination.

## Features (MVP)

1. **Track Vendor Batches**: Record batch information (vendor, product, lot number, dates)
2. **Generate Aliquots**: Bulk create aliquots from batches with unique human-readable codes
3. **Create Experiments**: Track experiments and attach aliquots used (provenance)
4. **Contamination Tracking**: Mark aliquots as contaminated and see all affected experiments (blast radius)
5. **QR Code Labels**: Generate printable PDF label sheets with QR codes for aliquots

## Aliquot Code Format

Format: `<PRODUCT>-<LOT>-<YYYYMMDD>-A<NN>-<SUFFIX>`

Example: `FBS-12345ABC-20260118-A10-K7P2`

- **PRODUCT**: Sanitized product name (uppercase letters/numbers)
- **LOT**: Sanitized lot number
- **YYYYMMDD**: Date the aliquot was made
- **A<NN>**: 2-digit aliquot index (01, 02, ...)
- **SUFFIX**: 4-character random base32-like code for collision avoidance

Codes are guaranteed unique at the database level.

## Data Model

### Batch
- Vendor, product name, catalog number (optional), lot number
- Received date, expiry date (optional), notes (optional)
- Relations: Has many aliquots

### Aliquot
- Belongs to a batch
- Made date, aliquot index, volume/unit (optional), storage location (optional)
- Status enum: `OK`, `QUARANTINED`, `CONTAMINATED`, `CONSUMED`
- Unique code (generated)

### Experiment
- Title, performed date, operator (optional), notes (optional)
- Relations: Many-to-many with aliquots via join table

### ExperimentAliquot (Join Table)
- Links experiments to aliquots
- Usage notes (optional), added timestamp

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **Prisma 6** (ORM, pinned to v6 for compatibility)
- **SQLite** (local database)
- **Tailwind CSS** (styling)
- **pdf-lib** (PDF generation)
- **qrcode** (QR code generation)

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- No Prisma 7 installed (project uses Prisma 6)

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```
   This will:
   - Create the SQLite database file (`dev.db`)
   - Generate Prisma Client
   - Apply all migrations

4. **Seed the database (optional but recommended for demo):**
   ```bash
   npm run seed
   ```
   This creates:
   - 1 batch (Fetal Bovine Serum)
   - 5 aliquots (with unique codes)
   - 1 experiment linked to 3 aliquots

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run seed` - Seed database with demo data

## Demo Flow

1. **View Batches** (`/batches`)
   - See existing batches or create a new one
   - Demo data includes one batch

2. **Generate Aliquots** (`/batches/[id]`)
   - Click on a batch to view details
   - Use "Generate Aliquots" form to create multiple aliquots at once
   - Download PDF labels for aliquots

3. **View Aliquot Details** (`/aliquots/[id]`)
   - See aliquot information, batch details, status
   - View "Blast Radius": experiments using this aliquot
   - See "Adjacent Aliquots": other aliquots from same batch/date
   - Update status (OK → QUARANTINED → CONTAMINATED)

4. **Create Experiments** (`/experiments`)
   - Create an experiment with title, date, operator
   - Attach aliquots by searching their codes
   - View attached aliquots and remove if needed

5. **Test Blast Radius**
   - Mark an aliquot as `CONTAMINATED`
   - Go to aliquot detail page to see all affected experiments
   - This demonstrates the contamination traceability feature

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── labels/route.ts          # PDF label generation endpoint
│   ├── aliquots/[id]/                # Aliquot detail page
│   ├── batches/
│   │   ├── [id]/                     # Batch detail + aliquot generation
│   │   └── page.tsx                  # Batch list + create
│   ├── experiments/
│   │   ├── [id]/                     # Experiment detail + attach aliquots
│   │   └── page.tsx                  # Experiment list + create
│   └── page.tsx                      # Home page
├── lib/
│   ├── codegen.ts                    # Aliquot code generation logic
│   ├── db.ts                         # Prisma client (with hot-reload protection)
│   └── labels.ts                     # PDF/QR code generation
prisma/
├── schema.prisma                     # Database schema
└── seed.ts                           # Seed script
```

## Schema Overview

The Prisma schema defines:
- 4 models: `Batch`, `Aliquot`, `Experiment`, `ExperimentAliquot`
- 1 enum: `AliquotStatus`
- Relations with cascade deletes
- Indexes on frequently queried fields (codes, status, dates)

## Important Notes

- **No Authentication**: This is a PoC with no auth or permissions
- **No Compliance Claims**: Not intended for regulated environments
- **Prisma 6**: Pinned to Prisma 6 (not 7) due to config-mode compatibility
- **SQLite**: Uses file-based SQLite for local development
- **Server Actions**: Most mutations use Next.js Server Actions (App Router)
- **Code Uniqueness**: Aliquot codes are enforced unique at DB level with retry logic

## Troubleshooting

**Prisma Client not found:**
```bash
npx prisma generate
```

**Database migration issues:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create fresh migration
npx prisma migrate dev --name init
```

**Module resolution issues:**
- Ensure `tsconfig.json` has `"@/*": ["./src/*"]` paths
- Restart the dev server after changes

## License

This is a proof-of-concept project for demonstration purposes.
