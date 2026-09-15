import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ACTION_LABEL, ACTION_OPTIONS, EMPTY_RECORD, FIELD_LABELS, PROTOCOL_OPTIONS, STATUS_LABEL } from "@/lib/inventory/fields";
import type { FirewallAccess, InventoryRecord, RecordStatus } from "@/lib/inventory/types";
import { uid } from "@/lib/utils";

const GROUPS: { title: string; keys: (keyof typeof EMPTY_RECORD)[] }[] = [
  { title: "موقعیت و ساختمان", keys: ["site", "building", "floor", "room", "serverRoom", "rack", "userName"] },
  { title: "نود و پچ‌پنل", keys: ["nodeRow", "nodeNumber", "wallNodeLabel", "patchPanel", "patchPort", "patchRackPosition"] },
  { title: "سوئیچ، روتر و کابل", keys: ["switchName", "switchInterface", "switchManagementIp", "routerName", "routerInterface", "cableNumber"] },
  { title: "سیستم و شبکه", keys: ["computerName", "windowsUsername", "ip", "vlan", "network"] },
];

export function RecordForm({ initial, onSubmit, onCancel, busy }: {
  initial?: InventoryRecord;
  onSubmit: (record: InventoryRecord) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<InventoryRecord>(() => initial
    ? { ...EMPTY_RECORD, ...initial, firewallAccess: initial.firewallAccess.map((f) => ({ ...f })) }
    : { ...EMPTY_RECORD, id: uid("rec"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

  const set = (key: keyof InventoryRecord, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const updateFw = (id: string, patch: Partial<FirewallAccess>) => setForm((f) => ({ ...f, firewallAccess: f.firewallAccess.map((row) => row.id === id ? { ...row, ...patch } : row) }));

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, updatedAt: new Date().toISOString() }); }}>
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h4 className="mb-3 text-xs font-medium text-muted">{g.title}</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {g.keys.map((key) => (
              <Field key={key} label={FIELD_LABELS[key]} value={String(form[key] ?? "")} mono={key === "ip" || key === "switchInterface" || key === "routerInterface" || key === "switchManagementIp" || key === "windowsUsername"} onChange={(v) => set(key, v)} />
            ))}
          </div>
        </section>
      ))}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>{FIELD_LABELS.status}</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v as RecordStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{STATUS_LABEL.active}</SelectItem>
              <SelectItem value="inactive">{STATUS_LABEL.inactive}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field label={FIELD_LABELS.notes} value={form.notes} onChange={(v) => set("notes", v)} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-xs font-medium text-muted">دسترسی‌های فایروال برای این IP</h4>
          <Button type="button" size="sm" variant="secondary" onClick={() => setForm((f) => ({ ...f, firewallAccess: [...f.firewallAccess, { id: uid("fw"), service: "", protocol: "TCP", port: "", destination: "", action: "allow", notes: "" }] }))}>
            <Plus className="size-4" /> سرویس
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {form.firewallAccess.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted">هنوز سرویسی ثبت نشده. با افزودن سرویس مشخص می‌شود این IP به چه مقصدهایی دسترسی دارد.</p>
          ) : form.firewallAccess.map((row) => (
            <div key={row.id} className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Mini label="سرویس" value={row.service} onChange={(v) => updateFw(row.id, { service: v })} />
                <div className="flex flex-col gap-1"><Label>پروتکل</Label><Select value={row.protocol} onValueChange={(v) => updateFw(row.id, { protocol: v as FirewallAccess["protocol"] })}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{PROTOCOL_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <Mini label="پورت" value={row.port} mono onChange={(v) => updateFw(row.id, { port: v })} />
                <Mini label="مقصد" value={row.destination} onChange={(v) => updateFw(row.id, { destination: v })} />
                <div className="flex flex-col gap-1"><Label>عمل</Label><Select value={row.action} onValueChange={(v) => updateFw(row.id, { action: v as FirewallAccess["action"] })}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{ACTION_OPTIONS.map((a) => <SelectItem key={a} value={a}>{ACTION_LABEL[a]}</SelectItem>)}</SelectContent></Select></div>
                <Mini label="توضیح" value={row.notes} onChange={(v) => updateFw(row.id, { notes: v })} />
              </div>
              <div className="mt-2 flex justify-end"><Button type="button" size="sm" variant="ghost" onClick={() => setForm((f) => ({ ...f, firewallAccess: f.firewallAccess.filter((x) => x.id !== row.id) }))}><Trash2 className="size-4" /> حذف</Button></div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onCancel}>انصراف</Button><Button type="submit" disabled={busy}>ذخیره روی سرور</Button></div>
    </form>
  );
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return <div className="flex flex-col gap-1.5"><Label>{label}</Label>{label === FIELD_LABELS.notes ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} /> : <Input value={value} dir={mono ? "ltr" : undefined} className={mono ? "font-mono" : undefined} onChange={(e) => onChange(e.target.value)} />}</div>;
}

function Mini({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return <div className="flex flex-col gap-1"><Label>{label}</Label><Input className={mono ? "h-9 font-mono" : "h-9"} dir={mono ? "ltr" : undefined} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
