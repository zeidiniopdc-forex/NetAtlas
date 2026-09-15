import { createServerFn } from "@tanstack/react-start";
import { buildRelations, computeStats } from "./relations";
import type { InventoryRecord } from "./types";
import { validateInventory } from "./validation";

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
    const store = await writeStore((s) => {
      const idx = s.records.findIndex((r) => r.id === data.id);
      const rec = { ...data, updatedAt: now, createdAt: idx >= 0 ? s.records[idx].createdAt : data.createdAt || now };
      const records = [...s.records];
      if (idx >= 0) records[idx] = rec;
      else records.unshift(rec);
      return { ...s, records };
    });
    return store.records;
  });

export const removeRecord = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireEditAccess } = await import("@/lib/access/session.server");
    await requireEditAccess();
    const { writeStore } = await import("./store.server");
    const store = await writeStore((s) => ({ ...s, records: s.records.filter((r) => r.id !== data.id) }));
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
    return { count: store.records.length, updatedAt: store.updatedAt };
  });

export const resetSeed = createServerFn({ method: "POST" }).handler(async () => {
  const { requireEditAccess } = await import("@/lib/access/session.server");
  await requireEditAccess();
  const { writeStore } = await import("./store.server");
  const { createSeedStore } = await import("./seed");
  const seed = createSeedStore();
  await writeStore(() => seed);
  return seed;
});
