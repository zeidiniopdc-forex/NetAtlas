import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AssetKind, NetworkAsset } from "@/lib/network/assets";
import { assetKindLabel } from "@/lib/network/assets";
import { useAssetMutations, useAssets } from "@/lib/network/assets-query";
import { useAccess } from "@/lib/access/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const KINDS: AssetKind[] = ["switch", "router", "firewall", "rack", "serverRoom"];

function emptyAsset(): NetworkAsset {
  const now = new Date().toISOString();
  return {
    id: "",
    kind: "switch",
    name: "",
    site: "",
    building: "",
    location: "",
    vendor: "Cisco",
    model: "",
    serialNumber: "",
    managementIp: "",
    interfaces: [],
    records: 0,
    activeRecords: 0,
    status: "active",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function NetworkAssetsPanel() {
  const { data: assets = [], isLoading } = useAssets();
  const { upsert, remove } = useAssetMutations();
  const { canEdit } = useAccess();
  const [editing, setEditing] = useState<NetworkAsset | null>(null);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    if (!needle) return assets;
    return assets.filter((asset) => [asset.name, asset.kind, asset.site, asset.building, asset.managementIp, asset.vendor, asset.model, asset.serialNumber]
      .join(" ").toLocaleLowerCase().includes(needle));
  }, [assets, q]);

  const save = () => {
    if (!editing) return;
    upsert.mutate(editing, {
      onSuccess: () => { toast.success("دارایی شبکه ذخیره شد"); setEditing(null); },
      onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیره دارایی انجام نشد"),
    });
  };

  const removeRow = (asset: NetworkAsset) => {
    if (!window.confirm(`دارایی «${asset.name}» حذف شود؟`)) return;
    remove.mutate(asset.id, {
      onSuccess: () => toast.success("دارایی حذف شد"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "حذف انجام نشد"),
    });
  };

  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">مدیریت دارایی‌های شبکه</CardTitle>
            <p className="mt-1 text-xs text-muted">سوئیچ، روتر، فایروال، رک و اتاق سرور با اطلاعات مستقل</p>
          </div>
          {canEdit ? <Button size="sm" onClick={() => setEditing(emptyAsset())}><Plus className="size-4" />دارایی جدید</Button> : null}
        </div>
        <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="جستجوی تجهیز، IP مدیریتی، مدل، سریال یا محل" />
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="mb-4 grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
            <Field label="نوع">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as AssetKind })}>
                {KINDS.map((kind) => <option key={kind} value={kind}>{assetKindLabel(kind)}</option>)}
              </select>
            </Field>
            <Field label="نام تجهیز *"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Site / محل سازمانی"><Input value={editing.site} onChange={(e) => setEditing({ ...editing, site: e.target.value })} /></Field>
            <Field label="ساختمان"><Input value={editing.building} onChange={(e) => setEditing({ ...editing, building: e.target.value })} /></Field>
            <Field label="محل / رک / اتاق"><Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></Field>
            <Field label="Vendor"><Input value={editing.vendor} onChange={(e) => setEditing({ ...editing, vendor: e.target.value })} /></Field>
            <Field label="Model"><Input value={editing.model} onChange={(e) => setEditing({ ...editing, model: e.target.value })} /></Field>
            <Field label="Serial Number"><Input value={editing.serialNumber} onChange={(e) => setEditing({ ...editing, serialNumber: e.target.value })} /></Field>
            <Field label="Management IP"><Input dir="ltr" value={editing.managementIp} onChange={(e) => setEditing({ ...editing, managementIp: e.target.value })} /></Field>
            <Field label="Interfaceها (با , جدا کنید)"><Input dir="ltr" value={editing.interfaces.join(", ")} onChange={(e) => setEditing({ ...editing, interfaces: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="وضعیت">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as NetworkAsset["status"] })}>
                <option value="active">فعال</option><option value="inactive">غیرفعال</option>
              </select>
            </Field>
            <Field label="توضیحات"><Input value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={save} disabled={upsert.isPending}><Save className="size-4" />ذخیره</Button>
              <Button variant="outline" onClick={() => setEditing(null)}><X className="size-4" />انصراف</Button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-surface-2 text-xs text-muted"><tr>
              <th className="px-3 py-2.5 text-start">نوع</th><th className="px-3 py-2.5 text-start">نام</th><th className="px-3 py-2.5 text-start">Vendor / Model</th><th className="px-3 py-2.5 text-start">Serial</th><th className="px-3 py-2.5 text-start">Management IP</th><th className="px-3 py-2.5 text-start">محل</th><th className="px-3 py-2.5 text-start">وضعیت</th><th className="px-3 py-2.5 text-start">عملیات</th>
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={8} className="px-3 py-8 text-center text-muted">در حال بارگذاری…</td></tr> : null}
              {!isLoading && rows.length === 0 ? <tr><td colSpan={8} className="px-3 py-8 text-center text-muted">دارایی مستقلی ثبت نشده است.</td></tr> : null}
              {rows.map((asset) => <tr key={asset.id} className="border-t border-border hover:bg-surface-2/60">
                <td className="px-3 py-2.5"><Badge>{assetKindLabel(asset.kind)}</Badge></td>
                <td className="px-3 py-2.5 font-medium">{asset.name}</td>
                <td className="px-3 py-2.5">{[asset.vendor, asset.model].filter(Boolean).join(" / ") || "—"}</td>
                <td className="px-3 py-2.5 font-mono">{asset.serialNumber || "—"}</td>
                <td className="px-3 py-2.5 font-mono" dir="ltr">{asset.managementIp || "—"}</td>
                <td className="px-3 py-2.5">{[asset.site, asset.building, asset.location].filter(Boolean).join(" / ") || "—"}</td>
                <td className="px-3 py-2.5"><Badge variant={asset.status === "active" ? "ok" : "danger"}>{asset.status === "active" ? "فعال" : "غیرفعال"}</Badge></td>
                <td className="px-3 py-2.5"><div className="flex gap-1">{canEdit ? <><Button variant="ghost" size="icon" className="size-8" title="ویرایش" onClick={() => setEditing(asset)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8" title="حذف" onClick={() => removeRow(asset)}><Trash2 className="size-4" /></Button></> : <span className="text-xs text-faint">فقط مشاهده</span>}</div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-xs text-muted"><span>{label}</span>{children}</label>;
}
