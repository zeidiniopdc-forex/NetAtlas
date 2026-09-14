import { createServerFn } from "@tanstack/react-start";
import { ALL_PAGES, DEFAULT_ROLE_PERMISSIONS } from "./permissions";
import type {
  AccessUser,
  PageKey,
  PublicUser,
  Role,
  RolePermissions,
  SessionInfo,
} from "./types";

const COOKIE = "netatlas_session";
const SESSION_DAYS = 7;

function toPublic(u: AccessUser): PublicUser {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    displayName: u.displayName,
    active: u.active,
  };
}

function permsFor(
  role: Role,
  store: { rolePermissions: Record<Role, RolePermissions> },
): RolePermissions {
  if (role === "admin") {
    return { pages: [...ALL_PAGES], canEdit: true };
  }
  return store.rolePermissions.user ?? DEFAULT_ROLE_PERMISSIONS.user;
}

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const { sessionFromCookie } = await import("./session.server");
  return sessionFromCookie();
});

export const login = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { setCookie } = await import("@tanstack/react-start/server");
    const { readAccessStore, writeAccessStore } = await import("./store.server");
    const { newToken, verifyPassword } = await import("./crypto.server");

    const username = data.username.trim().toLowerCase();
    const store = await writeAccessStore((s) => s);
    const user = store.users.find(
      (u) => u.username.toLowerCase() === username && u.active,
    );
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw new Error("نام کاربری یا رمز عبور اشتباه است");
    }
    const token = newToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
    await writeAccessStore((s) => ({
      ...s,
      sessions: [
        ...s.sessions.filter((x) => x.userId !== user.id),
        { token, userId: user.id, expiresAt },
      ],
    }));
    setCookie(COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_DAYS * 86400,
    });
    const fresh = await readAccessStore();
    return {
      user: toPublic(user),
      permissions: permsFor(user.role, fresh),
    } satisfies SessionInfo;
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { getCookie, setCookie } = await import("@tanstack/react-start/server");
  const { writeAccessStore } = await import("./store.server");
  const token = getCookie(COOKIE);
  if (token) {
    await writeAccessStore((s) => ({
      ...s,
      sessions: s.sessions.filter((x) => x.token !== token),
    }));
  }
  setCookie(COOKIE, "", { path: "/", httpOnly: true, maxAge: 0 });
  return { ok: true };
});

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { sessionFromCookie } = await import("./session.server");
  const session = await sessionFromCookie();
  if (!session || session.user.role !== "admin") throw new Error("دسترسی غیرمجاز");
  const { readAccessStore } = await import("./store.server");
  const store = await readAccessStore();
  return {
    users: store.users.map(toPublic),
    rolePermissions: store.rolePermissions,
  };
});

