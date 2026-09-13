import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RecordForm } from "@/components/inventory/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FIELD_LABELS, STATUS_LABEL, TABLE_COLUMNS } from "@/lib/inventory/fields";
import { recordMatches } from "@/lib/inventory/relations";
import { useInventory, useInventoryMutations } from "@/lib/inventory/query";
import type { InventoryRecord } from "@/lib/inventory/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  const { data, isLoading } = useInventory();
  const { upsert } = useInventoryMutations();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const list = data?.records ?? [];
    if (!q.trim()) return list;
    return list.filter((r) => recordMatches(r, q));
  }, [data, q]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">موجودی زیرساخت</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length.toLocaleString("fa-IR")} رکورد · همه فیلدهای اکسل به‌علاوه دسترسی فایروال
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <Input className="ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="فیلتر جدول" />
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            رکورد جدید
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-surface-2 text-xs text-muted">
            <tr>
              {TABLE_COLUMNS.map((c) => (
                <th key={c} className="px-3 py-3 text-start font-medium">
                  {FIELD_LABELS[c]}
                </th>
              ))}
              <th className="px-3 py-3 text-start font-medium">فایروال</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 1} className="px-3 py-10 text-center text-muted">
                  در حال بارگذاری…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 1} className="px-3 py-10 text-center text-muted">
                  رکوردی نیست. از ورود اکسل استفاده کنید یا رکورد جدید بسازید.
                </td>
              </tr>
            ) : (
              rows.map((r) => <Row key={r.id} record={r} />)
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رکورد جدید</DialogTitle>
          </DialogHeader>
          <RecordForm
            busy={upsert.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={(record) => {
              upsert.mutate(record, {
                onSuccess: () => {
                  toast.success("روی فایل JSON سرور ذخیره شد");
                  setOpen(false);
                },
                onError: () => toast.error("ذخیره انجام نشد"),
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ record }: { record: InventoryRecord }) {
  return (
    <tr className="border-t border-border hover:bg-surface-2/60">
      {TABLE_COLUMNS.map((c) => (
        <td key={c} className="px-3 py-2.5">
          {c === "status" ? (
            <Badge variant={record.status === "active" ? "ok" : "danger"}>
              {STATUS_LABEL[record.status]}
            </Badge>
          ) : (
            <Link
              to="/inventory/$id"
              params={{ id: record.id }}
              className={cn(
                "hover:text-accent",
                c === "ip" || c === "switchInterface" ? "font-mono" : undefined,
              )}
              dir={c === "ip" || c === "switchInterface" ? "ltr" : undefined}
            >
              {String(record[c] || "—")}
            </Link>
          )}
        </td>
      ))}
      <td className="px-3 py-2.5 text-xs text-muted">
        {record.firewallAccess.length
          ? record.firewallAccess.map((f) => f.service).join("، ")
          : "—"}
      </td>
    </tr>
  );
}
