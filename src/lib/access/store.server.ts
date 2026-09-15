import { readFile, rename, writeFile } from "node:fs/promises";
import { DEFAULT_ROLE_PERMISSIONS } from "./permissions";
import { hashPassword, newId } from "./crypto.server";
import type { AccessStore } from "./types";
import { dataFile, ensureDataDir } from "@/lib/data-path.server";

const FILE_NAME = "access.json";

let memory: AccessStore | null = null;
let persistPath: string | null = null;
let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function createDefaultStore(): AccessStore {
  const now = new Date().toISOString();
  return {
    version: 1,
    updatedAt: now,
    users: [
      {
        id: newId("admin"),
        username: "admin",
        passwordHash: hashPassword("Admin@123"),
        role: "admin",
        active: true,
        displayName: "مدیر سیستم",
        createdAt: now,
      },
    ],
    rolePermissions: structuredClone(DEFAULT_ROLE_PERMISSIONS),
    sessions: [],
  };
}

async function atomicWrite(path: string, json: string) {
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, json, "utf8");
  await rename(tmp, path);
}

async function tryLoad(path: string): Promise<AccessStore | null> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as AccessStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.users)) return null;
    if (!parsed.rolePermissions) {
      parsed.rolePermissions = structuredClone(DEFAULT_ROLE_PERMISSIONS);
    }
    if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
    return parsed;
  } catch {
    return null;
  }
}

async function resolveStore(): Promise<AccessStore> {
  if (memory) return memory;

  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  const loaded = await tryLoad(path);
  if (loaded) {
    persistPath = path;
    memory = loaded;
    return loaded;
  }

  const seed = createDefaultStore();
  memory = seed;
  await persist(seed);
  return seed;
}

async function persist(store: AccessStore) {
  await ensureDataDir();
  const path = dataFile(FILE_NAME);
  try {
    await atomicWrite(path, JSON.stringify(store, null, 2));
    persistPath = path;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `ذخیره access.json ناموفق: ${path}\n` +
        `پوشه را بسازید و دسترسی Modify به App Pool بدهید.\n(${msg})`,
    );
  }
}

export async function readAccessStore(): Promise<AccessStore> {
  return withLock(resolveStore);
}

export async function writeAccessStore(
  mutator: (store: AccessStore) => AccessStore,
): Promise<AccessStore> {
  return withLock(async () => {
    const current = await resolveStore();
    const next = mutator(current);
    next.updatedAt = new Date().toISOString();
    next.version = 1;
    const now = Date.now();
    next.sessions = next.sessions.filter(
      (s) => new Date(s.expiresAt).getTime() > now,
    );
    memory = next;
    await persist(next);
    return next;
  });
}
