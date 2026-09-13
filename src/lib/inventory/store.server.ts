import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createSeedStore } from "./seed";
import type { InventoryRecord, InventoryStore } from "./types";

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

function candidateDirs() {
  const env = process.env.INVENTORY_DATA_DIR?.trim();
  const list = [
    env,
    join(process.cwd(), "data"),
    "/tmp/netatlas-data",
  ].filter((d): d is string => Boolean(d));
  return [...new Set(list)];
}

async function atomicWrite(path: string, json: string) {
  const tmp = `${path}.${process.pid}.tmp`;
  await mkdir(dirname(path), { recursive: true });
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

async function resolveStore(): Promise<InventoryStore> {
  if (memory) return memory;
  for (const dir of candidateDirs()) {
    const path = join(dir, FILE_NAME);
    const loaded = await tryLoad(path);
    if (loaded) {
      persistPath = path;
      memory = loaded;
      return loaded;
    }
  }
  const seed = createSeedStore();
  memory = seed;
  await persist(seed);
  return seed;
}

async function persist(store: InventoryStore) {
  const payload = JSON.stringify(store, null, 2);
  const dirs = persistPath ? [dirname(persistPath), ...candidateDirs()] : candidateDirs();
  for (const dir of dirs) {
    const path = join(dir, FILE_NAME);
    try {
      await atomicWrite(path, payload);
      persistPath = path;
      writable = true;
      return;
    } catch {
      continue;
    }
  }
  writable = false;
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
  return { path: persistPath, writable };
}
