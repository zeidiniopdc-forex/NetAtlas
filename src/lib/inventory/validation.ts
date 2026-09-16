import type { InventoryRecord } from "./types";

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  row: number;
  field: string;
  message: string;
  severity: ValidationSeverity;
};

export type ValidationResult = {
  valid: InventoryRecord[];
  invalid: InventoryRecord[];
  issues: ValidationIssue[];
  duplicateKeys: string[];
};

const IPV4 =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;
const PORT =
  /^(?:\d+|(?:Gi|Fa|Te|Eth|Po|Hu)\d+(?:\/\d+){0,3}(?:\.\d+)?)$/i;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function recordKey(r: InventoryRecord): string {
  const stable = [
    r.id,
    r.nodeNumber,
    r.switchName,
    r.switchInterface,
    r.computerName,
    r.ip,
  ]
    .map((v) => text(v).toLowerCase())
    .join("|");
  return stable;
}

/** Full validation used for Excel/JSON import (stricter). */
export function validateInventory(records: InventoryRecord[]): ValidationResult {
  const valid: InventoryRecord[] = [];
  const invalid: InventoryRecord[] = [];
  const issues: ValidationIssue[] = [];
  const duplicateKeys: string[] = [];
  const seen = new Map<string, number>();
  const seenIps = new Map<string, number>();

  records.forEach((record, index) => {
    const row = index + 2;
    const rowIssues: ValidationIssue[] = [];
    const required: Array<[keyof InventoryRecord, string]> = [
      ["nodeNumber", "شماره نود"],
      ["switchName", "سوئیچ"],
      ["switchInterface", "پورت سوئیچ"],
    ];

    for (const [field, label] of required) {
      if (!text(record[field])) {
        rowIssues.push({
          row,
          field,
          message: `${label} الزامی است`,
          severity: "error",
        });
      }
    }

    if (
      record.ip &&
      !IPV4.test(text(record.ip)) &&
      !IPV6.test(text(record.ip))
    ) {
      rowIssues.push({
        row,
        field: "ip",
        message: "آدرس IP معتبر نیست",
        severity: "error",
      });
    }

    if (
      record.vlan &&
      (!/^\d+$/.test(text(record.vlan)) ||
        Number(record.vlan) < 1 ||
        Number(record.vlan) > 4094)
    ) {
      rowIssues.push({
        row,
        field: "vlan",
        message: "VLAN باید عددی بین 1 تا 4094 باشد",
        severity: "error",
      });
    }

    if (record.switchInterface && !PORT.test(text(record.switchInterface))) {
      rowIssues.push({
        row,
        field: "switchInterface",
        message: "فرمت پورت سوئیچ قابل تشخیص نیست",
        severity: "warning",
      });
    }

    if (record.patchPort && !/^\d+$/.test(text(record.patchPort))) {
      rowIssues.push({
        row,
        field: "patchPort",
        message: "شماره پورت پچ‌پنل باید عددی باشد",
        severity: "warning",
      });
    }

    if (record.ip) {
      const ip = text(record.ip).toLowerCase();
      const previous = seenIps.get(ip);
      if (previous) {
        rowIssues.push({
          row,
          field: "ip",
          message: `IP تکراری است؛ اولین بار در ردیف ${previous} دیده شده`,
          severity: "warning",
        });
      } else seenIps.set(ip, row);
    }

    const key = recordKey(record);
    const previous = seen.get(key);
    if (previous) {
      duplicateKeys.push(key);
      rowIssues.push({
        row,
        field: "id",
        message: `رکورد تکراری است؛ اولین بار در ردیف ${previous} دیده شده`,
        severity: "error",
      });
    } else seen.set(key, row);

    issues.push(...rowIssues);
    if (rowIssues.some((x) => x.severity === "error")) invalid.push(record);
    else valid.push(record);
  });

  return { valid, invalid, issues, duplicateKeys };
}

/**
 * Lenient validation for single-record create/update from the UI.
 * Missing path fields are allowed (warnings only). Only bad IP/VLAN block save.
 */
export function validateUpsertRecord(record: InventoryRecord): {
  ok: boolean;
  errors: string[];
  warnings: string[];
  cleaned: InventoryRecord;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text(record.id)) errors.push("شناسه رکورد نامعتبر است");

  const ip = text(record.ip);
  if (ip && !IPV4.test(ip) && !IPV6.test(ip)) {
    errors.push(`آدرس IP معتبر نیست: ${ip}`);
  }

  const vlan = text(record.vlan);
  if (vlan) {
    const num = vlan.match(/\d+/)?.[0];
    if (!num || Number(num) < 1 || Number(num) > 4094) {
      errors.push(`VLAN باید بین 1 تا 4094 باشد: ${vlan}`);
    }
  }

  if (text(record.switchInterface) && !PORT.test(text(record.switchInterface))) {
    warnings.push("فرمت پورت سوئیچ غیرمعمول است");
  }

  if (!text(record.nodeNumber)) warnings.push("شماره نود خالی است");
  if (!text(record.switchName)) warnings.push("نام سوئیچ خالی است");
  if (!text(record.switchInterface)) warnings.push("پورت سوئیچ خالی است");

  const fw = Array.isArray(record.firewallAccess)
    ? record.firewallAccess.map((f) => ({
        id: text(f?.id) || `fw-${Math.random().toString(16).slice(2)}`,
        service: text(f?.service),
        protocol: (f?.protocol as InventoryRecord["firewallAccess"][number]["protocol"]) || "TCP",
        port: text(f?.port),
        destination: text(f?.destination),
        action: (f?.action as InventoryRecord["firewallAccess"][number]["action"]) || "allow",
        notes: text(f?.notes),
      }))
    : [];

  const cleaned: InventoryRecord = {
    ...record,
    site: text(record.site),
    building: text(record.building),
    floor: text(record.floor),
    room: text(record.room),
    serverRoom: text(record.serverRoom),
    rack: text(record.rack),
    userName: text(record.userName),
    nodeRow: text(record.nodeRow),
    nodeNumber: text(record.nodeNumber),
    wallNodeLabel: text(record.wallNodeLabel),
    patchPanel: text(record.patchPanel),
    patchPort: text(record.patchPort),
    patchRackPosition: text(record.patchRackPosition),
    switchName: text(record.switchName),
    switchInterface: text(record.switchInterface),
    switchManagementIp: text(record.switchManagementIp),
    routerName: text(record.routerName),
    routerInterface: text(record.routerInterface),
    cableNumber: text(record.cableNumber),
    computerName: text(record.computerName),
    windowsUsername: text(record.windowsUsername),
    ip,
    vlan,
    network: text(record.network),
    status: record.status === "inactive" ? "inactive" : "active",
    notes: text(record.notes),
    firewallAccess: fw,
  };

  return { ok: errors.length === 0, errors, warnings, cleaned };
}

export function assertValidInventory(records: InventoryRecord[]) {
  const result = validateInventory(records);
  if (result.issues.some((i) => i.severity === "error")) {
    const first = result.issues.find((i) => i.severity === "error");
    throw new Error(
      `اعتبارسنجی ناموفق است — ردیف ${first?.row}: ${first?.message}`,
    );
  }
  return result;
}
