import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import {
  InfraCharts,
  KpiGrid,
  PathStrip,
  ServiceMix,
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
  const { data, isLoading, error } = useInventory();
  const { data: topologyLinks = [] } = useTopology();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  if (isLoading) return <PageSkeleton />;
  if (error || !data) {
    return <p className="text-sm text-danger">خواندن داده از سرور ممکن نشد.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs text-muted">نمای کلی زیرساخت · NetAtlas v3</p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight md:text-3xl">
            داشبورد شبکه
          </h1>
          <p className="mt-2 text-sm text-muted">
            آخرین ذخیره: {faDate(data.updatedAt)}
            {data.storage.path
              ? " · فایل JSON روی سرور"
              : " · ذخیره در حافظه موقت سرور"}
          </p>
        </div>
        <form
          className="flex w-full max-w-lg gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) void navigate({ to: "/search", search: { q: q.trim() } });
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی IP، کاربر، سوئیچ، پچ‌پنل، VLAN…"
          />
          <Button type="submit">
            <Search className="size-4" />
            جستجو
          </Button>
        </form>
      </div>

      <KpiGrid stats={data.stats} />

      <TopologyHealthCard links={topologyLinks} />

      <InfraCharts stats={data.stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SwitchRack stats={data.stats} />
        <ServiceMix stats={data.stats} />
      </div>

      <PathStrip records={data.records} />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link to="/inventory">مشاهده موجودی</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/exchange">ورود از اکسل</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/cisco">دستورات Cisco</Link>
        </Button>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  );
}
