import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadWorkbook, parseWorkbook } from "@/lib/inventory/excel";
import { FIELD_LABELS } from "@/lib/inventory/fields";
import { useInventory, useInventoryMutations } from "@/lib/inventory/query";
import { importInventoryJson } from "@/lib/access/actions";
import { useAccess } from "@/lib/access/session";
import type { InventoryRecord } from "@/lib/inventory/types";
import { faDate } from "@/lib/utils";

export const Route = createFileRoute("/exchange")({ component: ExchangePage });

function ExchangePage() {
  const { data } = useInventory();
  const { ingest, seed } = useInventoryMutations();
  const { canEdit } = useAccess();
  const [preview, setPreview] = useState<InventoryRecord[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [jsonPreview, setJsonPreview] = useState<string | null>(null);
  const [jsonName, setJsonName] = useState("");

  const jsonImport = useMutation({
    mutationFn: (payload: { jsonText: string; mode: "merge" | "replace" }) =>
      importInventoryJson({ data: payload }),
    onSuccess: (res) => {
      toast.success(`JSON بارگذاری شد — ${res.count.toLocaleString("fa-IR")} رکورد`);
      setJsonPreview(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "بارگذاری JSON ناموفق"),
  });

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    const rows = parseWorkbook(buf);
    setPreview(rows);
    setFileName(file.name);
    toast.message(`${rows.length.toLocaleString("fa-IR")} ردیف خوانده شد`);
  };

  const runImport = (mode: "merge" | "replace") => {
    if (!preview) return;
    ingest.mutate(
      { records: preview, mode },
      {
        onSuccess: (res) => {
          toast.success(
            mode === "replace"
              ? `جایگزین شد — ${res.count.toLocaleString("fa-IR")} رکورد در JSON`
              : `ادغام شد — ${res.count.toLocaleString("fa-IR")} رکورد در JSON`,
          );
          setPreview(null);
        },
        onError: () => toast.error("ورود اطلاعات انجام نشد"),
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">ورود و خروجی</h1>
        <p className="mt-1 text-sm text-muted">
          Excel و JSON پشتیبان — دانلود و بارگذاری روی سرور
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>ورود از Excel</CardTitle>
            <CardDescription>سرستون‌های فارسی پشتیبانی می‌شوند.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center hover:border-accent/50">
              <FileSpreadsheet className="size-8 text-accent" />
              <span className="text-sm">انتخاب فایل Excel</span>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
            </label>
            {preview ? (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted">{fileName} — {preview.length.toLocaleString("fa-IR")} ردیف</span>
                {canEdit ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => runImport("merge")} disabled={ingest.isPending}>ادغام</Button>
                    <Button size="sm" onClick={() => runImport("replace")} disabled={ingest.isPending}>جایگزینی</Button>
                  </>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>خروجی و پشتیبان JSON</CardTitle>
            <CardDescription>آخرین بروزرسانی: {faDate(data?.updatedAt)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="secondary" onClick={() => downloadWorkbook(data?.records ?? [], "netatlas-inventory.xlsx")}>
              <Download className="size-4" />
              دانلود Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify({ version: 1, updatedAt: data?.updatedAt, records: data?.records ?? [] }, null, 2)],
                  { type: "application/json" },
                );
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "inventory.json";
                a.click();
              }}
            >
              <Download className="size-4" />
              دانلود JSON پشتیبان
            </Button>
            {canEdit ? (
              <div className="mt-2 space-y-3 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">بارگذاری JSON پشتیبان</p>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="block w-full text-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const t = await file.text();
                    setJsonPreview(t);
                    setJsonName(file.name);
                    toast.message("فایل JSON خوانده شد");
                  }}
                />
                {jsonPreview ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted">{jsonName}</span>
                    <Button size="sm" variant="secondary" disabled={jsonImport.isPending} onClick={() => jsonImport.mutate({ jsonText: jsonPreview, mode: "merge" })}>
                      ادغام با داده فعلی
                    </Button>
                    <Button size="sm" disabled={jsonImport.isPending} onClick={() => { if (!confirm("جایگزینی کامل؟")) return; jsonImport.mutate({ jsonText: jsonPreview, mode: "replace" }); }}>
                      جایگزینی کامل
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted">بارگذاری فقط برای کاربران دارای مجوز ویرایش.</p>
            )}
            {canEdit ? (
              <Button variant="ghost" onClick={() => { if (!confirm("داده‌ها به نمونه اولیه برگردد؟")) return; seed.mutate(undefined, { onSuccess: () => toast.success("داده نمونه بارگذاری شد") }); }}>
                بارگذاری داده نمونه
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>فیلدهای پشتیبانی‌شده</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.values(FIELD_LABELS).map((label) => (
            <span key={label} className="rounded-full bg-surface-2 px-3 py-1 text-sm">{label}</span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
