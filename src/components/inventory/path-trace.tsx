import { buildTrace, generateSwitchportConfig } from "@/lib/inventory/relations";
import type { InventoryRecord } from "@/lib/inventory/types";
import { ACTION_LABEL, FIELD_LABELS, STATUS_LABEL } from "@/lib/inventory/fields";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function PathTrace({ record }: { record: InventoryRecord }) {
  const steps = buildTrace(record);
  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <li key={`${step.kind}-${step.label}`} className="flex gap-3">
          <div className="flex w-6 flex-col items-center">
            <span className="mt-1 size-2.5 rounded-full bg-accent" />
            {i < steps.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
          </div>
          <div className="pb-4">
            <p className="text-[11px] text-faint">{step.hint || step.kind}</p>
            <p
              className="text-sm text-fg"
              dir={step.kind === "ip" || step.kind === "iface" || step.kind === "windows" ? "ltr" : undefined}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RecordFacts({ record }: { record: InventoryRecord }) {
  const pairs: [string, string][] = [
    [FIELD_LABELS.floor, record.floor],
    [FIELD_LABELS.room, record.room],
    [FIELD_LABELS.userName, record.userName],
    [FIELD_LABELS.nodeRow, record.nodeRow],
    [FIELD_LABELS.nodeNumber, record.nodeNumber],
    [FIELD_LABELS.patchPanel, record.patchPanel],
    [FIELD_LABELS.patchPort, record.patchPort],
    [FIELD_LABELS.patchRackPosition, record.patchRackPosition],
    [FIELD_LABELS.switchName, record.switchName],
    [FIELD_LABELS.switchInterface, record.switchInterface],
    [FIELD_LABELS.cableNumber, record.cableNumber],
    [FIELD_LABELS.computerName, record.computerName],
    [FIELD_LABELS.windowsUsername, record.windowsUsername],
    [FIELD_LABELS.ip, record.ip],
    [FIELD_LABELS.vlan, record.vlan],
    [FIELD_LABELS.network, record.network],
    [FIELD_LABELS.status, STATUS_LABEL[record.status]],
    [FIELD_LABELS.notes, record.notes],
  ];
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {pairs.map(([k, v]) => (
        <div key={k} className="rounded-md bg-surface-2 px-3 py-2">
          <dt className="text-[11px] text-faint">{k}</dt>
          <dd className="mt-0.5 text-sm">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FirewallPanel({ record }: { record: InventoryRecord }) {
  if (!record.firewallAccess.length) {
    return (
      <p className="text-sm text-muted">
        برای این IP هنوز دسترسی فایروال ثبت نشده است. از ویرایش رکورد سرویس‌ها را اضافه کنید.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="text-xs text-faint">
          <tr className="border-b border-border text-start">
            <th className="py-2 pe-3 font-medium">سرویس</th>
            <th className="py-2 pe-3 font-medium">پروتکل</th>
            <th className="py-2 pe-3 font-medium">پورت</th>
            <th className="py-2 pe-3 font-medium">مقصد</th>
            <th className="py-2 pe-3 font-medium">عمل</th>
            <th className="py-2 font-medium">توضیح</th>
          </tr>
        </thead>
        <tbody>
          {record.firewallAccess.map((f) => (
            <tr key={f.id} className="border-b border-border/70">
              <td className="py-2 pe-3">{f.service}</td>
              <td className="py-2 pe-3 font-mono" dir="ltr">
                {f.protocol}
              </td>
              <td className="py-2 pe-3 font-mono" dir="ltr">
                {f.port}
              </td>
              <td className="py-2 pe-3">{f.destination}</td>
              <td className="py-2 pe-3">
                <span className={f.action === "allow" ? "text-ok" : "text-danger"}>
                  {ACTION_LABEL[f.action]}
                </span>
              </td>
              <td className="py-2 text-muted">{f.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfigSnippet({ record }: { record: InventoryRecord }) {
  const [copied, setCopied] = useState(false);
  const text = generateSwitchportConfig(record);
  return (
    <div className="relative">
      <Button
        size="sm"
        variant="secondary"
        className="absolute end-2 top-2"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "کپی شد" : "کپی"}
      </Button>
      <pre
        dir="ltr"
        className="overflow-x-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-fg"
      >
        {text}
      </pre>
    </div>
  );
}
