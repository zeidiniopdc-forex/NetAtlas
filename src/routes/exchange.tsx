import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadWorkbook, parseWorkbook } from "@/lib/inventory/excel";
import { FIELD_LABELS } from "@/lib/inventory/fields";
import { useInventory, useInventoryMutations } from "@/lib/inventory/query";
import type { InventoryRecord } from "@/lib/inventory/types";
import { faDate } from "@/lib/utils";

export const Route = createFileRoute("/exchange")({ component: ExchangePage });

function ExchangePage() {
  const { data } = useInventory();
  const { ingest, seed } = useInventoryMutations();
  const [preview, setPreview] = useState<InventoryRecord[] | null>(null);
  const [fileName, setFileName] = useState("");

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
        <h1 className="text-2xl font-medium tracking-tight">ورود و خروجی اکسل</h1>
        <p className="mt-1 text-sm text-muted">
          فایل اکسل موجود را وارد کنید، روی سرور در JSON ذخیره شود، و هر زمان خروجی اکسل بگیرید.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>ورود از Excel</CardTitle>
            <CardDescription>
              سرستون‌های فارسی با و بدون شماره‌گذاری پشتیبانی می‌شوند. ستون «دسترسی‌های فایروال» اختیاری است.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted hover:border-accent/50 hover:text-fg">
              <Upload className="size-6 text-accent" />
              انتخاب فایل xlsx یا xls
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
            </label>
            {preview ? (
              <div className="rounded-md bg-surface-2 p-3 text-sm">
                <p>
                  {fileName} — {preview.length.toLocaleString("fa-IR")} ردیف آماده ورود
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => runImport("merge")} disabled={ingest.isPending}>
                    ادغام با داده فعلی
                  </Button>
                  <Button variant="secondary" onClick={() => runImport("replace")} disabled={ingest.isPending}>
                    جایگزینی کامل
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>خروجی Excel و JSON</CardTitle>
            <CardDescription>
              آخرین ذخیره: {faDate(data?.updatedAt)}
              {data?.storage.path ? ` · مسیر: ${data.storage.path}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="secondary"
              onClick={() => downloadWorkbook(data?.records ?? [], "netatlas-inventory.xlsx")}
            >
              <FileSpreadsheet className="size-4" />
              دانلود Excel
            </Button>
            <Button
              variant="outline"
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
            <Button
              variant="ghost"
              onClick={() => {
                if (!confirm("داده‌ها به نمونه اولیه برگردد؟")) return;
                seed.mutate(undefined, { onSuccess: () => toast.success("داده نمونه بارگذاری شد") });
              }}
            >
              بارگذاری داده نمونه
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>فیلدهای پشتیبانی‌شده</CardTitle>
          <CardDescription>همان ساختار فایل اکسل شما به‌علاوه ستون دسترسی فایروال</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.values(FIELD_LABELS).map((label) => (
            <span key={label} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
              {label}
            </span>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>استقرار روی IIS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted">
          <p>
            برنامه با Node روی ویندوز سرور اجرا می‌شود. فایل <span className="font-mono text-fg" dir="ltr">iis/web.config</span> را
            کنار خروجی سرور بگذارید و ماژول HttpPlatformHandler را روی IIS نصب کنید. متغیر{" "}
            <span className="font-mono text-fg" dir="ltr">INVENTORY_DATA_DIR</span> را روی پوشه قابل‌نوشتن مثل{" "}
            <span className="font-mono text-fg" dir="ltr">D:\NetAtlas\data</span> تنظیم کنید تا{" "}
            <span className="font-mono text-fg" dir="ltr">inventory.json</span> بین کاربران شبکه مشترک بماند.
          </p>
          <p>
            برای همزمانی چند کاربر، ذخیره JSON پشت قفل صف و نوشتن اتمی (فایل موقت سپس rename) انجام می‌شود.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
