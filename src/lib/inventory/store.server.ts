import { createSeedStore } from "./seed";
import type { InventoryRecord, InventoryStore } from "./types";
import {
  ensureNetatlasDb,
  storagePathInfo,
} from "@/lib/netatlas-db.server";

let chain: Promise<unknown> = Promise.resolve();
let writable = true;

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function loadAll(): Promise<InventoryStore> {
  const pg = await ensureNetatlasDb();
  const rows = await pg.query<{ payload: InventoryRecord }>(
    "select payload from inventory_records order by updated_at desc",
  );
  const meta = await pg.query<{ value: string }>(
    "select value from netatlas_meta where key = 'inventory_updated_at'",
  );

  let records = rows.rows.map((r) => {
    const p = r.payload;
    return typeof p === "string" ? (JSON.parse(p) as InventoryRecord) : p;
  });

  // First install only: empty DB and never seeded → sample data once
  if (records.length === 0) {
    const seeded = await pg.query<{ value: string }>(
      "select value from netatlas_meta where key = 'inventory_seeded'",
    );
    if (!seeded.rows[0]) {
      const seed = createSeedStore();
      await persistAll(seed.records, seed.updatedAt);
      await pg.query(
        `insert into netatlas_meta (key, value) values ('inventory_seeded', '1')
         on conflict (key) do nothing`,
      );
      records = seed.records;
      return { version: 1, updatedAt: seed.updatedAt, records };
    }
  }

  return {
    version: 1,
    updatedAt: meta.rows[0]?.value ?? new Date().toISOString(),
    records,
  };
}

async function persistAll(records: InventoryRecord[], updatedAt: string) {
  const pg = await ensureNetatlasDb();
  try {
    await pg.transaction(async (tx) => {
      await tx.exec("delete from inventory_records");
      for (const r of records) {
        await tx.query(
          `insert into inventory_records (id, payload, updated_at)
           values ($1, $2::jsonb, $3::timestamptz)`,
          [r.id, JSON.stringify(r), r.updatedAt || updatedAt],
        );
      }
      await tx.query(
        `insert into netatlas_meta (key, value) values ('inventory_updated_at', $1)
         on conflict (key) do update set value = excluded.value`,
        [updatedAt],
      );
      await tx.query(
        `insert into netatlas_meta (key, value) values ('inventory_seeded', '1')
         on conflict (key) do nothing`,
      );
    });
    writable = true;
  } catch (e) {
    writable = false;
    throw e;
  }
}

export async function readStore(): Promise<InventoryStore> {
  return withLock(loadAll);
}

export async function writeStore(
  mutator: (store: InventoryStore) => InventoryStore,
): Promise<InventoryStore> {
  return withLock(async () => {
    const current = await loadAll();
    const next = mutator(current);
    next.updatedAt = new Date().toISOString();
    next.version = 1;
    await persistAll(next.records, next.updatedAt);
    return next;
  });
}

export async function listRecords() {
  return (await readStore()).records;
}

export async function saveAll(records: InventoryRecord[]) {
  return writeStore((s) => ({ ...s, records }));
}

export function storageInfo() {
  return { ...storagePathInfo(), writable };
}
