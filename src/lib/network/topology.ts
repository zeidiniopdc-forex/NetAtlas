export type TopologyEndpointKind =
  | "wallNode"
  | "patchPanel"
  | "switchPort"
  | "routerInterface"
  | "firewall"
  | "vlan";

export type TopologyLinkType = "copper" | "fiber" | "trunk" | "access" | "logical";
export type TopologyStatus = "active" | "down";

export type TopologyEndpoint = {
  kind: TopologyEndpointKind;
  ref: string;
  label: string;
};

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

export type TopologyTraceResult = {
  found: boolean;
  start: TopologyEndpoint;
  destination?: TopologyEndpoint;
  path: TopologyEndpoint[];
  links: TopologyLink[];
  hops: number;
  downLinksEncountered: TopologyLink[];
};

export type TopologyHealth = {
  totalLinks: number;
  activeLinks: number;
  downLinks: number;
  uniqueEndpoints: number;
  issues: string[];
};

export const endpointKindLabels: Record<TopologyEndpointKind, string> = {
  wallNode: "نود دیواری",
  patchPanel: "پچ‌پنل",
  switchPort: "سوییچ / پورت",
  routerInterface: "روتر / اینترفیس",
  firewall: "فایروال",
  vlan: "VLAN",
};

export const linkTypeLabels: Record<TopologyLinkType, string> = {
  copper: "مسی",
  fiber: "فیبر",
  trunk: "ترانک",
  access: "اکسس",
  logical: "منطقی",
};

export const statusLabels: Record<TopologyStatus, string> = {
  active: "فعال",
  down: "قطع",
};

export function normalizeTopologyEndpoint(e: TopologyEndpoint): TopologyEndpoint {
  return {
    kind: e.kind,
    ref: e.ref.trim(),
    label: (e.label || e.ref).trim(),
  };
}

export function endpointKey(e: TopologyEndpoint) {
  return `${e.kind}:${e.ref}`;
}

export function topologyKey(a: TopologyEndpoint, b: TopologyEndpoint) {
  const x = endpointKey(a);
  const y = endpointKey(b);
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}

export function buildTopologyGraph(links: TopologyLink[], includeDown = false) {
  const graph = new Map<
    string,
    { endpoint: TopologyEndpoint; link: TopologyLink }[]
  >();

  for (const link of links) {
    if (!includeDown && link.status !== "active") continue;
    const a = normalizeTopologyEndpoint(link.endpointA);
    const b = normalizeTopologyEndpoint(link.endpointB);
    const ak = endpointKey(a);
    const bk = endpointKey(b);
    if (!graph.has(ak)) graph.set(ak, []);
    if (!graph.has(bk)) graph.set(bk, []);
    graph.get(ak)!.push({ endpoint: b, link });
    graph.get(bk)!.push({ endpoint: a, link });
  }

  return graph;
}

export function collectEndpoints(links: TopologyLink[]): TopologyEndpoint[] {
  const map = new Map<string, TopologyEndpoint>();
  for (const link of links) {
    const a = normalizeTopologyEndpoint(link.endpointA);
    const b = normalizeTopologyEndpoint(link.endpointB);
    if (a.ref) map.set(endpointKey(a), a);
    if (b.ref) map.set(endpointKey(b), b);
  }
  return Array.from(map.values()).sort((x, y) =>
    (x.label || x.ref).localeCompare(y.label || y.ref, "fa"),
  );
}

export function summarizeTopologyHealth(links: TopologyLink[]): TopologyHealth {
  const issues = findTopologyIssues(links);
  const endpoints = collectEndpoints(links);
  return {
    totalLinks: links.length,
    activeLinks: links.filter((l) => l.status === "active").length,
    downLinks: links.filter((l) => l.status === "down").length,
    uniqueEndpoints: endpoints.length,
    issues,
  };
}

/**
 * BFS path find from start to optional destination.
 * When destination is omitted, returns the first reachable neighbor path (legacy behavior).
 * When destination is provided, finds shortest active path between the two endpoints.
 */
