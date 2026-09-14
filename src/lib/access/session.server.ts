import { getCookie } from "@tanstack/react-start/server";
import { ALL_PAGES, DEFAULT_ROLE_PERMISSIONS } from "./permissions";
import { readAccessStore } from "./store.server";
import type { AccessUser, PageKey, PublicUser, Role, RolePermissions, SessionInfo } from "./types";

const COOKIE = "netatlas_session";

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

export async function sessionFromCookie(): Promise<SessionInfo | null> {
  const token = getCookie(COOKIE);
  if (!token) return null;
  const store = await readAccessStore();
  const session = store.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  const user = store.users.find((u) => u.id === session.userId && u.active);
  if (!user) return null;
  return { user: toPublic(user), permissions: permsFor(user.role, store) };
}

export async function requireEditAccess() {
  const session = await sessionFromCookie();
  if (!session) throw new Error("لطفاً وارد شوید");
  if (!session.permissions.canEdit && session.user.role !== "admin") {
    throw new Error("شما اجازه ویرایش ندارید");
  }
  return session;
}

export async function requirePageAccess(page: PageKey) {
  const session = await sessionFromCookie();
  if (!session) throw new Error("لطفاً وارد شوید");
  if (session.user.role === "admin") return session;
  if (!session.permissions.pages.includes(page)) {
    throw new Error("به این بخش دسترسی ندارید");
  }
  return session;
}
