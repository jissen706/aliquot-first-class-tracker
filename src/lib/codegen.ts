import { prisma } from "./db";

export function sanitizeToken(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

export function base32Suffix(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function dateYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Generate unique aliquotId: <SAMPLE>-<LOT>-<YYYYMMDD>-A<NN>-<SUFFIX>
 * e.g. FBS-L12345-20250125-A01-K7P2
 */
export async function generateAliquotId(
  sampleName: string,
  lotNumber: string,
  date: Date,
  index: number
): Promise<string> {
  const sample = sanitizeToken(sampleName) || "X";
  const lot = sanitizeToken(lotNumber) || "X";
  const ymd = dateYmd(date);
  const nn = String(index).padStart(2, "0");

  for (let i = 0; i < 10; i++) {
    const suffix = base32Suffix();
    const id = `${sample}-${lot}-${ymd}-A${nn}-${suffix}`;
    const exists = await prisma.aliquot.findUnique({ where: { aliquotId: id }, select: { id: true } });
    if (!exists) return id;
  }
  return `${sample}-${lot}-${ymd}-A${nn}-${base32Suffix()}${Date.now().toString(36).slice(-2)}`;
}
