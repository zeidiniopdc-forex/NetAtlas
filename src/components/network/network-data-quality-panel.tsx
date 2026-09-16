import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useMemo } from "react";
import type { InventoryRecord } from "@/lib/inventory/types";
import { analyzeDataQuality, summarizeDataQuality, type QualityFinding } from "@/lib/network/data-quality";
import { Badge } from "@/components/ui/badge";
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

export function NetworkDataQualityPanel({ records }: { records: InventoryRecord[] }) {
  const findings = useMemo(() => analyzeDataQuality(records), [records]);
  const summary = useMemo(() => summarizeDataQuality(records, findings), [records, findings]);
  const topFindings = findings.slice(0, 12);

  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">موتور کیفیت داده شبکه</CardTitle>
            <p className="mt-1 text-xs text-muted">کنترل کامل‌بودن، تکراری‌ها، قالب IP/VLAN و پیوستگی مسیر Wall Node تا Switch/Router</p>
          </div>
          <div className={cn("flex items-center gap-2 rounded-md border px-3 py-2", summary.score >= 90 ? "border-ok/30" : summary.score >= 70 ? "border-warn/30" : "border-danger/30")}>
            {summary.score >= 90 ? <CheckCircle2 className="size-4 text-ok" /> : <AlertTriangle className="size-4 text-warn" />}
            <span className="text-xs text-muted">امتیاز</span>
            <span className="text-xl font-semibold tabular-nums">{summary.score.toLocaleString("fa-IR")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <Metric label="خطا" value={summary.errors} danger={summary.errors > 0} />
          <Metric label="هشدار" value={summary.warnings} warning={summary.warnings > 0} />
          <Metric label="رکوردهای درگیر" value={summary.affectedRecords} />
          <Metric label="کل یافته‌ها" value={summary.totalFindings} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(summary.byCategory) as [keyof typeof categoryLabel, number][]).map(([category, count]) => (
            <Badge key={category} variant={count ? "default" : "outline"}>{categoryLabel[category]} · {count.toLocaleString("fa-IR")}</Badge>
          ))}
        </div>

        {topFindings.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-ok/30 p-4 text-sm text-ok"><CheckCircle2 className="size-4" />مشکل قابل‌توجهی در داده‌های موجود شناسایی نشد.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface-2 text-xs text-muted"><tr><th className="px-3 py-2 text-start">وضعیت</th><th className="px-3 py-2 text-start">دسته</th><th className="px-3 py-2 text-start">مشکل</th><th className="px-3 py-2 text-start">شرح</th><th className="px-3 py-2 text-start">رکورد</th></tr></thead>
              <tbody>{topFindings.map((finding) => (
                <tr key={finding.id} className="border-t border-border">
                  <td className="px-3 py-2"><div className="flex items-center gap-1.5"><SeverityIcon severity={finding.severity} /><span>{severityLabel[finding.severity]}</span></div></td>
                  <td className="px-3 py-2 text-xs text-muted">{categoryLabel[finding.category]}</td>
                  <td className="px-3 py-2 font-medium">{finding.title}</td>
                  <td className="px-3 py-2 text-xs text-muted">{finding.detail}</td>
                  <td className="px-3 py-2 font-mono text-xs" dir="ltr">{finding.recordIds.length.toLocaleString("fa-IR")}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {findings.length > topFindings.length ? <p className="text-xs text-muted">{(findings.length - topFindings.length).toLocaleString("fa-IR")} یافته دیگر نیز وجود دارد؛ جدول برای حفظ سرعت رابط کاربری به ۱۲ مورد اول محدود شده است.</p> : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, danger, warning }: { label: string; value: number; danger?: boolean; warning?: boolean }) {
  return <div className="rounded-md border border-border p-3"><div className={cn("text-xl font-semibold tabular-nums", danger && "text-danger", warning && "text-warn")}>{value.toLocaleString("fa-IR")}</div><p className="text-xs text-muted">{label}</p></div>;
}
