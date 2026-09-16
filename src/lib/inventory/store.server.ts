import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createSeedStore } from "./seed";
import type { InventoryRecord, InventoryStore } from "./types";
import { dataFile, dataRoot, ensureDataDir } from "@/lib/data-path.server";

const FILE_NAME = "inventory.json";

let memory: InventoryStore | null = null;
let persistPath: string | null = null;
let writable = true;
let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function atomicWrite(path: string, json: string) {
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, json, "utf8");
  await rename(tmp, path);
}

async function tryLoad(path: string): Promise<InventoryStore | null> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as InventoryStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.records)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hasRecords(store: InventoryStore | null): store is InventoryStore {
  return !!store && Array.isArray(store.records) && store.records.length > 0;
}

/**
 * Prefer runtime data dir. If missing/empty, fall back to bundled sample
 * under process.cwd()/data, then generated seed — so first boot on IIS
 * is never a blank table when sample data ships with the package.
 */
async function resolveStore(): Promise<InventoryStore> {
  if (memory) return memory;

  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  const loaded = await tryLoad(path);
  if (hasRecords(loaded)) {
    persistPath = path;
    memory = loaded;
    return loaded;
  }

  const bundledPath = join(process.cwd(), "data", FILE_NAME);
  const bundled = await tryLoad(bundledPath);
  if (hasRecords(bundled)) {
    memory = bundled;
    try {
      await persist(bundled);
    } catch {
      // Keep in-memory even if persist fails (read-only volume).
    }
    return bundled;
  }

  const seed = createSeedStore();
  memory = seed;
  try {
    await persist(seed);
  } catch {
    // still serve seed from memory
  }
  return seed;
}

async function persist(store: InventoryStore) {
  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  try {
    await atomicWrite(path, JSON.stringify(store, null, 2));
    persistPath = path;
    writable = true;
  } catch (err) {
    writable = false;
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`ذخیره inventory.json ناموفق: ${path}\n${msg}`);
  }
}

export async function readStore(): Promise<InventoryStore> {
  return withLock(resolveStore);
}

export async function writeStore(
  mutator: (store: InventoryStore) => InventoryStore,
): Promise<InventoryStore> {
  return withLock(async () => {
    const current = await resolveStore();
    const next = mutator(current);
    next.updatedAt = new Date().toISOString();
    next.version = 1;
    memory = next;
    await persist(next);
    return next;
  });
}

export async function listRecords() {
  return (await readStore()).records;
}

export async function saveAll(records: InventoryRecord[]) {
  return writeStore((s) => ({ ...s, records }));
}

export function storageInfo() {
  return {
    path: persistPath ?? dataFile(FILE_NAME),
    root: dataRoot(),
    engine: "json" as const,
    writable,
  };
}
