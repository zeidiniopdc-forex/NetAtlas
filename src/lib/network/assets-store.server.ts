import { readFile, rename, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import type { NetworkAsset } from "./assets";
import { buildAssetRegistry } from "./assets";
import { listRecords } from "@/lib/inventory/store.server";
import { dataFile, ensureDataDir } from "@/lib/data-path.server";

export type AssetStore = {
  version: 1;
  updatedAt: string;
  assets: NetworkAsset[];
};

const FILE_NAME = "assets.json";
let memory: AssetStore | null = null;
let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = chain.then(fn, fn);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

function newId() {
  return `asset-${Date.now().toString(36)}-${randomBytes(6).toString("hex")}`;
}

async function persist(store: AssetStore) {
  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, path);
}

async function resolveStore(): Promise<AssetStore> {
  if (memory) return memory;
  await ensureDataDir();
  try {
    const parsed = JSON.parse(await readFile(dataFile(FILE_NAME), "utf8")) as AssetStore;
    if (parsed?.version === 1 && Array.isArray(parsed.assets)) {
      memory = parsed;
      return parsed;
    }
  } catch {
    // First run: migrate the current inventory-derived registry.
  }

  const derived = buildAssetRegistry(await listRecords()).assets.map((asset) => ({
    ...asset,
    id: newId(),
  }));
  const now = new Date().toISOString();
  const seed: AssetStore = { version: 1, updatedAt: now, assets: derived };
  memory = seed;
  await persist(seed);
  return seed;
}

export async function readAssetStore() {
  return withLock(resolveStore);
}

export async function writeAssetStore(mutator: (store: AssetStore) => AssetStore) {
  return withLock(async () => {
    const current = await resolveStore();
    const next = mutator(current);
    next.version = 1;
    next.updatedAt = new Date().toISOString();
    memory = next;
    await persist(next);
    return next;
  });
}

export async function listAssets() {
  return (await readAssetStore()).assets;
}
