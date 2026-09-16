import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Pencil,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { InventoryRecord } from "@/lib/inventory/types";
import {
  analyzeDataQuality,
  summarizeDataQuality,
  type QualityFinding,
} from "@/lib/network/data-quality";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const severityLabel = { error: "خطا", warning: "هشدار", info: "اطلاعات" } as const;
const categoryLabel = {
  completeness: "کامل‌بودن",
  duplicate: "تکراری",
  consistency: "سازگاری",
  format: "قالب",
  path: "مسیر شبکه",
} as const;

function SeverityIcon({ severity }: { severity: QualityFinding["severity"] }) {
  if (severity === "error") return <XCircle className="size-4 text-danger" />;
  if (severity === "warning") return <AlertTriangle className="size-4 text-warn" />;
  return <Info className="size-4 text-muted" />;
}

function recordLabel(record?: InventoryRecord) {
  if (!record) return "رکورد حذف‌شده";
  return (
    record.userName ||
    record.computerName ||
    record.ip ||
    record.nodeNumber ||
    record.id.slice(0, 8)
  );
}

export function NetworkDataQualityPanel({
  records,
}: {
  records: InventoryRecord[];
}) {
  const findings = useMemo(() => analyzeDataQuality(records), [records]);
  const summary = useMemo(
    () => summarizeDataQuality(records, findings),
    [records, findings],
  );
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">(
    "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const byId = useMemo(() => {
    const map = new Map<string, InventoryRecord>();
    for (const r of records) map.set(r.id, r);
    return map;
  }, [records]);

  const filtered = useMemo(() => {
    if (filter === "all") return findings;
    return findings.filter((f) => f.severity === filter);
  }, [findings, filter]);

  const visible = filtered.slice(0, limit);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">موتور کیفیت داده شبکه</CardTitle>
            <p className="mt-1 text-xs text-muted">
              روی هر خطا/هشدار کلیک کنید تا رکوردهای درگیر را ببینید و مستقیم ویرایش
              کنید
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2",
              summary.score >= 90
                ? "border-ok/30"
                : summary.score >= 70
                  ? "border-warn/30"
                  : "border-danger/30",
            )}
          >
            {summary.score >= 90 ? (
              <CheckCircle2 className="size-4 text-ok" />
            ) : (
              <AlertTriangle className="size-4 text-warn" />
            )}
            <span className="text-xs text-muted">امتیاز</span>
            <span className="text-xl font-semibold tabular-nums">
              {summary.score.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilter(filter === "error" ? "all" : "error")}
            className={cn(
              "rounded-md border p-3 text-start transition",
              filter === "error"
                ? "border-danger/40 bg-danger/5"
                : "border-border hover:bg-surface-2",
            )}
          >
            <Metric label="خطا" value={summary.errors} danger={summary.errors > 0} />
          </button>
          <button
            type="button"
            onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
            className={cn(
              "rounded-md border p-3 text-start transition",
              filter === "warning"
                ? "border-warn/40 bg-warn/5"
                : "border-border hover:bg-surface-2",
            )}
          >
            <Metric
              label="هشدار"
              value={summary.warnings}
              warning={summary.warnings > 0}
            />
          </button>
          <div className="rounded-md border border-border p-3">
            <Metric label="رکوردهای درگیر" value={summary.affectedRecords} />
          </div>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-md border p-3 text-start transition",
              filter === "all"
                ? "border-accent/40 bg-accent/5"
                : "border-border hover:bg-surface-2",
            )}
          >
            <Metric label="کل یافته‌ها" value={summary.totalFindings} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(summary.byCategory) as [keyof typeof categoryLabel, number][]).map(
            ([category, count]) => (
              <Badge key={category} variant={count ? "default" : "outline"}>
                {categoryLabel[category]} · {count.toLocaleString("fa-IR")}
              </Badge>
            ),
          )}
        </div>

        {visible.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-ok/30 p-4 text-sm text-ok">
            <CheckCircle2 className="size-4" />
            {filter === "all"
              ? "مشکل قابل‌توجهی در داده‌های موجود شناسایی نشد."
              : "موردی در این فیلتر نیست."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-surface-2 text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 text-start">وضعیت</th>
                  <th className="px-3 py-2 text-start">دسته</th>
                  <th className="px-3 py-2 text-start">مشکل</th>
                  <th className="px-3 py-2 text-start">شرح</th>
                  <th className="px-3 py-2 text-start">رکوردها</th>
                  <th className="px-3 py-2 text-end">اقدام</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((finding) => {
                  const open = expandedId === finding.id;
                  const firstId = finding.recordIds[0];
                  return (
                    <>
                      <tr
                        key={finding.id}
                        className={cn(
                          "border-t border-border cursor-pointer transition",
                          open ? "bg-accent/5" : "hover:bg-surface-2/60",
                        )}
                        onClick={() =>
                          setExpandedId(open ? null : finding.id)
                        }
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <SeverityIcon severity={finding.severity} />
                            <span>{severityLabel[finding.severity]}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">
                          {categoryLabel[finding.category]}
                        </td>
                        <td className="px-3 py-2 font-medium">{finding.title}</td>
                        <td className="px-3 py-2 text-xs text-muted">
                          {finding.detail}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                          {finding.recordIds.length.toLocaleString("fa-IR")}
                        </td>
                        <td className="px-3 py-2 text-end">
                          <div
                            className="inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {firstId ? (
                              <Button asChild variant="ghost" size="sm">
                                <Link
                                  to="/inventory/$id"
                                  params={{ id: firstId }}
                                  search={{ edit: true }}
                                >
                                  <Pencil className="size-3.5" />
                                  ویرایش
                                </Link>
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() =>
                                setExpandedId(open ? null : finding.id)
                              }
                              aria-label={open ? "بستن" : "باز کردن"}
                            >
                              {open ? (
                                <ChevronUp className="size-4" />
                              ) : (
                                <ChevronDown className="size-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {open ? (
                        <tr key={`${finding.id}-detail`} className="border-t border-border bg-surface-2/40">
                          <td colSpan={6} className="px-3 py-3">
                            <p className="mb-2 text-xs text-muted">
                              رکوردهای درگیر — برای اصلاح روی هر مورد کلیک کنید:
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {finding.recordIds.map((id) => {
                                const rec = byId.get(id);
                                return (
                                  <Link
                                    key={id}
                                    to="/inventory/$id"
                                    params={{ id }}
                                    search={{ edit: true }}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs transition hover:border-accent/40 hover:bg-accent/5"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-medium text-fg">
                                        {recordLabel(rec)}
                                      </span>
                                      {rec?.ip ? (
                                        <span className="font-mono text-accent" dir="ltr">
                                          {rec.ip}
                                        </span>
                                      ) : null}
                                      {rec?.switchName ? (
                                        <span className="text-muted">
                                          {rec.switchName}
                                          {rec.switchInterface
                                            ? ` / ${rec.switchInterface}`
                                            : ""}
                                        </span>
                                      ) : null}
                                      {rec?.vlan ? (
                                        <Badge variant="outline">{rec.vlan}</Badge>
                                      ) : null}
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-accent">
                                      <Pencil className="size-3.5" />
                                      ویرایش
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > visible.length ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted">
              {(filtered.length - visible.length).toLocaleString("fa-IR")} یافته دیگر
            </p>
            <Button variant="secondary" size="sm" onClick={() => setLimit((n) => n + 20)}>
              نمایش بیشتر
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  danger,
  warning,
}: {
  label: string;
  value: number;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "text-xl font-semibold tabular-nums",
          danger && "text-danger",
          warning && "text-warn",
        )}
      >
        {value.toLocaleString("fa-IR")}
      </div>
      <p className="text-xs text-muted">{label}</p>
    </>
  );
}
