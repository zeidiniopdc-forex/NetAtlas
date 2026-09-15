import type { InventoryRecord } from "@/lib/inventory/types";

export type PortLink = {
  id: string;
  switchName: string;
  switchInterface: string;
  switchManagementIp: string;
  vlan: string;
  status: InventoryRecord["status"];
  wallNode: string;
  patchPanel: string;
  patchPort: string;
  cableNumber: string;
  ip: string;
  computerName: string;
  userName: string;
  routerName: string;
  routerInterface: string;
};

export function buildPortLinks(records: InventoryRecord[]): PortLink[] {
  return records
    .filter((r) => r.switchName?.trim() || r.patchPanel?.trim() || r.nodeNumber?.trim())
    .map((r) => ({
      id: r.id,
      switchName: r.switchName?.trim() ?? "",
      switchInterface: r.switchInterface?.trim() ?? "",
      switchManagementIp: r.switchManagementIp?.trim() ?? "",
      vlan: r.vlan?.trim() ?? "",
      status: r.status,
      wallNode: (r.wallNodeLabel || r.nodeNumber || "").trim(),
      patchPanel: r.patchPanel?.trim() ?? "",
      patchPort: r.patchPort?.trim() ?? "",
      cableNumber: r.cableNumber?.trim() ?? "",
      ip: r.ip?.trim() ?? "",
      computerName: r.computerName?.trim() ?? "",
      userName: r.userName?.trim() ?? "",
      routerName: r.routerName?.trim() ?? "",
      routerInterface: r.routerInterface?.trim() ?? "",
    }))
    .sort((a, b) => `${a.switchName}|${a.switchInterface}`.localeCompare(`${b.switchName}|${b.switchInterface}`, "fa"));
}

export function findPortIssues(ports: PortLink[]) {
  const seen = new Map<string, string[]>();
  for (const port of ports) {
    const key = `${port.switchName}|${port.switchInterface}`.toLowerCase();
    if (!port.switchName || !port.switchInterface) continue;
    const ids = seen.get(key) ?? [];
    ids.push(port.id);
    seen.set(key, ids);
  }
  return [...seen.entries()].filter(([, ids]) => ids.length > 1).map(([key, ids]) => ({ key, count: ids.length }));
}
