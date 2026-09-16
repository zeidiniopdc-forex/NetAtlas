import { createFileRoute } from "@tanstack/react-router";
import { NetworkTopologyPanel } from "@/components/network/network-topology-panel";

export const Route = createFileRoute("/topology")({
  component: TopologyPage,
});

function TopologyPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium tracking-wide text-accent">NetAtlas v3</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">توپولوژی شبکه</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          مدیریت اتصالات، فیلتر بر اساس سایت/ساختمان/وضعیت، و ردیابی مسیر دوطرفه بین
          نود دیواری، پچ‌پنل، سوییچ، روتر، فایروال و VLAN
        </p>
      </div>
      <NetworkTopologyPanel showFilters />
    </div>
  );
}
