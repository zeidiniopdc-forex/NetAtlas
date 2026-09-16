import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Cable,
  Command,
  GitBranch,
  Network,
  Server,
  Shield,
  Table2,
  Upload,
  Users,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryRecord, InventoryStats } from "@/lib/inventory/types";
import {
  summarizeTopologyHealth,
  type TopologyLink,
} from "@/lib/network/topology";
import { cn } from "@/lib/utils";

type KpiTone = "default" | "ok" | "danger" | "accent";

const KPI_ICONS = {
  total: Network,
  active: Activity,
  inactive: AlertTriangle,
  switches: Server,
  vlans: Wifi,
  ips: Cable,
  users: Users,
  firewall: Shield,
} as const;

export function KpiGrid({ stats }: { stats: InventoryStats }) {
  const activeRatio =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  const items: {
    key: keyof typeof KPI_ICONS;
    label: string;
    value: number;
    tone?: KpiTone;
    hint?: string;
  }[] = [
    {
      key: "total",
      label: "کل نودها",
      value: stats.total,
      tone: "accent",
      hint: `${stats.floors.toLocaleString("fa-IR")} طبقه`,
    },
    {
      key: "active",
      label: "فعال",
      value: stats.active,
      tone: "ok",
      hint: `${activeRatio.toLocaleString("fa-IR")}٪ از کل`,
    },
    {
      key: "inactive",
      label: "غیرفعال",
      value: stats.inactive,
      tone: stats.inactive > 0 ? "danger" : "default",
    },
    { key: "switches", label: "سوئیچ", value: stats.switches },
    { key: "vlans", label: "VLAN", value: stats.vlans },
    { key: "ips", label: "IP یکتا", value: stats.ips },
    { key: "users", label: "کاربر", value: stats.users },
    { key: "firewall", label: "قواعد فایروال", value: stats.firewallRules },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => {
        const Icon = KPI_ICONS[it.key];
        return (
          <Card
            key={it.key}
            className={cn(
              "rounded-xl border-border/80 transition hover:border-accent/30",
              it.tone === "ok" && "bg-ok/5",
              it.tone === "danger" && it.value > 0 && "bg-danger/5",
              it.tone === "accent" && "bg-accent/5",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted">{it.label}</p>
                <span
                  className={cn(
                    "rounded-md p-1.5",
                    it.tone === "ok" && "bg-ok/15 text-ok",
                    it.tone === "danger" && "bg-danger/15 text-danger",
                    it.tone === "accent" && "bg-accent/15 text-accent",
                    (!it.tone || it.tone === "default") &&
                      "bg-surface-2 text-muted",
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 font-mono text-2xl tabular-nums tracking-tight",
                  it.tone === "ok" && "text-ok",
                  it.tone === "danger" && it.value > 0 && "text-danger",
                  it.tone === "accent" && "text-accent",
                )}
              >
                {it.value.toLocaleString("fa-IR")}
              </p>
              {it.hint ? (
                <p className="mt-1 text-[11px] text-faint">{it.hint}</p>
              ) : (
                <div className="mt-1 h-4" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StatusBanner({
  stats,
  topologyLinks,
  updatedAtLabel,
  storageLabel,
}: {
  stats: InventoryStats;
  topologyLinks: TopologyLink[];
  updatedAtLabel: string;
  storageLabel: string;
}) {
  const health = summarizeTopologyHealth(topologyLinks);
  const activeRatio =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <Card className="overflow-hidden rounded-xl border-border/80">
      <div className="bg-gradient-to-l from-accent/10 via-transparent to-transparent">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ok">NetAtlas v3</Badge>
              {health.downLinks > 0 ? (
                <Badge variant="danger">
                  {health.downLinks.toLocaleString("fa-IR")} لینک قطع
                </Badge>
              ) : health.totalLinks > 0 ? (
                <Badge variant="ok">توپولوژی سالم</Badge>
              ) : (
                <Badge variant="outline">بدون اتصال توپولوژی</Badge>
              )}
              {stats.inactive > 0 ? (
                <Badge variant="outline">
                  {stats.inactive.toLocaleString("fa-IR")} نود غیرفعال
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted">
              آخرین ذخیره: {updatedAtLabel}
              <span className="text-faint"> · {storageLabel}</span>
            </p>
          </div>

          <div className="flex min-w-[200px] flex-col gap-1.5 md:w-56">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>نسبت فعال</span>
              <span className="font-mono tabular-nums text-fg">
                {activeRatio.toLocaleString("fa-IR")}٪
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-ok transition-all"
                style={{ width: `${activeRatio}%` }}
              />
            </div>
            <p className="text-[11px] text-faint">
              {stats.active.toLocaleString("fa-IR")} از{" "}
              {stats.total.toLocaleString("fa-IR")} نود فعال
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function TopologyHealthCard({ links }: { links: TopologyLink[] }) {
  const health = summarizeTopologyHealth(links);
  const activePct =
    health.totalLinks > 0
      ? Math.round((health.activeLinks / health.totalLinks) * 100)
      : 0;

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="rounded-md bg-accent/15 p-1.5 text-accent">
              <GitBranch className="size-3.5" />
            </span>
            سلامت توپولوژی
          </CardTitle>
          <Link
            to="/inventory"
            className="text-xs text-accent hover:underline"
          >
            مدیریت اتصالات
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="کل اتصالات" value={health.totalLinks} />
          <Metric label="فعال" value={health.activeLinks} tone="ok" />
          <Metric
            label="قطع"
            value={health.downLinks}
            tone={health.downLinks > 0 ? "danger" : undefined}
          />
          <Metric label="نقاط یکتا" value={health.uniqueEndpoints} />
        </div>

        {health.totalLinks > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>لینک‌های فعال</span>
              <span className="font-mono tabular-nums">
                {activePct.toLocaleString("fa-IR")}٪
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  health.downLinks > 0 ? "bg-warn" : "bg-ok",
                )}
                style={{ width: `${activePct}%` }}
              />
            </div>
          </div>
        ) : null}

        {health.issues.length > 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-border bg-warn/5 p-2.5 text-xs text-warn">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {health.issues.length.toLocaleString("fa-IR")} مشکل در گراف:{" "}
              {health.issues[0]}
              {health.issues.length > 1 ? " …" : ""}
            </span>
          </div>
        ) : health.totalLinks > 0 ? (
          <p className="text-xs text-ok">مشکل ساختاری در توپولوژی شناسایی نشد.</p>
        ) : (
          <p className="text-xs text-muted">
            هنوز اتصالی ثبت نشده. از صفحه موجودی، بخش توپولوژی اضافه کنید.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "danger";
}) {
  return (
    <div className="rounded-lg bg-surface-2/60 px-3 py-2">
      <div
        className={cn(
          "text-xl font-semibold tabular-nums",
          tone === "ok" && "text-ok",
          tone === "danger" && "text-danger",
        )}
      >
        {value.toLocaleString("fa-IR")}
      </div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export function InfraCharts({ stats }: { stats: InventoryStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-xl">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">توزیع طبقه‌ها</CardTitle>
          <p className="text-xs text-muted">تعداد نود در هر طبقه</p>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          <Chart data={stats.byFloor} color="var(--color-accent)" />
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">توزیع VLAN</CardTitle>
          <p className="text-xs text-muted">پراکندگی نودها بر اساس VLAN</p>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          <Chart data={stats.byVlan} color="var(--color-ok)" />
        </CardContent>
      </Card>
      {stats.byNetwork.length > 0 ? (
        <Card className="rounded-xl lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">توزیع شبکه‌ها</CardTitle>
            <p className="text-xs text-muted">تعداد نود در هر شبکه منطقی</p>
          </CardHeader>
          <CardContent className="h-56 pt-2">
            <Chart data={stats.byNetwork.slice(0, 12)} color="var(--color-warn)" />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Chart({
  data,
  color,
}: {
  data: { name: string; value: number }[];
  color: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">داده‌ای برای نمایش نیست</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-2)", opacity: 0.5 }}
          contentStyle={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            color: "var(--color-fg)",
            fontFamily: "Vazirmatn, sans-serif",
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(value: number) => [
            value.toLocaleString("fa-IR"),
            "تعداد",
          ]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} fillOpacity={0.85 + (i % 3) * 0.05} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SwitchRack({ stats }: { stats: InventoryStats }) {
  const items = stats.bySwitch.slice(0, 10);
  const max = Math.max(1, ...items.map((s) => s.value));

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">بار سوئیچ‌ها</CardTitle>
        <p className="text-xs text-muted">
          {stats.switches.toLocaleString("fa-IR")} سوئیچ · نمایش ۱۰ مورد پرترافیک
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted">سوئیچی ثبت نشده است.</p>
        ) : (
          items.map((sw) => {
            const pct = Math.round((sw.value / max) * 100);
            const activePct =
              sw.value > 0 ? Math.round((sw.active / sw.value) * 100) : 0;
            return (
              <div key={sw.name}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-mono text-xs" dir="ltr">
                    {sw.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-xs text-muted">
                    {sw.active.toLocaleString("fa-IR")} /{" "}
                    {sw.value.toLocaleString("fa-IR")}
                    <span className="ms-1 text-faint">
                      ({activePct.toLocaleString("fa-IR")}٪)
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function ServiceMix({ stats }: { stats: InventoryStats }) {
  const max = Math.max(1, ...stats.topServices.map((s) => s.value));

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">سرویس‌های فایروال</CardTitle>
        <p className="text-xs text-muted">
          {stats.firewallRules.toLocaleString("fa-IR")} قاعده ثبت‌شده
        </p>
      </CardHeader>
      <CardContent>
        {stats.topServices.length === 0 ? (
          <p className="text-sm text-muted">هنوز دسترسی فایروال ثبت نشده است.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {stats.topServices.slice(0, 8).map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{s.name}</span>
                    <span className="font-mono text-xs tabular-nums text-muted">
                      {s.value.toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-warn/80"
                      style={{
                        width: `${Math.round((s.value / max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PathStrip({ records }: { records: InventoryRecord[] }) {
  const sample = records.filter((r) => r.status === "active").slice(0, 6);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm">نمونه مسیر فیزیکی</CardTitle>
            <p className="mt-0.5 text-xs text-muted">
              کاربر ← اتاق ← پچ‌پنل ← سوئیچ ← IP
            </p>
          </div>
          <Link
            to="/inventory"
            className="text-xs text-accent hover:underline"
          >
            همه رکوردها
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sample.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            رکورد فعالی برای نمایش مسیر وجود ندارد.
          </p>
        ) : (
          sample.map((r) => (
            <Link
              key={r.id}
              to="/inventory/$id"
              params={{ id: r.id }}
              className="group flex flex-wrap items-center gap-1.5 rounded-lg border border-transparent bg-surface-2/70 px-3 py-2.5 text-xs transition hover:border-accent/25 hover:bg-surface-2 hover:text-fg"
            >
              <PathChip label={r.userName || "—"} primary />
              <Arrow />
              <PathChip label={`اتاق ${r.room || "—"}`} />
              <Arrow />
              <PathChip label={`${r.patchPanel || "—"}:${r.patchPort || "—"}`} />
              <Arrow />
              <PathChip
                label={`${r.switchName || "—"} ${r.switchInterface || ""}`.trim()}
                mono
              />
              <Arrow />
              <PathChip label={r.ip || "—"} mono accent />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PathChip({
  label,
  primary,
  mono,
  accent,
}: {
  label: string;
  primary?: boolean;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5",
        primary && "bg-accent/10 font-medium text-fg",
        !primary && !accent && "text-muted group-hover:text-fg",
        accent && "bg-accent/15 font-medium text-accent",
        mono && "font-mono",
      )}
      dir={mono ? "ltr" : undefined}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return <span className="text-faint select-none">←</span>;
}

export function QuickActions() {
  const actions = [
    {
      to: "/inventory",
      label: "موجودی",
      desc: "مشاهده و ویرایش نودها",
      icon: Table2,
    },
    {
      to: "/exchange",
      label: "ورود اکسل",
      desc: "Import / Export داده",
      icon: Upload,
    },
    {
      to: "/cisco",
      label: "دستورات Cisco",
      desc: "تولید دستورات سوییچ",
      icon: Command,
    },
    {
      to: "/firewall",
      label: "فایروال",
      desc: "دسترسی‌ها و سرویس‌ها",
      icon: Shield,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((a) => (
        <Link key={a.to} to={a.to} className="group">
          <Card className="h-full rounded-xl border-border/80 transition group-hover:border-accent/40 group-hover:bg-accent/5">
            <CardContent className="flex items-start gap-3 p-4">
              <span className="rounded-lg bg-surface-2 p-2 text-muted transition group-hover:bg-accent/15 group-hover:text-accent">
                <a.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-fg">{a.label}</div>
                <p className="mt-0.5 text-xs text-muted">{a.desc}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-20 animate-pulse rounded-xl bg-surface" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
      <div className="h-36 animate-pulse rounded-xl bg-surface" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}

export function EmptyDashboard({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="rounded-full bg-danger/10 p-3 text-danger">
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <p className="text-sm font-medium">خواندن داده از سرور ممکن نشد</p>
          <p className="mt-1 text-xs text-muted">
            اتصال به سرور یا مسیر داده را بررسی کنید.
          </p>
        </div>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            تلاش مجدد
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
