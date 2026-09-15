import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PGlite } from "@electric-sql/pglite";

/**
 * Persistent embedded Postgres (PGlite / WASM) for NetAtlas inventory + access.
 * Data lives under INVENTORY_DATA_DIR (or ./data) — keep that folder OUTSIDE
 * the IIS publish package so deploys never wipe user data.
 */

const globalRef = globalThis as typeof globalThis & {
  __netatlasPg__?: Promise<PGlite>;
  __netatlasDbPath__?: string;
  __netatlasDbReady__?: Promise<void>;
};

export function dataRoot(): string {
  const env = process.env.INVENTORY_DATA_DIR?.trim();
  if (env) return env;
  return join(process.cwd(), "data");
}

export function dbDataDir(): string {
  return join(dataRoot(), "pglite");
}

async function openDb(): Promise<PGlite> {
  const dir = dbDataDir();
  await mkdir(dir, { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const pg = new PGlite(dir);
  await pg.waitReady;
  await pg.exec(`
    create table if not exists inventory_records (
      id text primary key,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    );
    create table if not exists access_users (
      id text primary key,
      username text not null unique,
      password_hash text not null,
      role text not null,
      active boolean not null default true,
      display_name text not null,
      created_at timestamptz not null
    );
    create table if not exists access_sessions (
      token text primary key,
      user_id text not null references access_users(id) on delete cascade,
      expires_at timestamptz not null
    );
    create table if not exists access_role_permissions (
      role text primary key,
      pages jsonb not null,
      can_edit boolean not null default false
    );
    create table if not exists netatlas_meta (
      key text primary key,
      value text not null
    );
    create index if not exists idx_inventory_updated on inventory_records(updated_at desc);
    create index if not exists idx_sessions_user on access_sessions(user_id);
  `);
  globalRef.__netatlasDbPath__ = dir;
  return pg;
}

export function getNetatlasDb(): Promise<PGlite> {
  globalRef.__netatlasPg__ ??= openDb().catch((err) => {
    globalRef.__netatlasPg__ = undefined;
    throw err;
  });
  return globalRef.__netatlasPg__;
}

export function storagePathInfo() {
  return {
    path: globalRef.__netatlasDbPath__ ?? dbDataDir(),
    engine: "pglite" as const,
  };
}

/** One-shot import of legacy inventory.json / access.json if DB empty. */
export async function migrateLegacyJsonIfNeeded(pg: PGlite): Promise<void> {
  const invCount = await pg.query<{ c: number }>(
    "select count(*)::int as c from inventory_records",
  );
  const userCount = await pg.query<{ c: number }>(
    "select count(*)::int as c from access_users",
  );

  const root = dataRoot();

  if ((invCount.rows[0]?.c ?? 0) === 0) {
    for (const name of ["inventory.json"]) {
      try {
        const raw = await readFile(join(root, name), "utf8");
        const parsed = JSON.parse(raw) as { records?: unknown[] };
        const records = Array.isArray(parsed?.records)
          ? parsed.records
          : Array.isArray(parsed)
            ? (parsed as unknown[])
            : null;
        if (records && records.length > 0) {
          await pg.transaction(async (tx) => {
            for (const r of records) {
              const rec = r as { id?: string; updatedAt?: string };
              if (!rec?.id) continue;
              await tx.query(
                `insert into inventory_records (id, payload, updated_at)
                 values ($1, $2::jsonb, coalesce($3::timestamptz, now()))
                 on conflict (id) do nothing`,
                [rec.id, JSON.stringify(r), rec.updatedAt ?? null],
              );
            }
            await tx.query(
              `insert into netatlas_meta (key, value) values ('inventory_updated_at', $1)
               on conflict (key) do update set value = excluded.value`,
              [new Date().toISOString()],
            );
          });
          console.info(`[netatlas-db] migrated ${records.length} records from ${name}`);
          break;
        }
      } catch {
        /* no legacy file */
      }
    }
  }

  if ((userCount.rows[0]?.c ?? 0) === 0) {
    try {
      const raw = await readFile(join(root, "access.json"), "utf8");
      const parsed = JSON.parse(raw) as {
        users?: Array<{
          id: string;
          username: string;
          passwordHash: string;
          role: string;
          active: boolean;
          displayName: string;
          createdAt: string;
        }>;
        sessions?: Array<{ token: string; userId: string; expiresAt: string }>;
        rolePermissions?: Record<string, { pages: string[]; canEdit: boolean }>;
      };
      if (parsed?.users?.length) {
        await pg.transaction(async (tx) => {
          for (const u of parsed.users!) {
            await tx.query(
              `insert into access_users (id, username, password_hash, role, active, display_name, created_at)
               values ($1,$2,$3,$4,$5,$6,$7)
               on conflict (id) do nothing`,
              [
                u.id,
                u.username,
                u.passwordHash,
                u.role,
                u.active,
                u.displayName,
                u.createdAt,
              ],
            );
          }
          for (const s of parsed.sessions ?? []) {
            await tx.query(
              `insert into access_sessions (token, user_id, expires_at)
               values ($1,$2,$3)
               on conflict (token) do nothing`,
              [s.token, s.userId, s.expiresAt],
            );
          }
          if (parsed.rolePermissions) {
            for (const [role, perm] of Object.entries(parsed.rolePermissions)) {
              await tx.query(
                `insert into access_role_permissions (role, pages, can_edit)
                 values ($1, $2::jsonb, $3)
                 on conflict (role) do update set pages = excluded.pages, can_edit = excluded.can_edit`,
                [role, JSON.stringify(perm.pages), perm.canEdit],
              );
            }
          }
        });
        console.info(`[netatlas-db] migrated access from access.json`);
      }
    } catch {
      /* no legacy access */
    }
  }
}

export async function ensureNetatlasDb(): Promise<PGlite> {
  globalRef.__netatlasDbReady__ ??= (async () => {
    const pg = await getNetatlasDb();
    await migrateLegacyJsonIfNeeded(pg);
  })().catch((err) => {
    globalRef.__netatlasDbReady__ = undefined;
    throw err;
  });
  await globalRef.__netatlasDbReady__;
  return getNetatlasDb();
}
