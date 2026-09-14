import type { PageKey, Role, RolePermissions } from "./types";

export const ALL_PAGES: PageKey[] = [
  "dashboard",
  "inventory",
  "search",
  "firewall",
  "cisco",
  "exchange",
  "users",
];

export const PAGE_LABELS: Record<PageKey, string> = {
  dashboard: "داشبورد",
  inventory: "موجودی",
  search: "جستجوی ارتباطات",
  firewall: "فایروال",
  cisco: "دستورات Cisco",
  exchange: "ورود و خروجی",
  users: "مدیریت کاربران",
};

export const PAGE_PATHS: Record<PageKey, string> = {
  dashboard: "/",
  inventory: "/inventory",
  search: "/search",
  firewall: "/firewall",
  cisco: "/cisco",
  exchange: "/exchange",
  users: "/users",
};

export function pathToPageKey(pathname: string): PageKey | null {
  if (pathname === "/" || pathname === "") return "dashboard";
  if (pathname.startsWith("/inventory")) return "inventory";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/firewall")) return "firewall";
  if (pathname.startsWith("/cisco")) return "cisco";
  if (pathname.startsWith("/exchange")) return "exchange";
  if (pathname.startsWith("/users")) return "users";
  if (pathname.startsWith("/login")) return null;
  return null;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: {
    pages: [...ALL_PAGES],
    canEdit: true,
  },
  user: {
    pages: ["dashboard", "inventory", "search"],
    canEdit: false,
  },
};
