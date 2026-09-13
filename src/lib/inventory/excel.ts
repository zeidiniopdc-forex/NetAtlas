import * as XLSX from "xlsx";
import { uid } from "../utils";
import {
  FIELD_LABELS,
  normalizeFa,
  statusFromCell,
  statusToCell,
  type FieldKey,
} from "./fields";
import type { FirewallAccess, FirewallAction, FirewallProtocol, InventoryRecord } from "./types";

const HEADER_ALIASES: Record<string, FieldKey | "firewallAccess"> = {};

function addAlias(alias: string, key: FieldKey | "firewallAccess") {
  HEADER_ALIASES[normalizeFa(alias)] = key;
}

addAlias("طبقه", "floor");
addAlias("floor", "floor");
addAlias("شماره اتاق", "room");
addAlias("اتاق", "room");
addAlias("room", "room");
addAlias("نام کاربر", "userName");
addAlias("نام كاربر", "userName");
addAlias("کاربر", "userName");
addAlias("user", "userName");
addAlias("ردیف نود", "nodeRow");
addAlias("رديف نود", "nodeRow");
addAlias("شماره نود", "nodeNumber");
addAlias("نود", "nodeNumber");
addAlias("پچ پانل", "patchPanel");
addAlias("پچ پنل", "patchPanel");
addAlias("patchpanel", "patchPanel");
addAlias("پورت پچ پنل", "patchPort");
addAlias("پورت پچ پانل", "patchPort");
addAlias("موقعیت پچ پنل در رک", "patchRackPosition");
addAlias("موقعيت پچ پنل در رك", "patchRackPosition");
addAlias("موقعیت پچ پانل در رک", "patchRackPosition");
addAlias("سوئیچ", "switchName");
addAlias("سوئيچ", "switchName");
addAlias("switch", "switchName");
addAlias("اینترفیس سوئیچ", "switchInterface");
addAlias("اينترفيس سوئيچ", "switchInterface");
addAlias("اینترفیس", "switchInterface");
addAlias("شماره کابل", "cableNumber");
addAlias("شماره كابل", "cableNumber");
addAlias("کابل", "cableNumber");
addAlias("نام کامپیوتر", "computerName");
addAlias("نام كامپيوتر", "computerName");
addAlias("کامپیوتر", "computerName");
addAlias("نام کاربری ویندوز", "windowsUsername");
addAlias("نام كاربري ويندوز", "windowsUsername");
addAlias("ip", "ip");
addAlias("آی پی", "ip");
addAlias("vlan", "vlan");
addAlias("شبکه", "network");
addAlias("شبكه", "network");
addAlias("فغ", "status");
addAlias("ف غ", "status");
addAlias("وضعیت", "status");
addAlias("توضیحات", "notes");
addAlias("توضيحات", "notes");
addAlias("دسترسی های فایروال", "firewallAccess");
addAlias("دسترسیهای فایروال", "firewallAccess");
addAlias("فایروال", "firewallAccess");
addAlias("firewall", "firewallAccess");

const EXPORT_KEYS: (FieldKey | "firewallAccess")[] = [
  "floor",
  "room",
  "userName",
  "nodeRow",
  "nodeNumber",
  "patchPanel",
  "patchPort",
  "patchRackPosition",
  "switchName",
  "switchInterface",
  "cableNumber",
  "computerName",
  "windowsUsername",
  "ip",
  "vlan",
  "network",
  "status",
  "notes",
  "firewallAccess",
];

export function serializeFirewall(list: FirewallAccess[]) {
  if (!list.length) return "";
  return list
    .map((f) => {
      const act = f.action === "deny" ? "deny" : "allow";
      const dest = f.destination ? `->${f.destination}` : "";
      const notes = f.notes ? `{${f.notes}}` : "";
      return `${f.service}:${f.protocol}/${f.port}${dest}(${act})${notes}`;
    })
    .join("; ");
}

export function parseFirewall(raw: string): FirewallAccess[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const notesMatch = part.match(/\{([^}]*)\}/);
      const notes = notesMatch?.[1] ?? "";
      const cleaned = part.replace(/\{[^}]*\}/, "").trim();
      const action: FirewallAction = /deny/i.test(cleaned) ? "deny" : "allow";
      const destMatch = cleaned.match(/->([^(]+)/);
      const destination = destMatch?.[1]?.trim() ?? "";
      const protoMatch = cleaned.match(/\b(TCP|UDP|ICMP|ANY)\b/i);
      const protocol = (protoMatch?.[1]?.toUpperCase() ?? "TCP") as FirewallProtocol;
      const portMatch = cleaned.match(/\/(\d+(?:\s*-\s*\d+)?|any)/i);
      const port = portMatch?.[1] ?? "";
      const service =
        cleaned
          .replace(/:.*$/, "")
          .replace(/\(.*$/, "")
          .trim() || "Service";
      return {
        id: uid("fw"),
        service,
        protocol,
        port,
        destination,
        action,
        notes,
      };
    });
}

