import { readFile, rename, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import type { AuditEntry, AuditStore } from "./types";
import { dataFile, ensureDataDir } from "@/lib/data-path.server";

const FILE_NAME = "audit.json";
const MAX_ENTRIES = 5000;
let memory: AuditStore | null = null;
let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

function newId() {
  return `audit-${Date.now().toString(36)}-${randomBytes(8).toString("hex")}`;
}

async function persist(store: AuditStore) {
  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, path);
}

async function resolve(): Promise<AuditStore> {
  if (memory) return memory;
  await ensureDataDir();
  try {
    const parsed = JSON.parse(await readFile(dataFile(FILE_NAME), "utf8")) as AuditStore;
    if (parsed?.version === 1 && Array.isArray(parsed.entries)) {
      memory = parsed;
      return parsed;
    }
  } catch {
    // First run or invalid file: start a clean audit store.
  }
  const now = new Date().toISOString();
  const seed: AuditStore = { version: 1, updatedAt: now, entries: [] };
  memory = seed;
  await persist(seed);
  return seed;
}

export async function appendAudit(
  entry: Omit<AuditEntry, "id" | "at">,
): Promise<void> {
  await withLock(async () => {
    const store = await resolve();
    const next: AuditStore = {
      version: 1,
      updatedAt: new Date().toISOString(),
      entries: [
        {
          ...entry,
          id: newId(),
          at: new Date().toISOString(),
        },
        ...store.entries,
      ].slice(0, MAX_ENTRIES),
    };
    memory = next;
    await persist(next);
  });
}

export async function listAudit(limit = 250): Promise<AuditEntry[]> {
  return withLock(async () => {
    const store = await resolve();
    return store.entries.slice(0, Math.max(1, Math.min(limit, MAX_ENTRIES)));
  });
}
