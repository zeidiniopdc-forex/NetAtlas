import { AlertTriangle, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { InventoryRecord } from "@/lib/inventory/types";
import { isIpInCidr, usableIpCount, type Vlan } from "@/lib/network/vlans";
import { useVlanMutations, useVlans } from "@/lib/network/vlans-query";
import { useAccess } from "@/lib/access/session";

const emptyVlan = (): Vlan => ({ id: "", vlanId: 1, name: "", site: "", building: "", purpose: "", status: "active", cidr: "", gateway: "", dhcpStart: "", dhcpEnd: "", notes: "", createdAt: "", updatedAt: "" });

export function NetworkVlanPanel({ records }: { records: InventoryRecord[] }) {
  const { data: vlans = [], isLoading } = useVlans();
  const { upsert, remove } = useVlanMutations();
  const { canEdit } = useAccess();
  const [editing, setEditing] = useState<Vlan | null>(null);
  const [form, setForm] = useState<Vlan>(emptyVlan());

  const assigned = useMemo(() => vlans.map((v) => ({ ...v, assigned: records.filter((r) => r.ip && isIpInCidr(r.ip, v.cidr)).length })), [vlans, records]);
  const totalAssigned = assigned.reduce((sum, v) => sum + v.assigned, 0);

  const save = () => upsert.mutate(form, { onSuccess: () => { toast.success("VLAN ذخیره شد"); setEditing(null); }, onError: (e) => toast.error(e instanceof Error ? e.message : "ذخیره VLAN انجام نشد") });
  const startCreate = () => { setForm(emptyVlan()); setEditing({ ...emptyVlan() }); };
  const startEdit = (v: Vlan) => { setForm({ ...v }); setEditing(v); };
  const cancel = () => setEditing(null);

  return <Card className="rounded-lg">
    <CardHeader className="pb-2"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-sm">مدیریت VLAN و Subnet</CardTitle><p className="mt-1 text-xs text-muted">VLAN مستقل، Subnet، Gateway و محدوده DHCP با کنترل هم‌پوشانی</p></div>{canEdit ? <Button size="sm" onClick={startCreate}><Plus className="size-4" />VLAN جدید</Button> : null}</div></CardHeader>
    <CardContent>
      {editing ? <VlanForm value={form} busy={upsert.isPending} onChange={setForm} onSave={save} onCancel={cancel} /> : null}
      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <Stat label="VLAN ثبت‌شده" value={vlans.length} />
        <Stat label="IP تخصیص‌یافته" value={totalAssigned} />
        <Stat label="VLAN فعال" value={vlans.filter((v) => v.status === "active").length} />
        <Stat label="Subnet" value={vlans.filter((v) => v.cidr).length} />
      </div>
      <div className="overflow-x-auto rounded-md border border-border"><table className="w-full min-w-[1050px] text-sm"><thead className="bg-surface-2 text-xs text-muted"><tr>{["VLAN","نام","Site / ساختمان","Subnet","Gateway","DHCP","مصرف IP","وضعیت","عملیات"].map((h) => <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>)}</tr></thead><tbody>{isLoading ? <tr><td colSpan={9} className="px-3 py-8 text-center text-muted">در حال بارگذاری…</td></tr> : assigned.length === 0 ? <tr><td colSpan={9} className="px-3 py-8 text-center text-muted">هنوز VLAN مستقلی ثبت نشده است.</td></tr> : assigned.map((v) => { const capacity = usableIpCount(v.cidr); const pct = capacity ? Math.min(100, Math.round((v.assigned / capacity) * 100)) : 0; return <tr key={v.id} className="border-t border-border hover:bg-surface-2/60"><td className="px-3 py-2.5 font-mono">{v.vlanId}</td><td className="px-3 py-2.5 font-medium">{v.name}</td><td className="px-3 py-2.5">{[v.site, v.building].filter(Boolean).join(" / ") || "—"}</td><td className="px-3 py-2.5 font-mono" dir="ltr">{v.cidr}</td><td className="px-3 py-2.5 font-mono" dir="ltr">{v.gateway || "—"}</td><td className="px-3 py-2.5 font-mono" dir="ltr">{v.dhcpStart || v.dhcpEnd ? `${v.dhcpStart || "…"} - ${v.dhcpEnd || "…"}` : "—"}</td><td className="px-3 py-2.5">{v.assigned.toLocaleString("fa-IR")} / {capacity.toLocaleString("fa-IR")} <span className="text-xs text-muted">({pct.toLocaleString("fa-IR")}٪)</span></td><td className="px-3 py-2.5"><Badge variant={v.status === "active" ? "ok" : "danger"}>{v.status === "active" ? "فعال" : "غیرفعال"}</Badge></td><td className="px-3 py-2.5"><div className="flex gap-1">{canEdit ? <><Button variant="ghost" size="icon" className="size-8" onClick={() => startEdit(v)} title="ویرایش"><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 text-danger" disabled={remove.isPending} onClick={() => { if (window.confirm(`VLAN ${v.vlanId} حذف شود؟`)) remove.mutate(v.id, { onSuccess: () => toast.success("VLAN حذف شد"), onError: (e) => toast.error(e instanceof Error ? e.message : "حذف انجام نشد") }); }} title="حذف"><Trash2 className="size-4" /></Button></> : <span className="text-xs text-faint">—</span>}</div></td></tr>; })}</tbody></table></div>
      {vlans.length > 0 && records.some((r) => r.ip) ? <p className="mt-2 text-xs text-muted">مصرف IP بر اساس IPهای موجود در موجودی فعلی محاسبه می‌شود؛ تخصیص مستقل IPAM در مرحله بعدی تکمیل خواهد شد.</p> : null}
    </CardContent>
  </Card>;
}

function VlanForm({ value, busy, onChange, onSave, onCancel }: { value: Vlan; busy: boolean; onChange: (v: Vlan) => void; onSave: () => void; onCancel: () => void }) {
  const set = (key: keyof Vlan, value: string | number) => onChange({ ...valueObj, [key]: value });
  const valueObj = value;
  return <div className="mb-4 rounded-md border border-border p-3"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-medium"><Plus className="size-4" />{value.id ? "ویرایش VLAN" : "ثبت VLAN جدید"}</div><Button variant="ghost" size="icon" className="size-8" onClick={onCancel}><X className="size-4" /></Button></div><div className="grid gap-2 md:grid-cols-4">
    <Field label="VLAN ID"><Input type="number" min={1} max={4094} value={value.vlanId} onChange={(e) => set("vlanId", Number(e.target.value))} /></Field>
    <Field label="نام VLAN"><Input value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="Users" /></Field>
    <Field label="Site"><Input value={value.site} onChange={(e) => set("site", e.target.value)} /></Field>
    <Field label="ساختمان"><Input value={value.building} onChange={(e) => set("building", e.target.value)} /></Field>
    <Field label="Purpose"><Input value={value.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="کاربران / سرورها / VoIP" /></Field>
    <Field label="Subnet / CIDR"><Input dir="ltr" value={value.cidr} onChange={(e) => set("cidr", e.target.value)} placeholder="10.33.10.0/24" /></Field>
    <Field label="Gateway"><Input dir="ltr" value={value.gateway} onChange={(e) => set("gateway", e.target.value)} placeholder="10.33.10.1" /></Field>
    <Field label="وضعیت"><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={value.status} onChange={(e) => set("status", e.target.value)}><option value="active">فعال</option><option value="disabled">غیرفعال</option></select></Field>
    <Field label="DHCP Start"><Input dir="ltr" value={value.dhcpStart} onChange={(e) => set("dhcpStart", e.target.value)} /></Field>
    <Field label="DHCP End"><Input dir="ltr" value={value.dhcpEnd} onChange={(e) => set("dhcpEnd", e.target.value)} /></Field>
    <Field label="یادداشت"><Input value={value.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
  </div><div className="mt-3 flex justify-end gap-2"><Button variant="outline" onClick={onCancel}>انصراف</Button><Button disabled={busy || !value.name || !value.cidr} onClick={onSave}>{busy ? "در حال ذخیره…" : "ذخیره VLAN"}</Button></div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1 text-xs"><span className="text-muted">{label}</span>{children}</label>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-md border border-border p-2.5"><div className="text-lg font-semibold tabular-nums">{value.toLocaleString("fa-IR")}</div><div className="text-xs text-muted">{label}</div></div>; }
