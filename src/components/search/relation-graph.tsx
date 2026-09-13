import { Link } from "@tanstack/react-router";
import { entityKindLabel } from "@/lib/inventory/relations";
import type { EntityKind, GraphEdge, GraphNode, InventoryRecord } from "@/lib/inventory/types";
import { cn } from "@/lib/utils";

const KIND_TONE: Record<EntityKind, string> = {
  floor: "bg-surface-2 text-muted",
  room: "bg-surface-2 text-muted",
  user: "bg-accent/15 text-accent",
  node: "bg-surface-2 text-fg",
  patch: "bg-surface-2 text-fg",
  port: "bg-surface-2 text-fg",
  switch: "bg-ok/15 text-ok",
  iface: "bg-ok/10 text-ok",
  cable: "bg-surface-2 text-muted",
  computer: "bg-warn/15 text-warn",
  windows: "bg-warn/10 text-warn",
  ip: "bg-accent/20 text-accent",
  vlan: "bg-ok/15 text-ok",
  network: "bg-ok/10 text-ok",
  firewall: "bg-danger/15 text-danger",
  status: "bg-surface-2 text-muted",
};

const ORDER: EntityKind[] = [
  "floor",
  "room",
  "user",
  "computer",
  "windows",
  "ip",
  "vlan",
  "network",
  "node",
  "patch",
  "port",
  "cable",
  "switch",
  "iface",
  "firewall",
];

export function RelationGraph({
  nodes,
  edges,
  onPick,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onPick?: (label: string) => void;
}) {
  if (!nodes.length) return null;
  const grouped = ORDER.map((kind) => ({
    kind,
    items: nodes.filter((n) => n.kind === kind),
  })).filter((g) => g.items.length);

  const width = 920;
  const colW = width / Math.max(grouped.length, 1);
  const height = Math.max(
    220,
    ...grouped.map((g) => 48 + g.items.length * 36),
  );

  const pos = new Map<string, { x: number; y: number }>();
  grouped.forEach((g, gi) => {
    g.items.forEach((n, ni) => {
      pos.set(n.id, { x: colW * gi + colW / 2, y: 40 + ni * 36 });
    });
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto min-w-[640px] w-full"
        role="img"
        aria-label="گراف ارتباطات"
      >
        {edges.map((e) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          const mid = (a.x + b.x) / 2;
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth="1.2"
            />
          );
        })}
        {grouped.map((g, gi) => (
          <text
            key={g.kind}
            x={colW * gi + colW / 2}
            y={16}
            textAnchor="middle"
            className="fill-faint"
            fontSize="11"
          >
            {entityKindLabel(g.kind)}
          </text>
        ))}
      </svg>
      <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map((g) => (
          <div key={g.kind}>
            <p className="mb-2 text-[11px] font-medium text-faint">{entityKindLabel(g.kind)}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onPick?.(n.label)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs",
                    KIND_TONE[n.kind],
                  )}
                >
                  <span dir={n.kind === "ip" || n.kind === "iface" ? "ltr" : undefined}>
                    {n.label}
                  </span>
                  {n.count > 1 ? (
                    <span className="ms-1 tabular-nums opacity-70">{n.count}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecordList({ records }: { records: InventoryRecord[] }) {
  if (!records.length) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
        موردی پیدا نشد. IP، نام کاربر، سوئیچ، پچ‌پنل، VLAN یا هر فیلد دیگری را جستجو کنید.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {records.map((r) => (
        <Link
          key={r.id}
          to="/inventory/$id"
          params={{ id: r.id }}
          className="grid gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 sm:grid-cols-[1fr_auto]"
        >
          <div>
            <p className="font-medium">
              {r.userName || "بدون کاربر"}
              <span className="ms-2 font-mono text-sm text-accent" dir="ltr">
                {r.ip || "—"}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted">
              طبقه {r.floor || "—"} · اتاق {r.room || "—"} · {r.computerName || "بدون کامپیوتر"} ·{" "}
              {r.switchName} {r.switchInterface}
            </p>
            {r.firewallAccess.length ? (
              <p className="mt-2 text-xs text-muted">
                فایروال: {r.firewallAccess.map((f) => f.service).join("، ")}
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              "h-fit self-start rounded-full px-2.5 py-1 text-xs",
              r.status === "active" ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger",
            )}
          >
            {r.status === "active" ? "فعال" : "غیرفعال"}
          </span>
        </Link>
      ))}
    </div>
  );
}
