import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryRecord, InventoryStats } from "@/lib/inventory/types";
import { cn } from "@/lib/utils";

export function KpiGrid({ stats }: { stats: InventoryStats }) {
  const items = [
    { label: "کل نودها", value: stats.total },
    { label: "فعال", value: stats.active, tone: "ok" as const },
    { label: "غیرفعال", value: stats.inactive, tone: "danger" as const },
    { label: "سوئیچ", value: stats.switches },
    { label: "VLAN", value: stats.vlans },
    { label: "IP", value: stats.ips },
    { label: "کاربر", value: stats.users },
    { label: "قواعد فایروال", value: stats.firewallRules },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="rounded-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted">{it.label}</p>
            <p
              className={cn(
                "mt-2 font-mono text-2xl tabular-nums tracking-tight",
                it.tone === "ok" && "text-ok",
                it.tone === "danger" && "text-danger",
              )}
            >
              {it.value.toLocaleString("fa-IR")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function InfraCharts({ stats }: { stats: InventoryStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>توزیع طبقه‌ها</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Chart data={stats.byFloor} color="var(--color-accent)" />
        </CardContent>
      </Card>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>توزیع VLAN</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Chart data={stats.byVlan} color="var(--color-ok)" />
        </CardContent>
      </Card>
    </div>
  );
}

function Chart({ data, color }: { data: { name: string; value: number }[]; color: string }) {
  if (!data.length) return <p className="text-sm text-muted">داده‌ای نیست</p>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          axisLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-fg)",
          }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SwitchRack({ stats }: { stats: InventoryStats }) {
  const max = Math.max(1, ...stats.bySwitch.map((s) => s.value));
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>بار سوئیچ‌ها</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {stats.bySwitch.map((sw) => (
          <div key={sw.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-mono" dir="ltr">
                {sw.name}
              </span>
              <span className="tabular-nums text-muted">
                {sw.active.toLocaleString("fa-IR")} فعال از {sw.value.toLocaleString("fa-IR")}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(sw.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ServiceMix({ stats }: { stats: InventoryStats }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>سرویس‌های فایروال</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {stats.topServices.length === 0 ? (
          <p className="text-sm text-muted">هنوز دسترسی فایروال ثبت نشده است.</p>
        ) : (
          stats.topServices.map((s) => (
            <span
              key={s.name}
              className="rounded-full bg-surface-2 px-3 py-1.5 text-sm text-fg"
            >
              {s.name}
              <span className="ms-2 font-mono text-muted tabular-nums">{s.value}</span>
            </span>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function PathStrip({ records }: { records: InventoryRecord[] }) {
  const sample = records.filter((r) => r.status === "active").slice(0, 6);
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>نمونه مسیر فیزیکی</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sample.map((r) => (
          <Link
            key={r.id}
            to="/inventory/$id"
            params={{ id: r.id }}
            className="flex flex-wrap items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-xs text-muted hover:text-fg"
          >
            <span>{r.userName}</span>
            <span className="text-faint">←</span>
            <span>اتاق {r.room}</span>
            <span className="text-faint">←</span>
            <span>
              {r.patchPanel}:{r.patchPort}
            </span>
            <span className="text-faint">←</span>
            <span className="font-mono" dir="ltr">
              {r.switchName} {r.switchInterface}
            </span>
            <span className="text-faint">←</span>
            <span className="font-mono text-accent" dir="ltr">
              {r.ip}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
