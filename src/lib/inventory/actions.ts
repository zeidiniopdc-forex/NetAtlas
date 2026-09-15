import { createServerFn } from "@tanstack/react-start";
import { buildRelations, computeStats } from "./relations";
import type { InventoryRecord } from "./types";
import { validateInventory } from "./validation";

async function auditMutation(
  action: "create" | "update" | "delete" | "import" | "reset",
  summary: string,
  targetId: string | null,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const { sessionFromCookie } = await import("@/lib/access/session.server");
  const { appendAudit } = await import("@/lib/audit/store.server");
  const session = await sessionFromCookie();
  await appendAudit({
    action,
    actorId: session?.user.id ?? null,
    actorUsername: session?.user.username ?? null,
    targetType: "inventory",
    targetId,
    summary,
    metadata,
  });
}

export const getInventory = createServerFn({ method: "GET" }).handler(async () => {
  const { listRecords, readStore, storageInfo } = await import("./store.server");
  const store = await readStore();
  const records = await listRecords();
  return { records, updatedAt: store.updatedAt, storage: storageInfo(), stats: computeStats(records) };
});

export const searchInventory = createServerFn({ method: "POST" })
  .validator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const { listRecords } = await import("./store.server");
    return buildRelations(await listRecords(), data.q ?? "");
  });

export const upsertRecord = createServerFn({ method: "POST" })
  .validator((data: InventoryRecord) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("@/lib/access/session.server");
    await requireEditAccess();
    const candidate = validateInventory([data]);
    if (candidate.invalid.length) throw new Error(`رکورد نامعتبر است: ${candidate.issues.filter((i) => i.severity === "error").map((i) => i.message).join("، ")}`);
    const { writeStore } = await import("./store.server");
    const now = new Date().toISOString();
    let existed = false;
    const store = await writeStore((s) => {
      const idx = s.records.findIndex((r) => r.id === data.id);
      existed = idx >= 0;
      const rec = { ...data, updatedAt: now, createdAt: idx >= 0 ? s.records[idx].createdAt : data.createdAt || now };
      const records = [...s.records];
      if (idx >= 0) records[idx] = rec;
      else records.unshift(rec);
      return { ...s, records };
    });
    await auditMutation(existed ? "update" : "create", existed ? "ویرایش رکورد زیرساخت شبکه" : "ایجاد رکورد زیرساخت شبکه", data.id, {
      ip: data.ip,
      node: data.nodeNumber,
      switch: data.switchName,
    });
    return store.records;
  });

export const removeRecord = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("@/lib/access/session.server");
    await requireEditAccess();
    const { writeStore } = await import("./store.server");
    const before = (await import("./store.server")).readStore;
    const current = await before();
    const removed = current.records.find((r) => r.id === data.id);
    const store = await writeStore((s) => ({ ...s, records: s.records.filter((r) => r.id !== data.id) }));
    await auditMutation("delete", "حذف رکورد زیرساخت شبکه", data.id, {
      ip: removed?.ip ?? null,
      node: removed?.nodeNumber ?? null,
      switch: removed?.switchName ?? null,
    });
    return store.records;
  });

export const importRecords = createServerFn({ method: "POST" })
  .validator((data: { records: InventoryRecord[]; mode: "merge" | "replace" }) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("@/lib/access/session.server");
    await requireEditAccess();
    const validation = validateInventory(data.records);
    if (validation.invalid.length) throw new Error(`ورود اطلاعات متوقف شد: ${validation.invalid.length} رکورد نامعتبر است`);
    const { writeStore } = await import("./store.server");
    const { mergeRecords } = await import("./excel");
    const store = await writeStore((s) => ({ ...s, records: data.mode === "replace" ? validation.valid : mergeRecords(s.records, validation.valid) }));
    await auditMutation("import", `ورود ${validation.valid.length} رکورد از Excel/JSON (${data.mode})`, null, {
      mode: data.mode,
      imported: validation.valid.length,
      total: store.records.length,
    });
    return { count: store.records.length, updatedAt: store.updatedAt };
  });

export const resetSeed = createServerFn({ method: "POST" }).handler(async () => {
  const { requireEditAccess } = await import("@/lib/access/session.server");
  await requireEditAccess();
  const { writeStore } = await import("./store.server");
  const { createSeedStore } = await import("./seed");
  const seed = createSeedStore();
  await writeStore(() => seed);
  await auditMutation("reset", "بازنشانی داده‌های نمونه NetAtlas", null, { count: seed.records.length });
  return seed;
});
