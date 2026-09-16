/**
 * Normalized network-domain model used by the next IPAM/topology phases.
 * InventoryRecord remains the compatibility layer for the current JSON store.
 */
export type NetworkAssetStatus = "active" | "inactive" | "maintenance";

export type Site = {
  id: string;
  name: string;
  code?: string;
  address?: string;
  active: boolean;
};

export type Building = {
  id: string;
  siteId: string;
  name: string;
  code?: string;
  active: boolean;
};

export type ServerRoom = {
  id: string;
  buildingId: string;
  name: string;
  floor?: string;
  room?: string;
  notes?: string;
};

export type Rack = {
  id: string;
  serverRoomId: string;
  name: string;
  rackUnits?: number;
  position?: string;
  notes?: string;
};

export type NetworkDeviceType = "switch" | "router" | "firewall" | "access-point" | "other";

export type NetworkDevice = {
  id: string;
  type: NetworkDeviceType;
  name: string;
  managementIp?: string;
  hostname?: string;
  vendor?: string;
  model?: string;
  serialNumber?: string;
  rackId?: string;
  status: NetworkAssetStatus;
  notes?: string;
};

export type DevicePort = {
  id: string;
  deviceId: string;
  name: string;
  description?: string;
  mode?: "access" | "trunk" | "routed" | "unknown";
  vlan?: string;
  connectedTo?: string;
  status: NetworkAssetStatus;
};

export type WallNode = {
  id: string;
  buildingId: string;
  floor?: string;
  room?: string;
  number: string;
  label?: string;
  patchPanelId?: string;
  patchPort?: string;
  cableId?: string;
  active: boolean;
};

export type PatchPanel = {
  id: string;
  rackId?: string;
  name: string;
  portCount?: number;
  notes?: string;
};

export type Cable = {
  id: string;
  label: string;
  fromNodeId?: string;
  toPatchPort?: string;
  patchPanelId?: string;
  switchDeviceId?: string;
  switchPortId?: string;
  status: NetworkAssetStatus;
};

export type Vlan = {
  id: string;
  vlanId: number;
  name: string;
  network?: string;
  gateway?: string;
  siteId?: string;
  active: boolean;
  notes?: string;
};

export type IpAllocation = {
  id: string;
  ip: string;
  cidr?: string;
  vlanId?: string;
  hostname?: string;
  userName?: string;
  computerName?: string;
  status: "allocated" | "available" | "reserved" | "conflict";
  notes?: string;
};

export type TopologyLink = {
  id: string;
  fromType: "device" | "patch" | "node" | "router" | "firewall";
  fromId: string;
  fromPort?: string;
  toType: "device" | "patch" | "node" | "router" | "firewall";
  toId: string;
  toPort?: string;
  medium?: "copper" | "fiber" | "wireless" | "logical" | "unknown";
  label?: string;
  active: boolean;
};

export type NetworkDomainModel = {
  sites: Site[];
  buildings: Building[];
  serverRooms: ServerRoom[];
  racks: Rack[];
  devices: NetworkDevice[];
  ports: DevicePort[];
  wallNodes: WallNode[];
  patchPanels: PatchPanel[];
  cables: Cable[];
  vlans: Vlan[];
  ipAllocations: IpAllocation[];
  topologyLinks: TopologyLink[];
};
