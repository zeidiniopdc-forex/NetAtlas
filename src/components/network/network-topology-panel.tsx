import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, GitBranch, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAccess } from "@/lib/access/session";
import { findTopologyIssues, endpointKindLabels, linkTypeLabels, traceTopology, type TopologyEndpointKind, type TopologyLink, type TopologyLinkType } from "@/lib/network/topology";
import { useTopology, useTopologyMutations } from "@/lib/network/topology-query";

const kinds: TopologyEndpointKind[] = ["wallNode", "patchPanel", "switchPort", "routerInterface", "firewall", "vlan"];
const types: TopologyLinkType[] = ["copper", "fiber", "trunk", "access", "logical"];
const blank = (): TopologyLink => ({ id: crypto.randomUUID(), type: "copper", endpointA: { kind: "wallNode", ref: "", label: "" }, endpointB: { kind: "switchPort", ref: "", label: "" }, status: "active", cableNumber: "", site: "", building: "", notes: "", createdAt: "", updatedAt: "" });

export function NetworkTopologyPanel() {
  const { data = [] } = useTopology(); const { upsert, remove } = useTopologyMutations(); const { canEdit } = useAccess();
  const [form, setForm] = useState<TopologyLink>(blank()); const [traceId, setTraceId] = useState<string | null>(null);
  const issues = useMemo(() => findTopologyIssues(data), [data]);
  const traced = useMemo(() => { const link = data.find((x) => x.id === traceId); return link ? traceTopology(data, link.endpointA) : null; }, [data, traceId]);
  const setEndpoint = (side: "endpointA" | "endpointB", key: "kind" | "ref" | "label", value: string) => setForm((x) => ({ ...x, [side]: { ...x[side], [key]: value } } as TopologyLink));
  const save = () => upsert.mutate(form, { onSuccess: () => { toast.success("اتصال توپولوژی ذخیره شد"); setForm(blank()); }, onError: (e) => toast.error(e.message) });
  return <Card className="rounded-lg"><CardHeader className="pb-2"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-sm">توپولوژی و Trace دوطرفه</CardTitle><p className="mt-1 text-xs text-muted">گراف مستقل ارتباط Wall Node تا Patch Panel، Switch، Router، Firewall و VLAN</p></div><Badge variant="ok">{data.length.toLocaleString("fa-IR")} اتصال</Badge></div></CardHeader><CardContent className="space-y-4">
    <div className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-2">
      {(["endpointA", "endpointB"] as const).map((side, i) => <div key={side} className="space-y-2"><div className="text-xs font-medium">نقطه {i === 0 ? "A" : "B"}</div><div className="grid grid-cols-2 gap-2"><select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form[side].kind} onChange={(e) => setEndpoint(side, "kind", e.target.value)}>{kinds.map((k) => <option key={k} value={k}>{endpointKindLabels[k]}</option>)}</select><Input placeholder="شناسه / Ref" value={form[side].ref} onChange={(e) => setEndpoint(side, "ref", e.target.value)} /></div><Input placeholder="عنوان نمایشی" value={form[side].label} onChange={(e) => setEndpoint(side, "label", e.target.value)} /></div>)}
      <div className="grid gap-2 sm:grid-cols-3"><select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TopologyLinkType })}>{types.map((t) => <option key={t} value={t}>{linkTypeLabels[t]}</option>)}</select><select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "down" })}><option value="active">Active</option><option value="down">Down</option></select><Input placeholder="شماره کابل" value={form.cableNumber} onChange={(e) => setForm({ ...form, cableNumber: e.target.value })} /></div>
      <div className="grid gap-2 sm:grid-cols-2"><Input placeholder="Site / سایت" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} /><Input placeholder="Building / ساختمان" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} /></div><Input placeholder="یادداشت" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      {canEdit ? <Button onClick={save} disabled={upsert.isPending}><Plus className="size-4" />ثبت اتصال</Button> : null}
    </div>
    {issues.length > 0 ? <div className="flex items-start gap-2 rounded-md border border-border p-3 text-sm text-warn"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>{issues.slice(0, 5).join(" | ")}</span></div> : null}
    {traced ? <div className="rounded-lg border border-border p-3"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><GitBranch className="size-4" />مسیر Trace</div><div className="flex flex-wrap items-center gap-2">{traced.path.map((p, i) => <span key={`${p.kind}:${p.ref}`} className="flex items-center gap-2"><Badge variant="outline">{p.label || p.ref}</Badge>{i < traced.path.length - 1 ? <span className="text-muted">↔</span> : null}</span>)}</div></div> : null}
    <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead className="text-xs text-muted"><tr><th className="px-2 py-2 text-start">A</th><th className="px-2 py-2 text-start">B</th><th className="px-2 py-2 text-start">نوع</th><th className="px-2 py-2 text-start">وضعیت</th><th className="px-2 py-2 text-start">کابل</th><th className="px-2 py-2 text-end">عملیات</th></tr></thead><tbody>{data.map((l) => <tr key={l.id} className="border-t border-border"><td className="px-2 py-2">{l.endpointA.label || l.endpointA.ref}</td><td className="px-2 py-2">{l.endpointB.label || l.endpointB.ref}</td><td className="px-2 py-2">{linkTypeLabels[l.type]}</td><td className="px-2 py-2"><Badge variant={l.status === "active" ? "ok" : "danger"}>{l.status}</Badge></td><td className="px-2 py-2 font-mono text-xs">{l.cableNumber || "—"}</td><td className="px-2 py-2 text-end"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => setTraceId(l.id)}><GitBranch className="size-4" />Trace</Button>{canEdit ? <Button variant="ghost" size="icon" onClick={() => remove.mutate(l.id)} title="حذف"><Trash2 className="size-4" /></Button> : null}</div></td></tr>)}</tbody></table></div>
  </CardContent></Card>;
}
