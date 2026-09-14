import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DEFAULT_ROLE_PERMISSIONS } from "./permissions";
import { hashPassword, newId } from "./crypto";
import type { AccessStore } from "./types";

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

function candidateDirs() {
  const env = process.env.INVENTORY_DATA_DIR?.trim();
  const list = [env, join(process.cwd(), "data"), "/tmp/netatlas-data"].filter(
    (d): d is string => Boolean(d),
  );
  return [...new Set(list)];
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
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, json, "utf8");
  await rename(tmp, path);
}

async function tryLoad(path: string): Promise<AccessStore | null> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as AccessStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.users)) return null;
    if (!parsed.rolePermissions) parsed.rolePermissions = structuredClone(DEFAULT_ROLE_PERMISSIONS);
    if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
    return parsed;
  } catch {
    return null;
  }
}

async function resolveStore(): Promise<AccessStore> {
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
  const seed = createDefaultStore();
  memory = seed;
  await persist(seed);
  return seed;
}

async function persist(store: AccessStore) {
  const payload = JSON.stringify(store, null, 2);
  const dirs = persistPath ? [dirname(persistPath), ...candidateDirs()] : candidateDirs();
  for (const dir of dirs) {
    const path = join(dir, FILE_NAME);
    try {
      await atomicWrite(path, payload);
      persistPath = path;
      return;
    } catch {
      continue;
    }
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
    next.sessions = next.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
    memory = next;
    await persist(next);
    return next;
  });
}
