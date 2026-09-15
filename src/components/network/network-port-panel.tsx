import { AlertTriangle, Cable, Network } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPortLinks, findPortIssues } from "@/lib/network/ports";
import type { InventoryRecord } from "@/lib/inventory/types";

export function NetworkPortPanel({ records }: { records: InventoryRecord[] }) {
  const ports = useMemo(() => buildPortLinks(records), [records]);
  const issues = useMemo(() => findPortIssues(ports), [ports]);
  const active = ports.filter((p) => p.status === "active").length;

  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm"><Network className="size-4" />ارتباط پورت و مسیر شبکه</CardTitle>
        <p className="text-xs text-muted">نمایش مسیر ثبت‌شده از نود و Patch Panel تا Switch Port و در صورت وجود Router</p>
      </CardHeader>
      <CardContent>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <Metric label="پورت/مسیر ثبت‌شده" value={ports.length} />
          <Metric label="فعال" value={active} />
          <Metric label="تعارض پورت" value={issues.length} danger={issues.length > 0} />
        </div>
        {issues.length > 0 ? <div className="mb-3 flex gap-2 rounded-md border border-border p-3 text-sm text-warn"><AlertTriangle className="size-4 shrink-0" />{issues.length.toLocaleString("fa-IR")} پورت سوئیچ در بیش از یک رکورد ثبت شده است.</div> : null}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[1100px] text-xs">
            <thead className="bg-surface-2 text-muted"><tr>
              <th className="px-3 py-2 text-start">Node</th><th className="px-3 py-2 text-start">Patch</th><th className="px-3 py-2 text-start">Cable</th><th className="px-3 py-2 text-start">Switch / Port</th><th className="px-3 py-2 text-start">VLAN</th><th className="px-3 py-2 text-start">IP / Computer</th><th className="px-3 py-2 text-start">Router</th>
            </tr></thead>
            <tbody>{ports.slice(0, 30).map((p) => <tr key={p.id} className="border-t border-border">
              <td className="px-3 py-2">{p.wallNode || "—"}</td><td className="px-3 py-2">{[p.patchPanel, p.patchPort].filter(Boolean).join(" / ") || "—"}</td><td className="px-3 py-2">{p.cableNumber || "—"}</td>
              <td className="px-3 py-2 font-mono" dir="ltr">{[p.switchName, p.switchInterface].filter(Boolean).join(" / ") || "—"}</td><td className="px-3 py-2"><Badge>{p.vlan || "—"}</Badge></td>
              <td className="px-3 py-2" dir="ltr">{[p.ip, p.computerName].filter(Boolean).join(" / ") || "—"}</td><td className="px-3 py-2">{[p.routerName, p.routerInterface].filter(Boolean).join(" / ") || "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {ports.length > 30 ? <p className="mt-2 text-xs text-muted">۳۰ مسیر اول نمایش داده شده است؛ جستجوی کامل در موجودی قابل انجام است.</p> : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return <div><div className={`text-xl font-semibold tabular-nums ${danger ? "text-danger" : ""}`}>{value.toLocaleString("fa-IR")}</div><div className="text-xs text-muted">{label}</div></div>;
}
