import type { InventoryRecord, RecordStatus } from "@/lib/inventory/types";

export type AssetKind = "switch" | "router" | "firewall" | "rack" | "serverRoom";

export type NetworkAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  site: string;
  building: string;
  location: string;
  vendor: string;
  model: string;
  serialNumber: string;
  managementIp: string;
  interfaces: string[];
  records: number;
  activeRecords: number;
  status: RecordStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetRegistry = {
  assets: NetworkAsset[];
  byKind: Record<AssetKind, number>;
  duplicateManagementIps: string[];
};

const EMPTY_COUNTS: Record<AssetKind, number> = {
  switch: 0,
  router: 0,
  firewall: 0,
  rack: 0,
  serverRoom: 0,
};

function clean(value: string | undefined | null) {
  return value?.trim() ?? "";
}

function assetKey(kind: AssetKind, name: string, site: string, building: string) {
  return `${kind}|${site}|${building}|${name}`.toLowerCase();
}

export function buildAssetRegistry(records: InventoryRecord[]): AssetRegistry {
  const map = new Map<string, NetworkAsset>();
  const managementIpOwners = new Map<string, Set<string>>();
  const now = new Date().toISOString();

  const add = (
    kind: AssetKind,
    name: string | undefined | null,
    record: InventoryRecord,
    managementIp = "",
    location = "",
  ) => {
    const normalizedName = clean(name);
    if (!normalizedName) return;
    const site = clean(record.site);
    const building = clean(record.building);
    const key = assetKey(kind, normalizedName, site, building);
    const current = map.get(key) ?? {
      id: key,
      kind,
      name: normalizedName,
      site,
      building,
      location,
      vendor: kind === "switch" || kind === "router" ? "Cisco" : "",
      model: "",
      serialNumber: "",
      managementIp: "",
      interfaces: [],
      records: 0,
      activeRecords: 0,
      status: "inactive" as RecordStatus,
      notes: "",
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now,
    };

    current.records += 1;
    if (record.status === "active") current.activeRecords += 1;
    current.status = current.activeRecords > 0 ? "active" : "inactive";
    current.location ||= location;
    current.updatedAt = record.updatedAt || current.updatedAt;

    const mgmt = clean(managementIp);
    if (mgmt) {
      current.managementIp = mgmt;
      const owners = managementIpOwners.get(mgmt) ?? new Set<string>();
      owners.add(key);
      managementIpOwners.set(mgmt, owners);
    }

    const iface =
      kind === "switch"
        ? clean(record.switchInterface)
        : clean(record.routerInterface);
    if (iface && !current.interfaces.includes(iface)) current.interfaces.push(iface);
    map.set(key, current);
  };

  for (const record of records) {
    add("switch", record.switchName, record, record.switchManagementIp, clean(record.rack));
    add("router", record.routerName, record, "", clean(record.serverRoom));
    add("rack", record.rack, record, "", clean(record.serverRoom));
    add("serverRoom", record.serverRoom, record, "", clean(record.building));

    const firewallRules = Array.isArray(record.firewallAccess)
      ? record.firewallAccess
      : [];
    for (const firewall of firewallRules) {
      if (!firewall) continue;
      add(
        "firewall",
        firewall.destination || firewall.service,
        record,
        "",
        clean(record.serverRoom),
      );
    }
  }

  const duplicateManagementIps = [...managementIpOwners.entries()]
    .filter(([, owners]) => owners.size > 1)
    .map(([ip]) => ip)
    .sort();

  const byKind = { ...EMPTY_COUNTS };
  for (const asset of map.values()) byKind[asset.kind] += 1;

  return {
    assets: [...map.values()].sort(
      (a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "fa"),
    ),
    byKind,
    duplicateManagementIps,
  };
}

export function assetKindLabel(kind: AssetKind) {
  return {
    switch: "سوئیچ",
    router: "روتر",
    firewall: "فایروال",
    rack: "رک",
    serverRoom: "اتاق سرور",
  }[kind];
}
