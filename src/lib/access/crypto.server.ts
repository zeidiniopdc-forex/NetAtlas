import { createHash, randomBytes } from "node:crypto";

const SALT = "netatlas-access-v1";

export function hashPassword(password: string): string {
  return createHash("sha256").update(`${SALT}:${password}`).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function newToken(): string {
  return randomBytes(24).toString("hex");
}

export function newId(prefix = "u"): string {
  return `${prefix}-${randomBytes(6).toString("hex")}`;
}
