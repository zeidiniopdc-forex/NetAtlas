import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Filter, GitBranch, Plus, Search, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAccess } from "@/lib/access/session";
import {
  collectEndpoints,
  endpointKindLabels,
  endpointKey,
  findTopologyIssues,
  linkTypeLabels,
  statusLabels,
  summarizeTopologyHealth,
  traceAllReachable,
  traceTopology,
  type TopologyEndpointKind,
  type TopologyLink,
  type TopologyLinkType,
  type TopologyStatus,
} from "@/lib/network/topology";
import { useTopology, useTopologyMutations } from "@/lib/network/topology-query";

const kinds: TopologyEndpointKind[] = [
  "wallNode",
  "patchPanel",
  "switchPort",
  "routerInterface",
  "firewall",
  "vlan",
];
const types: TopologyLinkType[] = ["copper", "fiber", "trunk", "access", "logical"];

const blank = (): TopologyLink => ({
  id: crypto.randomUUID(),
  type: "copper",
  endpointA: { kind: "wallNode", ref: "", label: "" },
  endpointB: { kind: "switchPort", ref: "", label: "" },
  status: "active",
  cableNumber: "",
  site: "",
  building: "",
  notes: "",
  createdAt: "",
  updatedAt: "",
});

export function NetworkTopologyPanel({
  showFilters = true,
}: {
  showFilters?: boolean;
}) {
  const { data = [] } = useTopology();
  const { upsert, remove } = useTopologyMutations();
  const { canEdit } = useAccess();

  const [form, setForm] = useState<TopologyLink>(blank());
  const [traceStartKey, setTraceStartKey] = useState("");
  const [traceDestKey, setTraceDestKey] = useState("");
  const [showAllReachable, setShowAllReachable] = useState(false);

  const [filterSite, setFilterSite] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | TopologyStatus>("");
  const [filterType, setFilterType] = useState<"" | TopologyLinkType>("");
  const [filterQ, setFilterQ] = useState("");

  const sites = useMemo(() => {
    const set = new Set<string>();
    for (const l of data) if (l.site?.trim()) set.add(l.site.trim());
    return [...set].sort((a, b) => a.localeCompare(b, "fa"));
  }, [data]);

  const buildings = useMemo(() => {
    const set = new Set<string>();
    for (const l of data) {
      if (filterSite && (l.site?.trim() ?? "") !== filterSite) continue;
      if (l.building?.trim()) set.add(l.building.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b, "fa"));
  }, [data, filterSite]);

  const filtered = useMemo(() => {
    const q = filterQ.trim().toLowerCase();
    return data.filter((l) => {
      if (filterSite && (l.site?.trim() ?? "") !== filterSite) return false;
      if (filterBuilding && (l.building?.trim() ?? "") !== filterBuilding) return false;
      if (filterStatus && l.status !== filterStatus) return false;
      if (filterType && l.type !== filterType) return false;
      if (!q) return true;
      const hay = [
        l.endpointA.label,
        l.endpointA.ref,
        l.endpointB.label,
        l.endpointB.ref,
        l.cableNumber,
        l.site,
        l.building,
        l.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, filterSite, filterBuilding, filterStatus, filterType, filterQ]);

  const endpoints = useMemo(() => collectEndpoints(filtered), [filtered]);
  const issues = useMemo(() => findTopologyIssues(data), [data]);
  const health = useMemo(() => summarizeTopologyHealth(data), [data]);
  const filteredHealth = useMemo(
    () => summarizeTopologyHealth(filtered),
    [filtered],
  );

  const startEndpoint = useMemo(
    () => endpoints.find((e) => endpointKey(e) === traceStartKey) ?? null,
    [endpoints, traceStartKey],
  );
  const destEndpoint = useMemo(
    () => endpoints.find((e) => endpointKey(e) === traceDestKey) ?? null,
    [endpoints, traceDestKey],
  );

  // Trace uses full graph so path can cross filtered-out links when needed
  const traced = useMemo(() => {
    if (!startEndpoint) return null;
    return traceTopology(data, startEndpoint, destEndpoint ?? undefined);
  }, [data, startEndpoint, destEndpoint]);

  const reachable = useMemo(() => {
    if (!showAllReachable || !startEndpoint) return [];
    return traceAllReachable(data, startEndpoint);
  }, [data, startEndpoint, showAllReachable]);

  const hasActiveFilters =
    !!filterSite || !!filterBuilding || !!filterStatus || !!filterType || !!filterQ;

  const clearFilters = () => {
    setFilterSite("");
    setFilterBuilding("");
    setFilterStatus("");
    setFilterType("");
    setFilterQ("");
  };

  const setEndpoint = (
    side: "endpointA" | "endpointB",
    key: "kind" | "ref" | "label",
    value: string,
  ) =>
    setForm((x) => ({
      ...x,
      [side]: { ...x[side], [key]: value },
    }));

  const save = () =>
    upsert.mutate(form, {
      onSuccess: () => {
        toast.success("اتصال توپولوژی ذخیره شد");
        setForm(blank());
      },
      onError: (e) => toast.error(e.message),
    });

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">توپولوژی و ردیابی مسیر</CardTitle>
            <p className="mt-1 text-xs text-muted">
              گراف مستقل ارتباط نود دیواری تا پچ‌پنل، سوییچ، روتر، فایروال و VLAN
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="ok">
              {health.totalLinks.toLocaleString("fa-IR")} اتصال
            </Badge>
            <Badge variant="ok">
              {health.activeLinks.toLocaleString("fa-IR")} فعال
            </Badge>
            {health.downLinks > 0 ? (
              <Badge variant="danger">
                {health.downLinks.toLocaleString("fa-IR")} قطع
              </Badge>
            ) : null}
            <Badge variant="outline">
              {health.uniqueEndpoints.toLocaleString("fa-IR")} نقطه
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {showFilters ? (
          <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="size-4" />
                فیلتر اتصالات
              </div>
              {hasActiveFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-3.5" />
                  پاک کردن
                </Button>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={filterSite}
                onChange={(e) => {
                  setFilterSite(e.target.value);
                  setFilterBuilding("");
                }}
              >
                <option value="">همه سایت‌ها</option>
                {sites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
              >
                <option value="">همه ساختمان‌ها</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as "" | TopologyStatus)
                }
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="active">{statusLabels.active}</option>
                <option value="down">{statusLabels.down}</option>
              </select>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "" | TopologyLinkType)
                }
              >
                <option value="">همه انواع</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {linkTypeLabels[t]}
                  </option>
                ))}
              </select>
              <Input
                placeholder="جستجو در برچسب / کابل…"
                value={filterQ}
                onChange={(e) => setFilterQ(e.target.value)}
              />
            </div>
            {hasActiveFilters ? (
              <p className="text-xs text-muted">
                نمایش {filtered.length.toLocaleString("fa-IR")} از{" "}
                {data.length.toLocaleString("fa-IR")} اتصال
                {" · "}
                {filteredHealth.activeLinks.toLocaleString("fa-IR")} فعال /{" "}
                {filteredHealth.downLinks.toLocaleString("fa-IR")} قطع
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Free-form Trace */}
        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="size-4" />
            ردیابی مسیر آزاد
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted">نقطه شروع</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={traceStartKey}
                onChange={(e) => {
                  setTraceStartKey(e.target.value);
                  setShowAllReachable(false);
                }}
              >
                <option value="">انتخاب کنید…</option>
                {endpoints.map((e) => (
                  <option key={endpointKey(e)} value={endpointKey(e)}>
                    {endpointKindLabels[e.kind]} · {e.label || e.ref}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">مقصد (اختیاری)</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={traceDestKey}
                onChange={(e) => {
                  setTraceDestKey(e.target.value);
                  setShowAllReachable(false);
                }}
              >
                <option value="">همه نقاط قابل‌دسترسی</option>
                {endpoints
                  .filter((e) => endpointKey(e) !== traceStartKey)
                  .map((e) => (
                    <option key={endpointKey(e)} value={endpointKey(e)}>
                      {endpointKindLabels[e.kind]} · {e.label || e.ref}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {startEndpoint && !traceDestKey ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAllReachable((v) => !v)}
            >
              <GitBranch className="size-4" />
              {showAllReachable ? "مخفی کردن لیست" : "نمایش همه نقاط قابل‌دسترسی"}
            </Button>
          ) : null}

          {traced ? (
            <TraceResultView traced={traced} />
          ) : (
            <p className="text-xs text-muted">
              نقطه شروع را انتخاب کنید تا مسیر نمایش داده شود.
            </p>
          )}

          {showAllReachable && reachable.length > 0 ? (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
              <div className="text-xs font-medium text-muted">
                {reachable.length.toLocaleString("fa-IR")} نقطه قابل‌دسترسی از این
                مبدا
              </div>
              <div className="flex flex-col gap-1.5">
                {reachable.map((r) => (
                  <button
                    key={endpointKey(r.destination!)}
                    type="button"
                    className="flex flex-wrap items-center gap-2 rounded-md bg-surface-2 px-2 py-1.5 text-start text-xs hover:bg-surface"
                    onClick={() => {
                      setTraceDestKey(endpointKey(r.destination!));
                      setShowAllReachable(false);
                    }}
                  >
                    <Badge variant="outline">{r.hops} hop</Badge>
                    <span>{r.destination!.label || r.destination!.ref}</span>
                    <span className="text-faint">
                      ({endpointKindLabels[r.destination!.kind]})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Add link form */}
        <div className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-2">
          {(["endpointA", "endpointB"] as const).map((side, i) => (
            <div key={side} className="space-y-2">
              <div className="text-xs font-medium">نقطه {i === 0 ? "A" : "B"}</div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={form[side].kind}
                  onChange={(e) => setEndpoint(side, "kind", e.target.value)}
                >
                  {kinds.map((k) => (
                    <option key={k} value={k}>
                      {endpointKindLabels[k]}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="شناسه / Ref"
                  value={form[side].ref}
                  onChange={(e) => setEndpoint(side, "ref", e.target.value)}
                />
              </div>
              <Input
                placeholder="عنوان نمایشی"
                value={form[side].label}
                onChange={(e) => setEndpoint(side, "label", e.target.value)}
              />
            </div>
          ))}

          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as TopologyLinkType })
              }
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {linkTypeLabels[t]}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as TopologyStatus,
                })
              }
            >
              <option value="active">{statusLabels.active}</option>
              <option value="down">{statusLabels.down}</option>
            </select>
            <Input
              placeholder="شماره کابل"
              value={form.cableNumber}
              onChange={(e) => setForm({ ...form, cableNumber: e.target.value })}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="سایت"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
            />
            <Input
              placeholder="ساختمان"
              value={form.building}
              onChange={(e) => setForm({ ...form, building: e.target.value })}
            />
          </div>

          <Input
            placeholder="یادداشت"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {canEdit ? (
            <Button onClick={save} disabled={upsert.isPending}>
              <Plus className="size-4" />
              ثبت اتصال
            </Button>
          ) : null}
        </div>

        {issues.length > 0 ? (
          <div className="flex items-start gap-2 rounded-md border border-border p-3 text-sm text-warn">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{issues.slice(0, 5).join(" | ")}</span>
          </div>
        ) : null}

        {/* Links table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-2 py-2 text-start">A</th>
                <th className="px-2 py-2 text-start">B</th>
                <th className="px-2 py-2 text-start">نوع</th>
                <th className="px-2 py-2 text-start">وضعیت</th>
                <th className="px-2 py-2 text-start">سایت</th>
                <th className="px-2 py-2 text-start">ساختمان</th>
                <th className="px-2 py-2 text-start">کابل</th>
                <th className="px-2 py-2 text-end">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-2 py-8 text-center text-muted"
                  >
                    {data.length === 0
                      ? "اتصالی ثبت نشده است."
                      : "با فیلتر فعلی نتیجه‌ای نیست."}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-2 py-2">
                      {l.endpointA.label || l.endpointA.ref}
                    </td>
                    <td className="px-2 py-2">
                      {l.endpointB.label || l.endpointB.ref}
                    </td>
                    <td className="px-2 py-2">{linkTypeLabels[l.type]}</td>
                    <td className="px-2 py-2">
                      <Badge variant={l.status === "active" ? "ok" : "danger"}>
                        {statusLabels[l.status]}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 text-xs">{l.site || "—"}</td>
                    <td className="px-2 py-2 text-xs">{l.building || "—"}</td>
                    <td className="px-2 py-2 font-mono text-xs">
                      {l.cableNumber || "—"}
                    </td>
                    <td className="px-2 py-2 text-end">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTraceStartKey(endpointKey(l.endpointA));
                            setTraceDestKey(endpointKey(l.endpointB));
                            setShowAllReachable(false);
                          }}
                        >
                          <GitBranch className="size-4" />
                          Trace
                        </Button>
                        {canEdit ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove.mutate(l.id)}
                            title="حذف"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TraceResultView({
  traced,
}: {
  traced: NonNullable<ReturnType<typeof traceTopology>>;
}) {
  if (!traced.found) {
    return (
      <div className="space-y-2 rounded-lg border border-border p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-danger">
          <AlertTriangle className="size-4" />
          مسیر پیدا نشد
        </div>
        <p className="text-xs text-muted">
          بین «{traced.start.label || traced.start.ref}»
          {traced.destination
            ? ` و «${traced.destination.label || traced.destination.ref}»`
            : ""}{" "}
          مسیر فعالی وجود ندارد.
        </p>
        {traced.downLinksEncountered.length > 0 ? (
          <div className="text-xs text-warn">
            {traced.downLinksEncountered.length.toLocaleString("fa-IR")} لینک قطع در
            همسایگی مبدا شناسایی شد.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <GitBranch className="size-4" />
        مسیر پیدا شد
        <Badge variant="ok">{traced.hops.toLocaleString("fa-IR")} hop</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {traced.path.map((p, i) => (
          <span
            key={`${p.kind}:${p.ref}-${i}`}
            className="flex items-center gap-2"
          >
            <Badge variant="outline">
              {endpointKindLabels[p.kind]} · {p.label || p.ref}
            </Badge>
            {i < traced.path.length - 1 ? (
              <span className="text-muted">↔</span>
            ) : null}
          </span>
        ))}
      </div>

      {traced.links.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-xs text-muted">جزئیات hopها</div>
          {traced.links.map((link, i) => (
            <div
              key={link.id}
              className="flex flex-wrap items-center gap-2 rounded-md bg-surface-2 px-2 py-1.5 text-xs"
            >
              <span className="tabular-nums text-faint">#{i + 1}</span>
              <Badge variant={link.status === "active" ? "ok" : "danger"}>
                {statusLabels[link.status]}
              </Badge>
              <span>{linkTypeLabels[link.type]}</span>
              {link.cableNumber ? (
                <span className="font-mono" dir="ltr">
                  کابل {link.cableNumber}
                </span>
              ) : null}
              {link.site ? <span>سایت: {link.site}</span> : null}
              {link.building ? <span>ساختمان: {link.building}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
