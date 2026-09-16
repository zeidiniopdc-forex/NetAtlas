import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, GitBranch, Pencil, Plus, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NetworkAssetsPanel } from "@/components/network/network-assets-panel";
import { NetworkDataQualityPanel } from "@/components/network/network-data-quality-panel";
import { IpIssuesList } from "@/components/network/ip-issues-list";
import { NetworkPortPanel } from "@/components/network/network-port-panel";
import { NetworkVlanPanel } from "@/components/network/network-vlan-panel";
import { RecordForm } from "@/components/inventory/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FIELD_LABELS,
  STATUS_LABEL,
  TABLE_COLUMNS,
} from "@/lib/inventory/fields";
import { recordMatches } from "@/lib/inventory/relations";
import { useInventory, useInventoryMutations } from "@/lib/inventory/query";
import type { InventoryRecord } from "@/lib/inventory/types";
import { buildAssetRegistry, assetKindLabel } from "@/lib/network/assets";
import {
  buildVlanSummary,
  findIpIssues,
  summarizeIpam,
} from "@/lib/network/ipam";
import { cn } from "@/lib/utils";
import { useAccess } from "@/lib/access/session";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  const { data, isLoading, error, refetch } = useInventory();
  const { upsert, seed } = useInventoryMutations();
  const { canEdit } = useAccess();
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryRecord | null>(null);

  const records = data?.records ?? [];
  const ipam = useMemo(() => summarizeIpam(records), [records]);
  const ipIssues = useMemo(() => findIpIssues(records), [records]);
  const vlans = useMemo(() => buildVlanSummary(records), [records]);
  const assets = useMemo(() => buildAssetRegistry(records), [records]);

  const rows = useMemo(() => {
    if (!q.trim()) return records;
    return records.filter((r) => recordMatches(r, q));
  }, [records, q]);

  const colSpan = TABLE_COLUMNS.length + 2;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertTriangle className="size-8 text-danger" />
        <p className="text-sm font-medium">خواندن موجودی ممکن نشد</p>
        <p className="text-xs text-muted">
          {error instanceof Error ? error.message : "خطای ناشناخته"}
        </p>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">موجودی زیرساخت</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length.toLocaleString("fa-IR")} رکورد · همه فیلدهای اکسل به‌علاوه دسترسی فایروال
            {data?.storage?.path ? (
              <span className="text-faint"> · {data.storage.path}</span>
            ) : null}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <Input className="ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="فیلتر جدول" />
          </div>
          {canEdit ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              رکورد جدید
            </Button>
          ) : null}
        </div>
      </div>

      {!isLoading && records.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium">هنوز رکوردی در موجودی نیست</p>
            <p className="max-w-md text-xs text-muted">
              اگر روی IIS هستید و مسیر داده خالی است، داده نمونه را بارگذاری کنید یا از صفحه ورود اکسل import کنید.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {canEdit ? (
                <Button
                  disabled={seed.isPending}
                  onClick={() =>
                    seed.mutate(undefined, {
                      onSuccess: () => {
                        toast.success("داده نمونه بارگذاری شد");
                        void refetch();
                      },
                      onError: (e) =>
                        toast.error(e instanceof Error ? e.message : "بارگذاری نمونه ناموفق"),
                    })
                  }
                >
                  بارگذاری داده نمونه
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link to="/exchange">
                  <Upload className="size-4" />
                  ورود از اکسل
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">IPAM</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="IP ثبت‌شده" value={ipam.totalAssigned} />
            <Metric label="IP یکتا" value={ipam.uniqueAssigned} />
            <Metric label="تکراری" value={ipam.duplicates} danger={ipam.duplicates > 0} />
            <Metric label="نامعتبر" value={ipam.invalid} danger={ipam.invalid > 0} />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">VLAN</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">{vlans.length.toLocaleString("fa-IR")}</div>
            <p className="mt-1 text-xs text-muted">VLAN یکتا در موجودی فعلی</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vlans.slice(0, 8).map((v) => (
                <Badge key={v.key} variant="ok">{v.number || v.name} · {v.records}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">کیفیت داده</CardTitle></CardHeader>
          <CardContent>
            {ipIssues.length === 0 ? (
              <p className="text-sm text-ok">مشکل IP شناسایی نشد.</p>
            ) : (
              <div className="flex items-start gap-2 text-sm text-warn">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{ipIssues.length.toLocaleString("fa-IR")} مورد نیازمند بررسی IP</span>
              </div>
            )}
            <p className="mt-2 text-xs text-muted">کنترل اولیه برای IP تکراری و نامعتبر — جزئیات قابل‌کلیک در پایین</p>
          </CardContent>
        </Card>
      </div>

      <NetworkDataQualityPanel records={records} onEditRecord={setEditing} />
      <IpIssuesList records={records} onEditRecord={setEditing} />
      <NetworkVlanPanel records={records} />

      <Card className="rounded-xl">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-accent/15 p-2 text-accent"><GitBranch className="size-4" /></span>
            <div>
              <p className="text-sm font-medium">توپولوژی و ردیابی مسیر</p>
              <p className="mt-0.5 text-xs text-muted">صفحه مستقل با فیلتر سایت/ساختمان/وضعیت و Trace دوطرفه</p>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link to="/topology">باز کردن توپولوژی</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">دارایی‌های استخراج‌شده از موجودی</CardTitle>
          <p className="text-xs text-muted">نمایش نرمال‌شده تجهیزات و محل‌های زیرساختی از رکوردهای فعلی</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-5">
            {(["switch", "router", "firewall", "rack", "serverRoom"] as const).map((kind) => (
              <div key={kind} className="rounded-md border border-border p-3">
                <div className="text-xs text-muted">{assetKindLabel(kind)}</div>
                <div className="mt-1 text-xl font-semibold tabular-nums">{(assets.byKind[kind] ?? 0).toLocaleString("fa-IR")}</div>
              </div>
            ))}
          </div>
          {assets.duplicateManagementIps.length > 0 ? (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-border p-3 text-sm text-warn">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{assets.duplicateManagementIps.length.toLocaleString("fa-IR")} IP مدیریتی برای بیش از یک تجهیز ثبت شده است.</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <NetworkAssetsPanel />
      <NetworkPortPanel records={records} />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-surface-2 text-xs text-muted">
            <tr>
              {TABLE_COLUMNS.map((c) => (
                <th key={c} className="px-3 py-3 text-start font-medium">{FIELD_LABELS[c]}</th>
              ))}
              <th className="px-3 py-3 text-start font-medium">فایروال</th>
              <th className="px-3 py-3 text-start font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={colSpan} className="px-3 py-10 text-center text-muted">در حال بارگذاری…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={colSpan} className="px-3 py-10 text-center text-muted">رکوردی برای نمایش نیست.</td></tr>
            ) : (
              rows.map((r) => (
                <Row key={r.id} record={r} canEdit={canEdit} onEdit={() => setEditing(r)} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>رکورد جدید</DialogTitle></DialogHeader>
          <RecordForm
            busy={upsert.isPending}
            onCancel={() => setCreateOpen(false)}
            onSubmit={(record) => {
              upsert.mutate(record, {
                onSuccess: () => {
                  toast.success("روی فایل JSON سرور ذخیره شد");
                  setCreateOpen(false);
                },
                onError: () => toast.error("ذخیره انجام نشد"),
              });
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>ویرایش رکورد</DialogTitle></DialogHeader>
          {editing ? (
            <RecordForm
              key={editing.id}
              initial={editing}
              busy={upsert.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(record) => {
                upsert.mutate(record, {
                  onSuccess: () => {
                    toast.success("تغییرات روی JSON سرور ذخیره شد");
                    setEditing(null);
                  },
                  onError: () => toast.error("ذخیره انجام نشد"),
                });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div>
      <div className={cn("text-xl font-semibold tabular-nums", danger ? "text-danger" : undefined)}>
        {value.toLocaleString("fa-IR")}
      </div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Row({ record, onEdit, canEdit }: { record: InventoryRecord; onEdit: () => void; canEdit: boolean }) {
  const firewallAccess = Array.isArray(record.firewallAccess) ? record.firewallAccess : [];
  const status = record.status === "inactive" ? "inactive" : ("active" as const);
  return (
    <tr className="border-t border-border hover:bg-surface-2/60">
      {TABLE_COLUMNS.map((c) => (
        <td key={c} className="px-3 py-2.5">
          {c === "status" ? (
            <Badge variant={status === "active" ? "ok" : "danger"}>{STATUS_LABEL[status]}</Badge>
          ) : (
            <Link
              to="/inventory/$id"
              params={{ id: record.id }}
              className={cn("hover:text-accent", c === "ip" || c === "switchInterface" ? "font-mono" : undefined)}
              dir={c === "ip" || c === "switchInterface" ? "ltr" : undefined}
            >
              {String(record[c] ?? "—") || "—"}
            </Link>
          )}
        </td>
      ))}
      <td className="px-3 py-2.5 text-xs text-muted">
        {firewallAccess.length ? firewallAccess.map((f) => f?.service || "—").join("، ") : "—"}
      </td>
      <td className="px-3 py-2.5">
        {canEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onEdit} aria-label="ویرایش" title="ویرایش">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <span className="text-xs text-faint">—</span>
        )}
      </td>
    </tr>
  );
}
