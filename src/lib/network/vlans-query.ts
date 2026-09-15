import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVlans, removeVlan, upsertVlan } from "./vlans-actions";
import type { Vlan } from "./vlans";

export const vlansKey = ["network-vlans"] as const;
export function useVlans() { return useQuery({ queryKey: vlansKey, queryFn: () => getVlans(), staleTime: 8_000 }); }
export function useVlanMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: vlansKey });
  const upsert = useMutation({ mutationFn: (data: Vlan) => upsertVlan({ data }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => removeVlan({ data: { id } }), onSuccess: invalidate });
  return { upsert, remove };
}
