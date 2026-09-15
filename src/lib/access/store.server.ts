import { DEFAULT_ROLE_PERMISSIONS } from "./permissions";
import { hashPassword, newId } from "./crypto.server";
import type { AccessStore, AccessUser, Role, RolePermissions } from "./types";
import { ensureNetatlasDb } from "@/lib/netatlas-db.server";

let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function defaultAdmin(): AccessUser {
  const now = new Date().toISOString();
  return {
    id: newId("admin"),
    username: "admin",
    passwordHash: hashPassword("Admin@123"),
    role: "admin",
    active: true,
    displayName: "مدیر سیستم",
    createdAt: now,
  };
}

async function loadAll(): Promise<AccessStore> {
  const pg = await ensureNetatlasDb();

  const usersRows = await pg.query<{
    id: string;
    username: string;
    password_hash: string;
    role: string;
    active: boolean;
    display_name: string;
    created_at: string;
  }>("select * from access_users order by created_at");

  const sessionRows = await pg.query<{
    token: string;
    user_id: string;
    expires_at: string;
  }>("select * from access_sessions");

  const permRows = await pg.query<{
    role: string;
    pages: string[] | string;
    can_edit: boolean;
  }>("select * from access_role_permissions");

  let users: AccessUser[] = usersRows.rows.map((u) => ({
    id: u.id,
    username: u.username,
    passwordHash: u.password_hash,
    role: u.role as Role,
    active: Boolean(u.active),
    displayName: u.display_name,
    createdAt:
      typeof u.created_at === "string"
        ? u.created_at
        : new Date(u.created_at).toISOString(),
  }));

  if (users.length === 0) {
    const admin = defaultAdmin();
    await pg.query(
      `insert into access_users (id, username, password_hash, role, active, display_name, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        admin.id,
        admin.username,
        admin.passwordHash,
        admin.role,
        admin.active,
        admin.displayName,
        admin.createdAt,
      ],
    );
    users = [admin];
  }

  const rolePermissions: Record<Role, RolePermissions> = structuredClone(
    DEFAULT_ROLE_PERMISSIONS,
  );
  for (const row of permRows.rows) {
    const pages =
      typeof row.pages === "string"
        ? (JSON.parse(row.pages) as RolePermissions["pages"])
        : (row.pages as RolePermissions["pages"]);
    if (row.role === "admin" || row.role === "user") {
      rolePermissions[row.role] = {
        pages,
        canEdit: Boolean(row.can_edit),
      };
    }
  }

  if (permRows.rows.length === 0) {
    for (const [role, perm] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      await pg.query(
        `insert into access_role_permissions (role, pages, can_edit)
         values ($1, $2::jsonb, $3)
         on conflict (role) do nothing`,
        [role, JSON.stringify(perm.pages), perm.canEdit],
      );
    }
  }

  const now = Date.now();
  const sessions = sessionRows.rows
    .map((s) => ({
      token: s.token,
      userId: s.user_id,
      expiresAt:
        typeof s.expires_at === "string"
          ? s.expires_at
          : new Date(s.expires_at).toISOString(),
    }))
    .filter((s) => new Date(s.expiresAt).getTime() > now);

  const meta = await pg.query<{ value: string }>(
    "select value from netatlas_meta where key = 'access_updated_at'",
  );

  return {
    version: 1,
    updatedAt: meta.rows[0]?.value ?? new Date().toISOString(),
    users,
    rolePermissions,
    sessions,
  };
}

async function persistAll(store: AccessStore) {
  const pg = await ensureNetatlasDb();
  await pg.transaction(async (tx) => {
    await tx.exec("delete from access_sessions");
    await tx.exec("delete from access_users");
    await tx.exec("delete from access_role_permissions");

    for (const u of store.users) {
      await tx.query(
        `insert into access_users (id, username, password_hash, role, active, display_name, created_at)
         values ($1,$2,$3,$4,$5,$6,$7)`,
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
    for (const s of store.sessions) {
      await tx.query(
        `insert into access_sessions (token, user_id, expires_at)
         values ($1,$2,$3)`,
        [s.token, s.userId, s.expiresAt],
      );
    }
    for (const [role, perm] of Object.entries(store.rolePermissions)) {
      await tx.query(
        `insert into access_role_permissions (role, pages, can_edit)
         values ($1, $2::jsonb, $3)`,
        [role, JSON.stringify(perm.pages), perm.canEdit],
      );
    }
    await tx.query(
      `insert into netatlas_meta (key, value) values ('access_updated_at', $1)
       on conflict (key) do update set value = excluded.value`,
      [store.updatedAt],
    );
  });
}

export async function readAccessStore(): Promise<AccessStore> {
  return withLock(loadAll);
}

export async function writeAccessStore(
  mutator: (store: AccessStore) => AccessStore,
): Promise<AccessStore> {
  return withLock(async () => {
    const current = await loadAll();
    const next = mutator(current);
    next.updatedAt = new Date().toISOString();
    next.version = 1;
    const now = Date.now();
    next.sessions = next.sessions.filter(
      (s) => new Date(s.expiresAt).getTime() > now,
    );
    await persistAll(next);
    return next;
  });
}
