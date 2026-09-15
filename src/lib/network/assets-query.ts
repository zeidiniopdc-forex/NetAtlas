import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAssets, removeAsset, upsertAsset } from "./assets-actions";
import type { NetworkAsset } from "./assets";

export const assetsKey = ["network-assets"] as const;

export function useAssets() {
  return useQuery({
    queryKey: assetsKey,
    queryFn: () => getAssets(),
    staleTime: 8_000,
  });
}

export function useAssetMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: assetsKey });
  const upsert = useMutation({ mutationFn: (asset: NetworkAsset) => upsertAsset({ data: asset }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => removeAsset({ data: { id } }), onSuccess: invalidate });
  return { upsert, remove };
}