export const saveUser = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id?: string;
      username: string;
      displayName: string;
      role: Role;
      password?: string;
      active: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { sessionFromCookie } = await import("./session.server");
    const session = await sessionFromCookie();
    if (!session || session.user.role !== "admin") throw new Error("دسترسی غیرمجاز");
    const { writeAccessStore, readAccessStore } = await import("./store.server");
    const { hashPassword, newId } = await import("./crypto.server");
    const username = data.username.trim().toLowerCase();
    if (!username) throw new Error("نام کاربری الزامی است");

    await writeAccessStore((s) => {
      const users = [...s.users];
      if (data.id) {
        const idx = users.findIndex((u) => u.id === data.id);
        if (idx < 0) throw new Error("کاربر پیدا نشد");
        const prev = users[idx];
        if (prev.role === "admin" && data.role !== "admin") {
          const admins = users.filter((u) => u.role === "admin" && u.active && u.id !== prev.id);
          if (admins.length === 0) throw new Error("حداقل یک ادمین فعال لازم است");
        }
        users[idx] = {
          ...prev,
          username,
          displayName: data.displayName.trim() || username,
          role: data.role,
          active: data.active,
          passwordHash:
            data.password && data.password.length > 0
              ? hashPassword(data.password)
              : prev.passwordHash,
        };
      } else {
        if (users.some((u) => u.username.toLowerCase() === username)) {
          throw new Error("این نام کاربری قبلاً ثبت شده");
        }
        if (!data.password || data.password.length < 4) {
          throw new Error("رمز عبور حداقل ۴ کاراکتر باشد");
        }
        users.push({
          id: newId("u"),
          username,
          displayName: data.displayName.trim() || username,
          role: data.role,
          active: data.active,
          passwordHash: hashPassword(data.password),
          createdAt: new Date().toISOString(),
        });
      }
      return { ...s, users };
    });
    const store = await readAccessStore();
    return {
      users: store.users.map(toPublic),
      rolePermissions: store.rolePermissions,
    };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { sessionFromCookie } = await import("./session.server");
    const session = await sessionFromCookie();
    if (!session || session.user.role !== "admin") throw new Error("دسترسی غیرمجاز");
    const { writeAccessStore, readAccessStore } = await import("./store.server");
    await writeAccessStore((s) => {
      const target = s.users.find((u) => u.id === data.id);
      if (!target) throw new Error("کاربر پیدا نشد");
      if (target.id === session.user.id) throw new Error("نمی‌توانید خودتان را حذف کنید");
      if (target.role === "admin") {
        const admins = s.users.filter((u) => u.role === "admin" && u.active && u.id !== target.id);
        if (admins.length === 0) throw new Error("حداقل یک ادمین فعال لازم است");
      }
      return {
        ...s,
        users: s.users.filter((u) => u.id !== data.id),
        sessions: s.sessions.filter((x) => x.userId !== data.id),
      };
    });
    const store = await readAccessStore();
    return {
      users: store.users.map(toPublic),
      rolePermissions: store.rolePermissions,
    };
  });

export const updateUserRolePermissions = createServerFn({ method: "POST" })
  .validator((data: { pages: PageKey[]; canEdit: boolean }) => data)
  .handler(async ({ data }) => {
    const { sessionFromCookie } = await import("./session.server");
    const session = await sessionFromCookie();
    if (!session || session.user.role !== "admin") throw new Error("دسترسی غیرمجاز");
    const { writeAccessStore, readAccessStore } = await import("./store.server");
    const pages = data.pages.filter((p) => ALL_PAGES.includes(p) && p !== "users");
    await writeAccessStore((s) => ({
      ...s,
      rolePermissions: {
        ...s.rolePermissions,
        admin: { pages: [...ALL_PAGES], canEdit: true },
        user: { pages, canEdit: Boolean(data.canEdit) },
      },
    }));
    const store = await readAccessStore();
    return {
      users: store.users.map(toPublic),
      rolePermissions: store.rolePermissions,
    };
  });

export const importInventoryJson = createServerFn({ method: "POST" })
  .validator((data: { jsonText: string; mode: "merge" | "replace" }) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("./session.server");
    await requireEditAccess();
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.jsonText);
    } catch {
      throw new Error("فایل JSON نامعتبر است");
    }
    const records = extractRecords(parsed);
    if (!records) throw new Error("ساختار JSON با پشتیبان NetAtlas سازگار نیست");

    const { writeStore } = await import("@/lib/inventory/store.server");
    const { mergeRecords } = await import("@/lib/inventory/excel");
    const store = await writeStore((s) => {
      const next =
        data.mode === "replace" ? records : mergeRecords(s.records, records);
      return { ...s, records: next };
    });
    return { count: store.records.length, updatedAt: store.updatedAt };
  });

function extractRecords(parsed: unknown) {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if (Array.isArray(obj.records))
    return obj.records as import("@/lib/inventory/types").InventoryRecord[];
  if (Array.isArray(parsed))
    return parsed as import("@/lib/inventory/types").InventoryRecord[];
  return null;
}
