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

const KIND_SET = new Set<TopologyEndpointKind>([
  "wallNode",
  "patchPanel",
  "switchPort",
  "routerInterface",
  "firewall",
  "vlan",
]);

const TYPE_SET = new Set<TopologyLinkType>([
  "copper",
  "fiber",
  "trunk",
  "access",
  "logical",
]);

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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asKind(value: unknown): TopologyEndpointKind {
  return KIND_SET.has(value as TopologyEndpointKind)
    ? (value as TopologyEndpointKind)
    : "wallNode";
}

function asType(value: unknown): TopologyLinkType {
  return TYPE_SET.has(value as TopologyLinkType)
    ? (value as TopologyLinkType)
    : "copper";
}

function asStatus(value: unknown): TopologyStatus {
  return value === "down" ? "down" : "active";
}

export function normalizeTopologyEndpoint(
  e?: Partial<TopologyEndpoint> | null,
): TopologyEndpoint {
  const ref = text(e?.ref);
  const label = text(e?.label) || ref;
  return {
    kind: asKind(e?.kind),
    ref,
    label,
  };
}

/** Sanitize raw JSON links so UI never crashes on partial records. */
export function sanitizeTopologyLinks(input: unknown): TopologyLink[] {
  if (!Array.isArray(input)) return [];
  const now = new Date().toISOString();
  const out: TopologyLink[] = [];

  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<TopologyLink> & {
      endpointA?: Partial<TopologyEndpoint>;
      endpointB?: Partial<TopologyEndpoint>;
    };
    const id = text(item.id) || `tmp-${out.length}`;
    out.push({
      id,
      type: asType(item.type),
      endpointA: normalizeTopologyEndpoint(item.endpointA),
      endpointB: normalizeTopologyEndpoint(item.endpointB),
      cableNumber: text(item.cableNumber) || undefined,
      status: asStatus(item.status),
      site: text(item.site) || undefined,
      building: text(item.building) || undefined,
      notes: text(item.notes) || undefined,
      createdAt: text(item.createdAt) || now,
      updatedAt: text(item.updatedAt) || now,
    });
  }

  return out;
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
    if (!a.ref || !b.ref) continue;
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
  const safe = sanitizeTopologyLinks(links);
  const issues = findTopologyIssues(safe);
  const endpoints = collectEndpoints(safe);
  return {
    totalLinks: safe.length,
    activeLinks: safe.filter((l) => l.status === "active").length,
    downLinks: safe.filter((l) => l.status === "down").length,
    uniqueEndpoints: endpoints.length,
    issues,
  };
}

export function traceTopology(
  links: TopologyLink[],
  start: TopologyEndpoint,
  destination?: TopologyEndpoint,
): TopologyTraceResult {
  const safe = sanitizeTopologyLinks(links);
  const normalizedStart = normalizeTopologyEndpoint(start);
  const normalizedDestination = destination
    ? normalizeTopologyEndpoint(destination)
    : undefined;
  const destinationKey = normalizedDestination
    ? endpointKey(normalizedDestination)
    : undefined;
  const graph = buildTopologyGraph(safe);
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

  const downGraph = buildTopologyGraph(safe, true);
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
  const safe = sanitizeTopologyLinks(links);
  const normalizedStart = normalizeTopologyEndpoint(start);
  const graph = buildTopologyGraph(safe);
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
  const safe = sanitizeTopologyLinks(links);
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const l of safe) {
    const a = normalizeTopologyEndpoint(l.endpointA);
    const b = normalizeTopologyEndpoint(l.endpointB);
    const key = topologyKey(a, b);

    if (!a.ref || !b.ref) issues.push(`لینک ${l.id} نقطه اتصال ناقص دارد.`);
    if (a.kind === b.kind && a.ref === b.ref)
      issues.push(`لینک ${l.id} به خودش متصل است.`);
    if (seen.has(key))
      issues.push(`لینک تکراری بین ${a.label || a.ref} و ${b.label || b.ref}.`);
    seen.add(key);
  }

  return issues;
}
