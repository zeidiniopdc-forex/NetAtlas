import type { InventoryRecord } from "@/lib/inventory/types";
import { isValidIpv4, normalizeIp, vlanNumber } from "./ipam";

export type QualitySeverity = "error" | "warning" | "info";
export type QualityCategory = "completeness" | "duplicate" | "consistency" | "format" | "path";

export type QualityFinding = {
  id: string;
  severity: QualitySeverity;
  category: QualityCategory;
  code: string;
  title: string;
  detail: string;
  recordIds: string[];
};

export type QualitySummary = {
  score: number;
  errors: number;
  warnings: number;
  info: number;
  affectedRecords: number;
  totalFindings: number;
  byCategory: Record<QualityCategory, number>;
};

const text = (value?: string) => value?.trim() ?? "";

function addFinding(
  findings: QualityFinding[],
  severity: QualitySeverity,
  category: QualityCategory,
  code: string,
  title: string,
  detail: string,
  recordIds: string[],
) {
  findings.push({
    id: `${code}:${recordIds.join(",")}`,
    severity,
    category,
    code,
    title,
    detail,
    recordIds,
  });
}

function duplicateGroups(records: InventoryRecord[], keyOf: (record: InventoryRecord) => string) {
  const groups = new Map<string, string[]>();
  for (const record of records) {
    const key = keyOf(record);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), record.id]);
  }
  return groups;
}

export function analyzeDataQuality(records: InventoryRecord[]): QualityFinding[] {
  const findings: QualityFinding[] = [];

  for (const record of records) {
    const required: Array<[string, string]> = [
      ["site", text(record.site)],
      ["building", text(record.building)],
      ["floor", text(record.floor)],
      ["room", text(record.room)],
      ["wallNode", text(record.wallNodeLabel) || text(record.nodeNumber)],
      ["patchPanel", text(record.patchPanel)],
      ["patchPort", text(record.patchPort)],
      ["switch", text(record.switchName)],
      ["switchPort", text(record.switchInterface)],
      ["cable", text(record.cableNumber)],
      ["ip", text(record.ip)],
      ["vlan", text(record.vlan)],
    ];
    for (const [field, value] of required) {
      if (!value) {
        addFinding(findings, "warning", "completeness", `missing_${field}`, `فیلد ${field} خالی است`, `رکورد ${record.id} برای ردیابی کامل زیرساخت این مقدار را ندارد.`, [record.id]);
      }
    }

    const ip = normalizeIp(record.ip);
    if (ip && !isValidIpv4(ip)) {
      addFinding(findings, "error", "format", "invalid_ip", "IP نامعتبر است", `مقدار IP «${record.ip}» قالب IPv4 معتبر ندارد.`, [record.id]);
    }

    const vlan = vlanNumber(record.vlan);
    if (text(record.vlan) && (!vlan || Number(vlan) < 1 || Number(vlan) > 4094)) {
      addFinding(findings, "error", "format", "invalid_vlan", "VLAN نامعتبر است", `مقدار VLAN «${record.vlan}» باید شامل عدد ۱ تا ۴۰۹۴ باشد.`, [record.id]);
    }

    if (record.status === "active" && !ip) {
      addFinding(findings, "warning", "consistency", "active_without_ip", "رکورد فعال بدون IP است", "سیستم فعال است اما IP برای آن ثبت نشده است.", [record.id]);
    }
    if (record.status === "inactive" && ip) {
      addFinding(findings, "info", "consistency", "inactive_with_ip", "رکورد غیرفعال دارای IP است", "برای کنترل IPAM بررسی کنید این آدرس هنوز رزرو/استفاده می‌شود یا خیر.", [record.id]);
    }
    if (text(record.routerName) && !text(record.routerInterface)) {
      addFinding(findings, "warning", "path", "router_without_interface", "روتر بدون Interface است", "نام روتر ثبت شده ولی Interface مربوط به مسیر مشخص نشده است.", [record.id]);
    }
    if (text(record.switchName) && !text(record.switchInterface)) {
      addFinding(findings, "error", "path", "switch_without_port", "سوئیچ بدون Port است", "برای Trace دقیق باید پورت سوئیچ مشخص باشد.", [record.id]);
    }
    if (text(record.patchPanel) && !text(record.patchPort)) {
      addFinding(findings, "error", "path", "patch_without_port", "Patch Panel بدون Port است", "رکورد Patch Panel دارد اما شماره پورت ثبت نشده است.", [record.id]);
    }
  }

  const duplicateChecks: Array<{
    code: string;
    title: string;
    detail: (key: string) => string;
    keyOf: (record: InventoryRecord) => string;
    severity: QualitySeverity;
    category: QualityCategory;
  }> = [
    {
      code: "duplicate_ip",
      title: "IP تکراری",
      detail: (key) => `آدرس IP «${key}» در چند رکورد ثبت شده است.`,
      keyOf: (r) => normalizeIp(r.ip),
      severity: "error",
      category: "duplicate",
    },
    {
      code: "duplicate_switch_port",
      title: "Switch/Port تکراری",
      detail: (key) => `مسیر «${key}» برای چند سیستم ثبت شده است.`,
      keyOf: (r) => `${text(r.switchName).toLowerCase()}|${text(r.switchInterface).toLowerCase()}`,
      severity: "error",
      category: "duplicate",
    },
    {
      code: "duplicate_wall_node",
      title: "Wall Node تکراری",
      detail: (key) => `Wall Node «${key}» بیش از یک بار ثبت شده است.`,
      keyOf: (r) => text(r.wallNodeLabel) || text(r.nodeNumber),
      severity: "warning",
      category: "duplicate",
    },
    {
      code: "duplicate_patch_port",
      title: "Patch Panel/Port تکراری",
      detail: (key) => `پورت «${key}» بیش از یک بار ثبت شده است.`,
      keyOf: (r) => `${text(r.patchPanel).toLowerCase()}|${text(r.patchPort).toLowerCase()}`,
      severity: "warning",
      category: "duplicate",
    },
    {
      code: "duplicate_cable",
      title: "شماره کابل تکراری",
      detail: (key) => `کابل «${key}» در چند رکورد استفاده شده است.`,
      keyOf: (r) => text(r.cableNumber).toLowerCase(),
      severity: "warning",
      category: "duplicate",
    },
  ];

  for (const check of duplicateChecks) {
    for (const [key, recordIds] of duplicateGroups(records, check.keyOf)) {
      if (recordIds.length < 2) continue;
      addFinding(findings, check.severity, check.category, check.code, check.title, check.detail(key), recordIds);
    }
  }

  return findings;
}

export function summarizeDataQuality(records: InventoryRecord[], findings = analyzeDataQuality(records)): QualitySummary {
  const affected = new Set(findings.flatMap((f) => f.recordIds));
  const byCategory: Record<QualityCategory, number> = {
    completeness: 0,
    duplicate: 0,
    consistency: 0,
    format: 0,
    path: 0,
  };
  let errors = 0;
  let warnings = 0;
  let info = 0;
  for (const finding of findings) {
    byCategory[finding.category] += 1;
    if (finding.severity === "error") errors += 1;
    else if (finding.severity === "warning") warnings += 1;
    else info += 1;
  }
  const penalty = errors * 5 + warnings * 2 + info * 0.25;
  const score = records.length === 0 ? 100 : Math.max(0, Math.round(100 - (penalty / Math.max(records.length, 1)) * 10));
  return { score, errors, warnings, info, affectedRecords: affected.size, totalFindings: findings.length, byCategory };
}
