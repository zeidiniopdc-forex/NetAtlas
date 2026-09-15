import type { InventoryRecord } from "@/lib/inventory/types";

export type IpStatus = "valid" | "duplicate" | "invalid" | "missing";

export type IpSummary = {
  totalAssigned: number;
  uniqueAssigned: number;
  duplicates: number;
  invalid: number;
  missing: number;
};

export type IpFinding = {
  ip: string;
  status: Exclude<IpStatus, "valid" | "missing">;
  recordIds: string[];
};

export type VlanSummary = {
  key: string;
  name: string;
  number: string;
  records: number;
  active: number;
  networks: string[];
};

export function normalizeIp(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export function isValidIpv4(value: string) {
  const ip = normalizeIp(value);
  const parts = ip.split(".");
  if (parts.length !== 4 || parts.some((p) => !/^\d+$/.test(p))) return false;
  return parts.every((p) => {
    const n = Number(p);
    return n >= 0 && n <= 255 && (p === "0" || !p.startsWith("0") || p.length === 1);
  });
}

export function summarizeIpam(records: InventoryRecord[]): IpSummary {
  const counts = new Map<string, number>();
  let invalid = 0;
  let missing = 0;
  for (const record of records) {
    const ip = normalizeIp(record.ip);
    if (!ip) {
      missing += 1;
      continue;
    }
    if (!isValidIpv4(ip)) {
      invalid += 1;
      continue;
    }
    counts.set(ip, (counts.get(ip) ?? 0) + 1);
  }
  const duplicates = [...counts.values()].filter((n) => n > 1).length;
  return {
    totalAssigned: records.filter((r) => normalizeIp(r.ip)).length,
    uniqueAssigned: counts.size,
    duplicates,
    invalid,
    missing,
  };
}

export function findIpIssues(records: InventoryRecord[]): IpFinding[] {
  const byIp = new Map<string, string[]>();
  const findings: IpFinding[] = [];
  for (const record of records) {
    const ip = normalizeIp(record.ip);
    if (!ip) continue;
    if (!isValidIpv4(ip)) {
      findings.push({ ip, status: "invalid", recordIds: [record.id] });
      continue;
    }
    const ids = byIp.get(ip) ?? [];
    ids.push(record.id);
    byIp.set(ip, ids);
  }
  for (const [ip, recordIds] of byIp) {
    if (recordIds.length > 1) findings.push({ ip, status: "duplicate", recordIds });
  }
  return findings.sort((a, b) => a.ip.localeCompare(b.ip, undefined, { numeric: true }));
}

export function vlanNumber(value: string) {
  const match = value.match(/\d+/);
  return match?.[0] ?? "";
}

export function buildVlanSummary(records: InventoryRecord[]): VlanSummary[] {
  const map = new Map<string, VlanSummary>();
  for (const record of records) {
    const name = record.vlan.trim();
    if (!name) continue;
    const number = vlanNumber(name);
    const key = number || name.toLowerCase();
    const current = map.get(key) ?? {
      key,
      name,
      number,
      records: 0,
      active: 0,
      networks: [],
    };
    current.records += 1;
    if (record.status === "active") current.active += 1;
    if (record.network.trim() && !current.networks.includes(record.network.trim())) {
      current.networks.push(record.network.trim());
    }
    map.set(key, current);
  }
  return [...map.values()].sort((a, b) => {
    const an = Number(a.number);
    const bn = Number(b.number);
    if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
    return a.name.localeCompare(b.name, "fa");
  });
}
