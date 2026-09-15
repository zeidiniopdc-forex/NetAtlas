export type VlanStatus = "active" | "disabled";

export type Vlan = {
  id: string;
  vlanId: number;
  name: string;
  site: string;
  building: string;
  purpose: string;
  status: VlanStatus;
  cidr: string;
  gateway: string;
  dhcpStart: string;
  dhcpEnd: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export function ipv4ToInt(ip: string) {
  const parts = ip.trim().split(".");
  if (parts.length !== 4 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const n = parts.map(Number);
  if (n.some((x) => x < 0 || x > 255)) return null;
  return (((n[0] * 256 + n[1]) * 256 + n[2]) * 256 + n[3]) >>> 0;
}

export function cidrRange(cidr: string) {
  const [ip, prefixText] = cidr.trim().split("/");
  const value = ipv4ToInt(ip);
  const prefix = Number(prefixText);
  if (value === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = value & mask;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return { network, broadcast, prefix };
}

export function isIpInCidr(ip: string, cidr: string) {
  const value = ipv4ToInt(ip);
  const range = cidrRange(cidr);
  return value !== null && range !== null && value >= range.network && value <= range.broadcast;
}

export function cidrsOverlap(a: string, b: string) {
  const left = cidrRange(a);
  const right = cidrRange(b);
  if (!left || !right) return false;
  return left.network <= right.broadcast && right.network <= left.broadcast;
}

export function usableIpCount(cidr: string) {
  const range = cidrRange(cidr);
  if (!range) return 0;
  const total = range.broadcast - range.network + 1;
  if (range.prefix >= 31) return total;
  return Math.max(0, total - 2);
}

export function normalizeCidr(cidr: string) {
  const range = cidrRange(cidr);
  if (!range) return cidr.trim();
  return `${(range.network >>> 24) & 255}.${(range.network >>> 16) & 255}.${(range.network >>> 8) & 255}.${range.network & 255}/${range.prefix}`;
}
