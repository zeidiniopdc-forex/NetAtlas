import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ACTION_LABEL } from "@/lib/inventory/fields";
import { useInventory } from "@/lib/inventory/query";

export const Route = createFileRoute("/firewall")({ component: FirewallPage });

function FirewallPage() {
  const { data } = useInventory();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const list =
      data?.records.flatMap((r) =>
        r.firewallAccess.map((f) => ({
          recId: r.id,
          user: r.userName,
          ip: r.ip,
          computer: r.computerName,
          vlan: r.vlan,
          ...f,
        })),
      ) ?? [];
    if (!q.trim()) return list;
    const n = q.toLowerCase();
    return list.filter((r) =>
      [r.user, r.ip, r.computer, r.vlan, r.service, r.destination, r.port, r.protocol]
        .join(" ")
        .toLowerCase()
        .includes(n),
    );
  }, [data, q]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">ماتریس دسترسی فایروال</h1>
          <p className="mt-1 text-sm text-muted">
            مشخص می‌شود هر IP متعلق به کدام کاربر است و به چه سرویس‌هایی اجازه یا منع دارد.
          </p>
        </div>
        <Input
          className="sm:max-w-80"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="فیلتر کاربر، IP یا سرویس"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-surface-2 text-xs text-muted">
            <tr>
              {["کاربر", "IP", "کامپیوتر", "VLAN", "سرویس", "پروتکل/پورت", "مقصد", "عمل"].map((h) => (
                <th key={h} className="px-3 py-3 text-start font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted">
                  دسترسی‌ای مطابق فیلتر نیست.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.recId}-${r.id}`} className="border-t border-border">
                  <td className="px-3 py-2.5">
                    <Link to="/inventory/$id" params={{ id: r.recId }} className="hover:text-accent">
                      {r.user || "—"}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-accent" dir="ltr">
                    {r.ip || "—"}
                  </td>
                  <td className="px-3 py-2.5">{r.computer || "—"}</td>
                  <td className="px-3 py-2.5">{r.vlan || "—"}</td>
                  <td className="px-3 py-2.5">{r.service}</td>
                  <td className="px-3 py-2.5 font-mono" dir="ltr">
                    {r.protocol}/{r.port || "*"}
                  </td>
                  <td className="px-3 py-2.5">{r.destination || "—"}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={r.action === "allow" ? "ok" : "danger"}>
                      {ACTION_LABEL[r.action]}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
