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

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;
const PORT = /^(?:\d+|(?:Gi|Fa|Te|Eth|Po|Hu)\d+(?:\/\d+){0,3}(?:\.\d+)?)$/i;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function recordKey(r: InventoryRecord): string {
  const stable = [r.id, r.nodeNumber, r.switchName, r.switchInterface, r.computerName, r.ip]
    .map((v) => text(v).toLowerCase())
    .join("|");
  return stable;
}

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
      if (!text(record[field])) rowIssues.push({ row, field, message: `${label} الزامی است`, severity: "error" });
    }

    if (record.ip && !IPV4.test(text(record.ip)) && !IPV6.test(text(record.ip))) {
      rowIssues.push({ row, field: "ip", message: "آدرس IP معتبر نیست", severity: "error" });
    }

    if (record.vlan && (!/^\d+$/.test(text(record.vlan)) || Number(record.vlan) < 1 || Number(record.vlan) > 4094)) {
      rowIssues.push({ row, field: "vlan", message: "VLAN باید عددی بین 1 تا 4094 باشد", severity: "error" });
    }

    if (record.switchInterface && !PORT.test(text(record.switchInterface))) {
      rowIssues.push({ row, field: "switchInterface", message: "فرمت پورت سوئیچ قابل تشخیص نیست", severity: "warning" });
    }

    if (record.patchPort && !/^\d+$/.test(text(record.patchPort))) {
      rowIssues.push({ row, field: "patchPort", message: "شماره پورت پچ‌پنل باید عددی باشد", severity: "warning" });
    }

    if (record.ip) {
      const ip = text(record.ip).toLowerCase();
      const previous = seenIps.get(ip);
      if (previous) {
        rowIssues.push({ row, field: "ip", message: `IP تکراری است؛ اولین بار در ردیف ${previous} دیده شده`, severity: "warning" });
      } else seenIps.set(ip, row);
    }

    const key = recordKey(record);
    const previous = seen.get(key);
    if (previous) {
      duplicateKeys.push(key);
      rowIssues.push({ row, field: "id", message: `رکورد تکراری است؛ اولین بار در ردیف ${previous} دیده شده`, severity: "error" });
    } else seen.set(key, row);

    issues.push(...rowIssues);
    if (rowIssues.some((x) => x.severity === "error")) invalid.push(record);
    else valid.push(record);
  });

  return { valid, invalid, issues, duplicateKeys };
}

export function assertValidInventory(records: InventoryRecord[]) {
  const result = validateInventory(records);
  if (result.issues.some((i) => i.severity === "error")) {
    const first = result.issues.find((i) => i.severity === "error");
    throw new Error(`اعتبارسنجی ناموفق است — ردیف ${first?.row}: ${first?.message}`);
  }
  return result;
}
