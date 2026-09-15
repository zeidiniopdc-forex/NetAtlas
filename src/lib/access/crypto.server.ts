import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const LEGACY_SALT = "netatlas-access-v1";
const KEY_LENGTH = 64;
const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, Buffer.from(salt, "hex"), KEY_LENGTH, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  if (encoded.startsWith("scrypt$")) {
    const [, saltHex, hashHex] = encoded.split("$");
    if (!saltHex || !hashHex || hashHex.length !== KEY_LENGTH * 2) return false;
    try {
      const expected = Buffer.from(hashHex, "hex");
      const actual = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH, {
        N: SCRYPT_COST,
        r: SCRYPT_BLOCK_SIZE,
        p: SCRYPT_PARALLELIZATION,
        maxmem: 32 * 1024 * 1024,
      });
      return timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  // Backward compatibility: existing users can still log in once and be upgraded.
  const legacy = createHash("sha256").update(`${LEGACY_SALT}:${password}`).digest("hex");
  return timingSafeEqual(Buffer.from(legacy), Buffer.from(encoded));
}

export function isLegacyPasswordHash(encoded: string): boolean {
  return !encoded.startsWith("scrypt$");
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function newId(prefix = "u"): string {
  return `${prefix}-${randomBytes(12).toString("hex")}`;
}
