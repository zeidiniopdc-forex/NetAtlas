import { readFile, rename, writeFile } from "node:fs/promises";
import { dataFile, ensureDataDir } from "@/lib/data-path.server";
import type { TopologyLink } from "./topology";

type Store = { version: 1; updatedAt: string; items: TopologyLink[] };
const FILE_NAME = "topology.json";
let memory: Store | null = null;
let chain: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>) { const run = chain.then(fn, fn); chain = run.then(() => undefined, () => undefined); return run; }
async function readStore(): Promise<Store> {
  if (memory) return memory;
  await ensureDataDir(); const path = dataFile(FILE_NAME);
  try { memory = JSON.parse(await readFile(path, "utf8")) as Store; } catch { memory = { version: 1, updatedAt: new Date().toISOString(), items: [] }; await persist(memory); }
  return memory;
}
async function persist(store: Store) { await ensureDataDir(); const path = dataFile(FILE_NAME); const tmp = `${path}.${process.pid}.tmp`; await writeFile(tmp, JSON.stringify(store, null, 2), "utf8"); await rename(tmp, path); }
export async function listTopology() { return (await readStore()).items; }
export async function saveTopology(item: TopologyLink) { return withLock(async () => { const store = await readStore(); const now = new Date().toISOString(); const next = { ...item, updatedAt: now, createdAt: item.createdAt || now }; const i = store.items.findIndex((x) => x.id === item.id); if (i >= 0) store.items[i] = next; else store.items.push(next); store.updatedAt = now; await persist(store); return next; }); }
export async function deleteTopology(id: string) { return withLock(async () => { const store = await readStore(); store.items = store.items.filter((x) => x.id !== id); store.updatedAt = new Date().toISOString(); await persist(store); }); }
