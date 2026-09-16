export type Role = "admin" | "user";

export type PageKey =
  | "dashboard"
  | "inventory"
  | "topology"
  | "search"
  | "firewall"
  | "cisco"
  | "exchange"
  | "users";

export type RolePermissions = {
  pages: PageKey[];
  canEdit: boolean;
};

export type AccessUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  displayName: string;
  createdAt: string;
};

export type AccessSession = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type AccessStore = {
  version: 1;
  updatedAt: string;
  users: AccessUser[];
  rolePermissions: Record<Role, RolePermissions>;
  sessions: AccessSession[];
};

export type PublicUser = {
  id: string;
  username: string;
  role: Role;
  displayName: string;
  active: boolean;
};

export type SessionInfo = {
  user: PublicUser;
  permissions: RolePermissions;
};
