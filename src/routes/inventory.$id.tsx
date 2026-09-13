import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ConfigSnippet,
  FirewallPanel,
  PathTrace,
  RecordFacts,
} from "@/components/inventory/path-trace";
import { RecordForm } from "@/components/inventory/record-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STATUS_LABEL } from "@/lib/inventory/fields";
import { useInventory, useInventoryMutations } from "@/lib/inventory/query";

export const Route = createFileRoute("/inventory/$id")({ component: RecordPage });

function RecordPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useInventory();
  const { upsert, remove } = useInventoryMutations();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const record = data?.records.find((r) => r.id === id);

  if (isLoading) return <p className="text-sm text-muted">در حال بارگذاری…</p>;
  if (!record) {
    return (
      <div className="text-sm text-muted">
        رکورد پیدا نشد. <Link to="/inventory">بازگشت به موجودی</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/inventory" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
            <ArrowRight className="size-4" />
            موجودی
          </Link>
          <h1 className="mt-2 text-2xl font-medium tracking-tight">
            {record.userName || record.computerName || "رکورد"}
          </h1>
          <p className="mt-1 font-mono text-accent" dir="ltr">
            {record.ip || "بدون IP"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={record.status === "active" ? "ok" : "danger"}>
              {STATUS_LABEL[record.status]}
            </Badge>
            {record.vlan ? <Badge variant="accent">{record.vlan}</Badge> : null}
            {record.switchName ? <Badge>{record.switchName}</Badge> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEdit(true)}>
            <Pencil className="size-4" />
            ویرایش
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!confirm("این رکورد از فایل JSON سرور حذف شود؟")) return;
              remove.mutate(record.id, {
                onSuccess: () => {
                  toast.success("حذف شد");
                  void navigate({ to: "/inventory" });
                },
              });
            }}
          >
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>مسیر ارتباطات</CardTitle>
          </CardHeader>
          <CardContent>
            <PathTrace record={record} />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>جزئیات</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordFacts record={record} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            دسترسی فایروال برای {record.ip || "این نود"} — کاربر {record.userName || "نامشخص"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FirewallPanel record={record} />
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>کانفیگ پیشنهادی پورت سوئیچ</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigSnippet record={record} />
        </CardContent>
      </Card>

      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش رکورد</DialogTitle>
          </DialogHeader>
          <RecordForm
            initial={record}
            busy={upsert.isPending}
            onCancel={() => setEdit(false)}
            onSubmit={(next) => {
              upsert.mutate(next, {
                onSuccess: () => {
                  toast.success("تغییرات روی JSON سرور ذخیره شد");
                  setEdit(false);
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
