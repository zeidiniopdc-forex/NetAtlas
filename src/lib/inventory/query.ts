import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInventory,
  importRecords,
  removeRecord,
  resetSeed,
  searchInventory,
  upsertRecord,
} from "./actions";
import type { InventoryRecord } from "./types";

export const inventoryKey = ["inventory"] as const;

export function useInventory() {
  return useQuery({
    queryKey: inventoryKey,
    queryFn: () => getInventory(),
    staleTime: 8_000,
  });
}

export function useRelationSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => searchInventory({ data: { q } }),
    enabled: q.trim().length > 0,
  });
}

export function useInventoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: inventoryKey });

  const upsert = useMutation({
    mutationFn: (record: InventoryRecord) => upsertRecord({ data: record }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeRecord({ data: { id } }),
    onSuccess: invalidate,
  });
  const ingest = useMutation({
    mutationFn: (payload: { records: InventoryRecord[]; mode: "merge" | "replace" }) =>
      importRecords({ data: payload }),
    onSuccess: invalidate,
  });
  const seed = useMutation({
    mutationFn: () => resetSeed(),
    onSuccess: invalidate,
  });

  return { upsert, remove, ingest, seed };
}
