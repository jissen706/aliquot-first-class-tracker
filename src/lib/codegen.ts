import { prisma } from "./db";

/**
 * Sanitizes a string to contain only uppercase letters and numbers
 */
export function sanitizeToken(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 20); // reasonable max length
}

/**
 * Generates a random 4-character suffix using base32-like characters (A-Z, 2-7)
 * Base32 alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ234567
 */
export function generateSuffix(): string {
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += base32Chars[Math.floor(Math.random() * base32Chars.length)];
  }
  return suffix;
}

/**
 * Formats a date as YYYYMMDD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Generates an aliquot code in format: <PRODUCT>-<LOT>-<YYYYMMDD>-A<NN>-<SUFFIX>
 * Example: FBS-12345ABC-20260118-A10-K7P2
 */
export async function generateAliquotCode(
  productName: string,
  lotNumber: string,
  madeDate: Date,
  aliquotIndex: number
): Promise<string> {
  const product = sanitizeToken(productName);
  const lot = sanitizeToken(lotNumber);
  const dateStr = formatDate(madeDate);
  const indexStr = String(aliquotIndex).padStart(2, "0");

  // Try up to 10 times to find a unique code
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = generateSuffix();
    const code = `${product}-${lot}-${dateStr}-A${indexStr}-${suffix}`;

    // Check uniqueness
    const existing = await prisma.aliquot.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  // Fallback: add timestamp if still colliding
  const suffix = generateSuffix();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-2);
  return `${product}-${lot}-${dateStr}-A${indexStr}-${suffix}${timestamp}`.slice(0, 100);
}

/**
 * Validates an aliquot code format
 */
export function validateCodeFormat(code: string): boolean {
  // Format: PRODUCT-LOT-YYYYMMDD-ANN-SUFFIX
  const pattern = /^[A-Z0-9]+-[A-Z0-9]+-\d{8}-A\d{2}-[A-Z2-7]{4,}$/;
  return pattern.test(code);
}

