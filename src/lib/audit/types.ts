export type AuditAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "import"
  | "export"
  | "reset"
  | "user-create"
  | "user-update"
  | "user-delete"
  | "permission-update";

export type AuditEntry = {
  id: string;
  at: string;
  action: AuditAction;
  actorId: string | null;
  actorUsername: string | null;
  targetType: string;
  targetId: string | null;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type AuditStore = {
  version: 1;
  updatedAt: string;
  entries: AuditEntry[];
};
