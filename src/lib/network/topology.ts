export type TopologyEndpointKind = "wallNode" | "patchPanel" | "switchPort" | "routerInterface" | "firewall" | "vlan";
export type TopologyLinkType = "copper" | "fiber" | "trunk" | "access" | "logical";
export type TopologyStatus = "active" | "down";

export type TopologyEndpoint = { kind: TopologyEndpointKind; ref: string; label: string };
export type TopologyLink = {
  id: string;
  type: TopologyLinkType;
  endpointA: TopologyEndpoint;
  endpointB: TopologyEndpoint;
  cableNumber?: string;
  status: TopologyStatus;
  site?: string;
  building?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const endpointKindLabels: Record<TopologyEndpointKind, string> = {
  wallNode: "Wall Node", patchPanel: "Patch Panel", switchPort: "Switch / Port", routerInterface: "Router / Interface", firewall: "Firewall", vlan: "VLAN",
};
export const linkTypeLabels: Record<TopologyLinkType, string> = { copper: "Copper", fiber: "Fiber", trunk: "Trunk", access: "Access", logical: "Logical" };

export function normalizeTopologyEndpoint(e: TopologyEndpoint): TopologyEndpoint {
  return { kind: e.kind, ref: e.ref.trim(), label: (e.label || e.ref).trim() };
}
export function topologyKey(a: TopologyEndpoint, b: TopologyEndpoint) {
  const x = `${a.kind}:${a.ref}`;
  const y = `${b.kind}:${b.ref}`;
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}
export function buildTopologyGraph(links: TopologyLink[]) {
  const graph = new Map<string, { endpoint: TopologyEndpoint; link: TopologyLink }[]>();
  for (const link of links) {
    const a = normalizeTopologyEndpoint(link.endpointA); const b = normalizeTopologyEndpoint(link.endpointB);
    const ak = `${a.kind}:${a.ref}`; const bk = `${b.kind}:${b.ref}`;
    if (!graph.has(ak)) graph.set(ak, []); if (!graph.has(bk)) graph.set(bk, []);
    graph.get(ak)!.push({ endpoint: b, link }); graph.get(bk)!.push({ endpoint: a, link });
  }
  return graph;
}
export function traceTopology(links: TopologyLink[], start: TopologyEndpoint) {
  const graph = buildTopologyGraph(links); const startKey = `${start.kind}:${start.ref}`;
  const queue = [{ key: startKey, endpoint: start, path: [start], links: [] as TopologyLink[] }]; const seen = new Set([startKey]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.links.length > 0 && current.path.length >= 2 && current.key !== startKey) return current;
    for (const edge of graph.get(current.key) ?? []) {
      const key = `${edge.endpoint.kind}:${edge.endpoint.ref}`;
      if (!seen.has(key)) { seen.add(key); queue.push({ key, endpoint: edge.endpoint, path: [...current.path, edge.endpoint], links: [...current.links, edge.link] }); }
    }
  }
  return { key: startKey, endpoint: start, path: [start], links: [] as TopologyLink[] };
}
export function findTopologyIssues(links: TopologyLink[]) {
  const issues: string[] = []; const seen = new Set<string>();
  for (const l of links) {
    const a = normalizeTopologyEndpoint(l.endpointA); const b = normalizeTopologyEndpoint(l.endpointB); const key = topologyKey(a, b);
    if (!a.ref || !b.ref) issues.push(`لینک ${l.id} نقطه اتصال ناقص دارد.`);
    if (a.kind === b.kind && a.ref === b.ref) issues.push(`لینک ${l.id} به خودش متصل است.`);
    if (seen.has(key)) issues.push(`لینک تکراری بین ${a.label} و ${b.label}.`); seen.add(key);
  }
  return issues;
}
