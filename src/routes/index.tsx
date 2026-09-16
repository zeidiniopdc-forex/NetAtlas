import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import {
  DashboardSkeleton,
  EmptyDashboard,
  InfraCharts,
  KpiGrid,
  PathStrip,
  QuickActions,
  ServiceMix,
  StatusBanner,
  SwitchRack,
  TopologyHealthCard,
} from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/lib/inventory/query";
import { useTopology } from "@/lib/network/topology-query";
import { faDate } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { data, isLoading, error, refetch } = useInventory();
  const { data: topologyLinks = [] } = useTopology();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) {
    return <EmptyDashboard onRetry={() => void refetch()} />;
  }

  const storageLabel = data.storage.path
    ? "فایل JSON روی سرور"
    : "حافظه موقت سرور";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-accent">
            نمای کلی زیرساخت
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            داشبورد شبکه
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted">
            وضعیت نودها، سوئیچ‌ها، VLAN، توپولوژی و دسترسی‌های فایروال در یک نگاه
          </p>
        </div>

        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim())
              void navigate({ to: "/search", search: { q: q.trim() } });
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی IP، کاربر، سوئیچ، پچ‌پنل، VLAN…"
            className="bg-surface"
          />
          <Button type="submit" className="shrink-0">
            <Search className="size-4" />
            جستجو
          </Button>
        </form>
      </div>

      {/* Status banner */}
      <StatusBanner
        stats={data.stats}
        topologyLinks={topologyLinks}
        updatedAtLabel={faDate(data.updatedAt)}
        storageLabel={storageLabel}
      />

      {/* KPIs */}
      <KpiGrid stats={data.stats} />

      {/* Topology + charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <TopologyHealthCard links={topologyLinks} />
        </div>
        <div className="xl:col-span-2">
          <InfraCharts stats={data.stats} />
        </div>
      </div>

      {/* Switch load + firewall services */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SwitchRack stats={data.stats} />
        <ServiceMix stats={data.stats} />
      </div>

      {/* Physical path samples */}
      <PathStrip records={data.records} />

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-xs font-medium text-muted">دسترسی سریع</p>
        <QuickActions />
      </div>
    </div>
  );
}
