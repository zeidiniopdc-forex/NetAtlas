import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { NetworkTopologyPanel } from "@/components/network/network-topology-panel";
import { Button } from "@/components/ui/button";
import { useTopology } from "@/lib/network/topology-query";

export const Route = createFileRoute("/topology")({
  component: TopologyPage,
});

function TopologyPage() {
  const { isLoading, error, refetch } = useTopology();

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

      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border py-12 text-center">
          <AlertTriangle className="size-8 text-danger" />
          <p className="text-sm font-medium">بارگذاری توپولوژی ممکن نشد</p>
          <p className="max-w-md text-xs text-muted">
            {error instanceof Error ? error.message : "خطای ناشناخته"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              تلاش مجدد
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/inventory">بازگشت به موجودی</Link>
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-surface" />
      ) : (
        <NetworkTopologyPanel showFilters />
      )}
    </div>
  );
}