export function traceTopology(
  links: TopologyLink[],
  start: TopologyEndpoint,
  destination?: TopologyEndpoint,
): TopologyTraceResult {
  const normalizedStart = normalizeTopologyEndpoint(start);
  const normalizedDestination = destination
    ? normalizeTopologyEndpoint(destination)
    : undefined;
  const destinationKey = normalizedDestination
    ? endpointKey(normalizedDestination)
    : undefined;
  const graph = buildTopologyGraph(links);
  const startKey = endpointKey(normalizedStart);

  if (destinationKey && startKey === destinationKey) {
    return {
      found: true,
      start: normalizedStart,
      destination: normalizedDestination,
      path: [normalizedStart],
      links: [],
      hops: 0,
      downLinksEncountered: [],
    };
  }

  const queue: Array<{
    key: string;
    endpoint: TopologyEndpoint;
    path: TopologyEndpoint[];
    links: TopologyLink[];
  }> = [
    {
      key: startKey,
      endpoint: normalizedStart,
      path: [normalizedStart],
      links: [],
    },
  ];
  const seen = new Set([startKey]);

  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of graph.get(current.key) ?? []) {
      const key = endpointKey(edge.endpoint);
      if (seen.has(key)) continue;

      const nextPath = [...current.path, edge.endpoint];
      const nextLinks = [...current.links, edge.link];

      // If no destination specified, return first hop path (backward compatible).
      if (!destinationKey) {
        return {
          found: true,
          start: normalizedStart,
          destination: edge.endpoint,
          path: nextPath,
          links: nextLinks,
          hops: nextLinks.length,
          downLinksEncountered: [],
        };
      }

      if (key === destinationKey) {
        return {
          found: true,
          start: normalizedStart,
          destination: edge.endpoint,
          path: nextPath,
          links: nextLinks,
          hops: nextLinks.length,
          downLinksEncountered: [],
        };
      }

      seen.add(key);
      queue.push({
        key,
        endpoint: edge.endpoint,
        path: nextPath,
        links: nextLinks,
      });
    }
  }

  const downGraph = buildTopologyGraph(links, true);
  const downLinksEncountered = (downGraph.get(startKey) ?? [])
    .filter((x) => x.link.status === "down")
    .map((x) => x.link);

  return {
    found: false,
    start: normalizedStart,
    destination: normalizedDestination,
    path: [normalizedStart],
    links: [],
    hops: 0,
    downLinksEncountered,
  };
}

export function traceAllReachable(
  links: TopologyLink[],
  start: TopologyEndpoint,
): TopologyTraceResult[] {
  const normalizedStart = normalizeTopologyEndpoint(start);
  const graph = buildTopologyGraph(links);
  const startKey = endpointKey(normalizedStart);
  const queue: Array<{
    key: string;
    endpoint: TopologyEndpoint;
    path: TopologyEndpoint[];
    links: TopologyLink[];
  }> = [
    {
      key: startKey,
      endpoint: normalizedStart,
      path: [normalizedStart],
      links: [],
    },
  ];
  const seen = new Set([startKey]);
  const results: TopologyTraceResult[] = [];

  while (queue.length) {
    const current = queue.shift()!;
    if (current.key !== startKey) {
      results.push({
        found: true,
        start: normalizedStart,
        destination: current.endpoint,
        path: current.path,
        links: current.links,
        hops: current.links.length,
        downLinksEncountered: [],
      });
    }
    for (const edge of graph.get(current.key) ?? []) {
      const key = endpointKey(edge.endpoint);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({
        key,
        endpoint: edge.endpoint,
        path: [...current.path, edge.endpoint],
        links: [...current.links, edge.link],
      });
    }
  }

  return results;
}

export function findTopologyIssues(links: TopologyLink[]) {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const l of links) {
    const a = normalizeTopologyEndpoint(l.endpointA);
    const b = normalizeTopologyEndpoint(l.endpointB);
    const key = topologyKey(a, b);

    if (!a.ref || !b.ref) issues.push(`لینک ${l.id} نقطه اتصال ناقص دارد.`);
    if (a.kind === b.kind && a.ref === b.ref)
      issues.push(`لینک ${l.id} به خودش متصل است.`);
    if (seen.has(key))
      issues.push(`لینک تکراری بین ${a.label} و ${b.label}.`);
    seen.add(key);
  }

  return issues;
}