function cell(v: unknown) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v).trim();
}

function mapHeader(name: string): FieldKey | "firewallAccess" | "id" | null {
  const n = normalizeFa(name);
  if (!n) return null;
  if (n === "id" || n === "شناسه") return "id";
  return HEADER_ALIASES[n] ?? null;
}

export function parseWorkbook(data: ArrayBuffer | Uint8Array): InventoryRecord[] {
  const wb = XLSX.read(data, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  if (!rows.length) return [];

  const headerRow = (rows[0] ?? []).map((h) => cell(h));
  const index = new Map<number, FieldKey | "firewallAccess" | "id">();
  headerRow.forEach((h, i) => {
    const key = mapHeader(h);
    if (key) index.set(i, key);
  });

  const now = new Date().toISOString();
  const records: InventoryRecord[] = [];

  for (const raw of rows.slice(1)) {
    const row = Array.isArray(raw) ? raw : [];
    const rec: InventoryRecord = {
      id: uid("rec"),
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
      createdAt: now,
      updatedAt: now,
    };
    let filled = false;
    for (const [i, key] of index.entries()) {
      const value = cell(row[i]);
      if (!value) continue;
      filled = true;
      if (key === "id") rec.id = value;
      else if (key === "status") rec.status = statusFromCell(value);
      else if (key === "firewallAccess") rec.firewallAccess = parseFirewall(value);
      else rec[key] = value;
    }
    if (filled) records.push(rec);
  }
  return records;
}

export function buildWorkbook(records: InventoryRecord[]) {
  const headers = ["شناسه", ...EXPORT_KEYS.map((k) => FIELD_LABELS[k])];
  const data = records.map((r) => [
    r.id,
    ...EXPORT_KEYS.map((k) => {
      if (k === "status") return statusToCell(r.status);
      if (k === "firewallAccess") return serializeFirewall(r.firewallAccess);
      return r[k];
    }),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws["!cols"] = headers.map((h) => ({ wch: Math.min(28, Math.max(12, h.length + 4)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");

  const fwRows: string[][] = [
    ["شناسه رکورد", "کاربر", "IP", "سرویس", "پروتکل", "پورت", "مقصد", "عمل", "توضیح"],
  ];
  for (const r of records) {
    for (const f of r.firewallAccess) {
      fwRows.push([
        r.id,
        r.userName,
        r.ip,
        f.service,
        f.protocol,
        f.port,
        f.destination,
        f.action,
        f.notes,
      ]);
    }
  }
  const fwSheet = XLSX.utils.aoa_to_sheet(fwRows);
  XLSX.utils.book_append_sheet(wb, fwSheet, "Firewall");
  return wb;
}

export function workbookToArrayBuffer(wb: XLSX.WorkBook) {
  return XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export function downloadWorkbook(records: InventoryRecord[], filename: string) {
  const wb = buildWorkbook(records);
  XLSX.writeFile(wb, filename);
}

export function mergeRecords(existing: InventoryRecord[], incoming: InventoryRecord[]) {
  const keyOf = (r: InventoryRecord) => {
    const k = [r.ip, r.nodeNumber, r.switchInterface, r.computerName]
      .map((s) => s.trim().toLowerCase())
      .join("|");
    if (k.replaceAll("|", "")) return `k:${k}`;
    return `id:${r.id}`;
  };
  const result = [...existing];
  const indexById = new Map(result.map((r, i) => [r.id, i]));
  const indexByKey = new Map(result.map((r, i) => [keyOf(r), i]));

  for (const rec of incoming) {
    const k = keyOf(rec);
    const idx = indexById.get(rec.id) ?? indexByKey.get(k);
    if (idx != null) {
      const prev = result[idx];
      result[idx] = {
        ...prev,
        ...rec,
        id: prev.id,
        createdAt: prev.createdAt,
        updatedAt: new Date().toISOString(),
        firewallAccess: rec.firewallAccess.length ? rec.firewallAccess : prev.firewallAccess,
      };
    } else {
      result.push({ ...rec, id: rec.id || uid("rec") });
    }
  }
  return result;
}
