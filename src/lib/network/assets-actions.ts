import { createServerFn } from "@tanstack/react-start";
import type { AssetKind, NetworkAsset } from "./assets";
import { isValidIpv4, normalizeIp } from "./ipam";
import { listAssets, readAssetStore, writeAssetStore } from "./assets-store.server";

const KINDS: AssetKind[] = ["switch", "router", "firewall", "rack", "serverRoom"];

async function auditAsset(action: "create" | "update" | "delete", asset: NetworkAsset) {
  const { sessionFromCookie } = await import("@/lib/access/session.server");
  const { appendAudit } = await import("@/lib/audit/store.server");
  const session = await sessionFromCookie();
  await appendAudit({
    action,
    actorId: session?.user.id ?? null,
    actorUsername: session?.user.username ?? null,
    targetType: "network-asset",
    targetId: asset.id,
    summary: `${action === "create" ? "ایجاد" : action === "update" ? "ویرایش" : "حذف"} دارایی شبکه: ${asset.name}`,
    metadata: { kind: asset.kind, managementIp: asset.managementIp || null, site: asset.site || null, building: asset.building || null },
  });
}

function validateAsset(data: NetworkAsset) {
  if (!data.name?.trim()) throw new Error("نام دارایی الزامی است");
  if (!KINDS.includes(data.kind)) throw new Error("نوع دارایی نامعتبر است");
  if (data.managementIp && !isValidIpv4(data.managementIp)) throw new Error("IP مدیریتی نامعتبر است");
}

export const getAssets = createServerFn({ method: "GET" }).handler(async () => listAssets());

export const upsertAsset = createServerFn({ method: "POST" })
  .validator((data: NetworkAsset) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("@/lib/access/session.server");
    await requireEditAccess();
    validateAsset(data);
    const now = new Date().toISOString();
    const normalized: NetworkAsset = {
      ...data,
      id: data.id?.trim() || `asset-${Date.now().toString(36)}`,
      name: data.name.trim(),
      site: data.site?.trim() ?? "",
      building: data.building?.trim() ?? "",
      location: data.location?.trim() ?? "",
      vendor: data.vendor?.trim() ?? "",
      model: data.model?.trim() ?? "",
      serialNumber: data.serialNumber?.trim() ?? "",
      managementIp: normalizeIp(data.managementIp ?? ""),
      interfaces: Array.from(new Set((data.interfaces ?? []).map((x) => x.trim()).filter(Boolean))),
      notes: data.notes?.trim() ?? "",
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    const current = await readAssetStore();
    const duplicate = current.assets.find(
      (asset) => asset.id !== normalized.id && normalized.managementIp && asset.managementIp === normalized.managementIp,
    );
    if (duplicate) throw new Error(`IP مدیریتی ${normalized.managementIp} قبلاً برای «${duplicate.name}» ثبت شده است`);

    const existed = current.assets.some((asset) => asset.id === normalized.id);
    await writeAssetStore((store) => {
      const index = store.assets.findIndex((asset) => asset.id === normalized.id);
      const assets = [...store.assets];
      if (index >= 0) assets[index] = normalized;
      else assets.unshift(normalized);
      return { ...store, assets };
    });
    await auditAsset(existed ? "update" : "create", normalized);
    return normalized;
  });

export const removeAsset = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("@/lib/access/session.server");
    await requireEditAccess();
    const current = await readAssetStore();
    const target = current.assets.find((asset) => asset.id === data.id);
    if (!target) throw new Error("دارایی پیدا نشد");
    await writeAssetStore((store) => ({ ...store, assets: store.assets.filter((asset) => asset.id !== data.id) }));
    await auditAsset("delete", target);
    return target.id;
  });
