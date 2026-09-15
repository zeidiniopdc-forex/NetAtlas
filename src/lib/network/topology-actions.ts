import { createServerFn } from "@tanstack/react-start";
import { listTopology, saveTopology, deleteTopology } from "./topology-store.server";
import { normalizeTopologyEndpoint, topologyKey, type TopologyLink } from "./topology";

export const getTopology = createServerFn({ method: "GET" }).handler(async () => listTopology());

export const upsertTopology = createServerFn({ method: "POST" })
  .validator((data: TopologyLink) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess, sessionFromCookie } = await import("@/lib/access/session.server");
    const { appendAudit } = await import("@/lib/audit/store.server");
    await requireEditAccess();

    const current = await listTopology();
    const a = normalizeTopologyEndpoint(data.endpointA);
    const b = normalizeTopologyEndpoint(data.endpointB);
    if (!a.ref || !b.ref) throw new Error("هر دو نقطه اتصال الزامی است");
    if (a.kind === b.kind && a.ref === b.ref) throw new Error("نقطه اتصال نمی‌تواند به خودش متصل شود");

    const duplicate = current.find(
      (x) => x.id !== data.id && topologyKey(x.endpointA, x.endpointB) === topologyKey(a, b),
    );
    if (duplicate) throw new Error("این اتصال قبلاً ثبت شده است");

    const item = await saveTopology({ ...data, endpointA: a, endpointB: b });
    const session = await sessionFromCookie();
    await appendAudit({
      action: data.createdAt ? "update" : "create",
      actorId: session?.user.id ?? null,
      actorUsername: session?.user.username ?? null,
      targetType: "topology",
      targetId: item.id,
      summary: `${a.label} ↔ ${b.label}`,
    });
    return item;
  });

export const removeTopology = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess, sessionFromCookie } = await import("@/lib/access/session.server");
    const { appendAudit } = await import("@/lib/audit/store.server");
    await requireEditAccess();
    await deleteTopology(data.id);
    const session = await sessionFromCookie();
    await appendAudit({
      action: "delete",
      actorId: session?.user.id ?? null,
      actorUsername: session?.user.username ?? null,
      targetType: "topology",
      targetId: data.id,
      summary: "حذف اتصال توپولوژی",
    });
    return { ok: true };
  });
