import type { EntityKind, FirewallAction, FirewallProtocol, InventoryRecord, RecordStatus } from "./types";

export const APP_NAME = "NetAtlas";
export const APP_TAGLINE = "سامانه مدیریت زیرساخت شبکه";

export type FieldKey = Exclude<
  keyof InventoryRecord,
  "id" | "firewallAccess" | "createdAt" | "updatedAt"
>;

export const FIELD_LABELS: Record<FieldKey | "firewallAccess", string> = {
  floor: "طبقه",
  room: "شماره اتاق",
  userName: "نام کاربر",
  nodeRow: "ردیف نود",
  nodeNumber: "شماره نود",
  patchPanel: "پچ پانل",
  patchPort: "پورت پچ پنل",
  patchRackPosition: "موقعیت پچ پنل در رک",
  switchName: "سوئیچ",
  switchInterface: "اینترفیس سوئیچ",
  cableNumber: "شماره کابل",
  computerName: "نام کامپیوتر",
  windowsUsername: "نام کاربری ویندوز",
  ip: "IP",
  vlan: "VLAN",
  network: "شبکه",
  status: "ف / غ",
  notes: "توضیحات",
  firewallAccess: "دسترسی‌های فایروال",
};

export const ENTITY_LABELS: Record<EntityKind, string> = {
  floor: "طبقه",
  room: "اتاق",
  user: "کاربر",
  node: "نود",
  patch: "پچ پنل",
  port: "پورت",
  switch: "سوئیچ",
  iface: "اینترفیس",
  cable: "کابل",
  computer: "کامپیوتر",
  windows: "ویندوز",
  ip: "IP",
  vlan: "VLAN",
  network: "شبکه",
  firewall: "فایروال",
  status: "وضعیت",
};

export const STATUS_LABEL: Record<RecordStatus, string> = {
  active: "فعال",
  inactive: "غیرفعال",
};

export const PROTOCOL_OPTIONS: FirewallProtocol[] = ["TCP", "UDP", "ICMP", "ANY"];
export const ACTION_OPTIONS: FirewallAction[] = ["allow", "deny"];

export const ACTION_LABEL: Record<FirewallAction, string> = {
  allow: "اجازه",
  deny: "مسدود",
};

export const EMPTY_RECORD: Omit<InventoryRecord, "id" | "createdAt" | "updatedAt"> = {
  floor: "",
  room: "",
  userName: "",
  nodeRow: "",
  nodeNumber: "",
  patchPanel: "",
  patchPort: "",
  patchRackPosition: "",
  switchName: "",
  switchInterface: "",
  cableNumber: "",
  computerName: "",
  windowsUsername: "",
  ip: "",
  vlan: "",
  network: "",
  status: "active",
  notes: "",
  firewallAccess: [],
};

export const TABLE_COLUMNS: FieldKey[] = [
  "floor",
  "room",
  "userName",
  "computerName",
  "ip",
  "vlan",
  "switchName",
  "switchInterface",
  "patchPanel",
  "patchPort",
  "status",
];

export function statusFromCell(raw: string): RecordStatus {
  const n = normalizeFa(raw);
  if (!n) return "active";
  if (
    n === "غ" ||
    n.includes("غیرفعال") ||
    n.includes("غيرفعال") ||
    n === "inactive" ||
    n === "no" ||
    n === "0" ||
    n === "off" ||
    n === "down"
  ) {
    return "inactive";
  }
  return "active";
}

export function statusToCell(status: RecordStatus) {
  return status === "active" ? "ف" : "غ";
}

export function normalizeFa(input: string) {
  return input
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/[أإآ]/g, "ا")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[0-9]+\s*[\.\-:]?\s*/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase()
    .trim();
}

export function vlanNumber(vlan: string) {
  const m = vlan.match(/\d+/);
  return m ? m[0] : vlan;
}
