import { readFile, rename, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import type { Vlan } from "./vlans";
import { dataFile, ensureDataDir } from "@/lib/data-path.server";

export type VlanStore = { version: 1; updatedAt: string; vlans: Vlan[] };
const FILE_NAME = "vlans.json";
let memory: VlanStore | null = null;
let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = chain.then(fn, fn);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

function newId() { return `vlan-${Date.now().toString(36)}-${randomBytes(5).toString("hex")}`; }

async function persist(store: VlanStore) {
  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, path);
}

async function resolveStore() {
  if (memory) return memory;
  await ensureDataDir();
  try {
    const parsed = JSON.parse(await readFile(dataFile(FILE_NAME), "utf8")) as VlanStore;
    if (parsed?.version === 1 && Array.isArray(parsed.vlans)) { memory = parsed; return parsed; }
  } catch {}
  const now = new Date().toISOString();
  const seed: VlanStore = { version: 1, updatedAt: now, vlans: [] };
  memory = seed;
  await persist(seed);
  return seed;
}

export async function readVlanStore() { return withLock(resolveStore); }
export async function writeVlanStore(mutator: (store: VlanStore) => VlanStore) {
  return withLock(async () => {
    const next = mutator(await resolveStore());
    next.version = 1;
    next.updatedAt = new Date().toISOString();
    memory = next;
    await persist(next);
    return next;
  });
}
export async function listVlans() { return (await readVlanStore()).vlans; }
export { newId as newVlanId };
