export const STATUS = {
  active: "active",
  inactive: "inactive",
} as const;

export type RecordStatus = (typeof STATUS)[keyof typeof STATUS];

export type FirewallProtocol = "TCP" | "UDP" | "ICMP" | "ANY";
export type FirewallAction = "allow" | "deny";

export type FirewallAccess = {
  id: string;
  service: string;
  protocol: FirewallProtocol;
  port: string;
  destination: string;
  action: FirewallAction;
  notes: string;
};

/**
 * Logical network asset fields are kept on the inventory record for backwards
 * compatibility with the current JSON store. They are deliberately optional
 * so existing records/imports remain valid while the normalized asset model is
 * introduced in the next migration phase.
 */
export type InventoryRecord = {
  id: string;
  site?: string;
  building?: string;
  floor: string;
  room: string;
  serverRoom?: string;
  rack?: string;
  userName: string;
  nodeRow: string;
  nodeNumber: string;
  wallNodeLabel?: string;
  patchPanel: string;
  patchPort: string;
  patchRackPosition: string;
  switchName: string;
  switchInterface: string;
  switchManagementIp?: string;
  routerName?: string;
  routerInterface?: string;
  cableNumber: string;
  computerName: string;
  windowsUsername: string;
  ip: string;
  vlan: string;
  network: string;
  status: RecordStatus;
  notes: string;
  firewallAccess: FirewallAccess[];
  createdAt: string;
  updatedAt: string;
};

export type InventoryStore = {
  version: 1;
  updatedAt: string;
  records: InventoryRecord[];
};

export type InventoryStats = {
  total: number;
  active: number;
  inactive: number;
  floors: number;
  switches: number;
  vlans: number;
  users: number;
  ips: number;
  computers: number;
  firewallRules: number;
  byFloor: { name: string; value: number }[];
  byVlan: { name: string; value: number }[];
  bySwitch: { name: string; value: number; active: number }[];
  byNetwork: { name: string; value: number }[];
  topServices: { name: string; value: number }[];
};

export type EntityKind =
  | "site"
  | "building"
  | "floor"
  | "room"
  | "serverRoom"
  | "rack"
  | "user"
  | "node"
  | "patch"
  | "port"
  | "switch"
  | "iface"
  | "router"
  | "cable"
  | "computer"
  | "windows"
  | "ip"
  | "vlan"
  | "network"
  | "firewall"
  | "status";

export type GraphNode = {
  id: string;
  kind: EntityKind;
  label: string;
  count: number;
};

export type GraphEdge = {
  from: string;
  to: string;
};

export type RelationHit = {
  query: string;
  records: InventoryRecord[];
  nodes: GraphNode[];
  edges: GraphEdge[];
};
