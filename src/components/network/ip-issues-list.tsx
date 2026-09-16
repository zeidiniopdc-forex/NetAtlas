import { Link } from "@tanstack/react-router";
import { AlertTriangle, Pencil } from "lucide-react";
import { useMemo } from "react";
import type { InventoryRecord } from "@/lib/inventory/types";
import { findIpIssues } from "@/lib/network/ipam";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function IpIssuesList({
  records,
  onEditRecord,
}: {
  records: InventoryRecord[];
  onEditRecord?: (record: InventoryRecord) => void;
}) {
  const issues = useMemo(() => findIpIssues(records), [records]);
  const byId = useMemo(() => {
    const map = new Map<string, InventoryRecord>();
    for (const r of records) map.set(r.id, r);
    return map;
  }, [records]);

  if (issues.length === 0) return null;

  return (
    <Card className="rounded-xl border-warn/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-warn">
          <AlertTriangle className="size-4" />
          مشکلات IP — برای اصلاح کلیک کنید
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {issues.slice(0, 15).map((issue) => (
          <div
            key={`${issue.status}:${issue.ip}`}
            className="rounded-md border border-border p-2.5"
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant={issue.status === "invalid" ? "danger" : "outline"}>
                {issue.status === "invalid" ? "نامعتبر" : "تکراری"}
              </Badge>
              <span className="font-mono text-fg" dir="ltr">
                {issue.ip}
              </span>
              <span className="text-muted">
                {issue.recordIds.length.toLocaleString("fa-IR")} رکورد
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {issue.recordIds.map((id) => {
                const rec = byId.get(id);
                const label =
                  rec?.userName || rec?.computerName || id.slice(0, 8);
                if (onEditRecord && rec) {
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onEditRecord(rec)}
                      className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 py-1.5 text-start text-xs hover:bg-accent/10"
                    >
                      <span>
                        {label}
                        {rec.switchName ? (
                          <span className="ms-2 text-muted">{rec.switchName}</span>
                        ) : null}
                      </span>
                      <span className="inline-flex items-center gap-1 text-accent">
                        <Pencil className="size-3" />
                        ویرایش
                      </span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={id}
                    to="/inventory/$id"
                    params={{ id }}
                    search={{ edit: true }}
                    className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 py-1.5 text-xs hover:bg-accent/10"
                  >
                    <span>
                      {label}
                      {rec?.switchName ? (
                        <span className="ms-2 text-muted">{rec.switchName}</span>
                      ) : null}
                    </span>
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Pencil className="size-3" />
                      ویرایش
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {issues.length > 15 ? (
          <p className="text-xs text-muted">
            {(issues.length - 15).toLocaleString("fa-IR")} مورد دیگر…
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
