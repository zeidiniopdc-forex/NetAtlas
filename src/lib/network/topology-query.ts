import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTopology, removeTopology, upsertTopology } from "./topology-actions";
import { sanitizeTopologyLinks, type TopologyLink } from "./topology";

export const topologyKey = ["network-topology"] as const;

export function useTopology() {
  return useQuery({
    queryKey: topologyKey,
    queryFn: async () => {
      const raw = await getTopology();
      return sanitizeTopologyLinks(raw);
    },
    staleTime: 8_000,
    retry: 1,
  });
}

export function useTopologyMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: topologyKey });

  const upsert = useMutation({
    mutationFn: (data: TopologyLink) => upsertTopology({ data }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeTopology({ data: { id } }),
    onSuccess: invalidate,
  });

  return { upsert, remove };
}
