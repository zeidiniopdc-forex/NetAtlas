import { createServerFn } from "@tanstack/react-start";
import { isValidIpv4 } from "./ipam";
import { cidrRange, cidrsOverlap, isIpInCidr, ipv4ToInt, normalizeCidr, type Vlan } from "./vlans";
import { listVlans, newVlanId, readVlanStore, writeVlanStore } from "./vlans-store.server";

function validateVlan(data: Vlan, existing: Vlan[]) {
  if (!data.name?.trim()) throw new Error("نام VLAN الزامی است");
  if (!Number.isInteger(data.vlanId) || data.vlanId < 1 || data.vlanId > 4094) throw new Error("VLAN ID باید بین 1 تا 4094 باشد");
  const cidr = normalizeCidr(data.cidr || "");
  if (!cidrRange(cidr)) throw new Error("Subnet/CIDR نامعتبر است");
  if (data.gateway && !isValidIpv4(data.gateway)) throw new Error("Gateway نامعتبر است");
  if (data.dhcpStart && !isValidIpv4(data.dhcpStart)) throw new Error("ابتدای DHCP نامعتبر است");
  if (data.dhcpEnd && !isValidIpv4(data.dhcpEnd)) throw new Error("انتهای DHCP نامعتبر است");
  if (data.gateway && !isIpInCidr(data.gateway, cidr)) throw new Error("Gateway خارج از Subnet است");
  if ((data.dhcpStart && !isIpInCidr(data.dhcpStart, cidr)) || (data.dhcpEnd && !isIpInCidr(data.dhcpEnd, cidr))) throw new Error("محدوده DHCP خارج از Subnet است");
  const dhcpStart = data.dhcpStart ? ipv4ToInt(data.dhcpStart) : null;
  const dhcpEnd = data.dhcpEnd ? ipv4ToInt(data.dhcpEnd) : null;
  if (dhcpStart !== null && dhcpEnd !== null && dhcpStart > dhcpEnd) throw new Error("محدوده DHCP نامعتبر است");
  const duplicateId = existing.find((v) => v.id !== data.id && v.vlanId === data.vlanId && v.site.trim() === data.site.trim());
  if (duplicateId) throw new Error(`VLAN ${data.vlanId} در این Site قبلاً ثبت شده است`);
  const overlap = existing.find((v) => v.id !== data.id && cidrsOverlap(v.cidr, cidr));
  if (overlap) throw new Error(`Subnet با «${overlap.name}» هم‌پوشانی دارد`);
  return cidr;
}

async function audit(action: "create" | "update" | "delete", vlan: Vlan) {
  const { sessionFromCookie } = await import("@/lib/access/session.server");
  const { appendAudit } = await import("@/lib/audit/store.server");
  const session = await sessionFromCookie();
  await appendAudit({ action, actorId: session?.user.id ?? null, actorUsername: session?.user.username ?? null, targetType: "vlan", targetId: vlan.id, summary: `${action === "create" ? "ایجاد" : action === "update" ? "ویرایش" : "حذف"} VLAN: ${vlan.vlanId} - ${vlan.name}`, metadata: { vlanId: vlan.vlanId, cidr: vlan.cidr, site: vlan.site } });
}

export const getVlans = createServerFn({ method: "GET" }).handler(async () => listVlans());

export const upsertVlan = createServerFn({ method: "POST" }).validator((data: Vlan) => data).handler(async ({ data }) => {
  const { requireEditAccess } = await import("@/lib/access/session.server");
  await requireEditAccess();
  const current = await readVlanStore();
  const cidr = validateVlan(data, current.vlans);
  const now = new Date().toISOString();
  const normalized: Vlan = { ...data, id: data.id?.trim() || newVlanId(), vlanId: Number(data.vlanId), name: data.name.trim(), site: data.site?.trim() ?? "", building: data.building?.trim() ?? "", purpose: data.purpose?.trim() ?? "", status: data.status === "disabled" ? "disabled" : "active", cidr, gateway: data.gateway?.trim() ?? "", dhcpStart: data.dhcpStart?.trim() ?? "", dhcpEnd: data.dhcpEnd?.trim() ?? "", notes: data.notes?.trim() ?? "", createdAt: data.createdAt || now, updatedAt: now };
  const existed = current.vlans.some((v) => v.id === normalized.id);
  await writeVlanStore((store) => { const index = store.vlans.findIndex((v) => v.id === normalized.id); const vlans = [...store.vlans]; if (index >= 0) vlans[index] = normalized; else vlans.unshift(normalized); return { ...store, vlans }; });
  await audit(existed ? "update" : "create", normalized);
  return normalized;
});

export const removeVlan = createServerFn({ method: "POST" }).validator((data: { id: string }) => data).handler(async ({ data }) => {
  const { requireEditAccess } = await import("@/lib/access/session.server");
  await requireEditAccess();
  const current = await readVlanStore();
  const target = current.vlans.find((v) => v.id === data.id);
  if (!target) throw new Error("VLAN پیدا نشد");
  await writeVlanStore((store) => ({ ...store, vlans: store.vlans.filter((v) => v.id !== data.id) }));
  await audit("delete", target);
  return target.id;
});
