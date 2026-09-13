import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CISCO_COMMANDS, type CiscoDevice } from "@/lib/cisco/catalog";
import { generateSwitchportConfig } from "@/lib/inventory/relations";
import { useInventory } from "@/lib/inventory/query";

export const Route = createFileRoute("/cisco")({ component: CiscoPage });

function CiscoPage() {
  const [device, setDevice] = useState<"all" | CiscoDevice>("all");
  const [q, setQ] = useState("");
  const { data } = useInventory();

  const list = useMemo(() => {
    return CISCO_COMMANDS.filter((c) => {
      if (device !== "all" && c.device !== "both" && c.device !== device) return false;
      if (!q.trim()) return true;
      const n = q.toLowerCase();
      return (
        c.title.includes(q) ||
        c.summary.includes(q) ||
        c.category.includes(q) ||
        c.commands.toLowerCase().includes(n) ||
        c.tags.some((t) => t.includes(n))
      );
    });
  }, [device, q]);

  const sample = data?.records.find((r) => r.switchInterface && r.status === "active");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">دستورات Cisco</h1>
        <p className="mt-1 text-sm text-muted">
          بانک دستورات کاربردی سوئیچ و روتر — قابل جستجو، دسته‌بندی‌شده و آماده کپی روی تجهیزات.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={device} onValueChange={(v) => setDevice(v as typeof device)}>
          <TabsList>
            <TabsTrigger value="all">همه</TabsTrigger>
            <TabsTrigger value="switch">سوئیچ</TabsTrigger>
            <TabsTrigger value="router">روتر</TabsTrigger>
            <TabsTrigger value="both">مشترک</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:max-w-80">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input className="ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی دستور" />
        </div>
      </div>

      {sample ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              کانفیگ ساخته‌شده از موجودی — {sample.userName} / {sample.switchName} {sample.switchInterface}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CopyBlock text={generateSwitchportConfig(sample)} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((cmd) => (
          <Card key={cmd.id} className="rounded-lg">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={cmd.device === "router" ? "accent" : cmd.device === "switch" ? "ok" : "default"}>
                  {cmd.device === "router" ? "Router" : cmd.device === "switch" ? "Switch" : "Both"}
                </Badge>
                <span className="text-xs text-faint">{cmd.category}</span>
              </div>
              <CardTitle className="mt-2">{cmd.title}</CardTitle>
              <p className="text-sm text-muted">{cmd.summary}</p>
            </CardHeader>
            <CardContent>
              <CopyBlock text={cmd.commands} />
            </CardContent>
          </Card>
        ))}
      </div>
      {list.length === 0 ? <p className="text-sm text-muted">دستوری مطابق جستجو نیست.</p> : null}
    </div>
  );
}

function CopyBlock({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="relative">
      <Button
        size="sm"
        variant="secondary"
        className="absolute end-2 top-2"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setOk(true);
          toast.success("کپی شد");
          setTimeout(() => setOk(false), 1200);
        }}
      >
        {ok ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      <pre dir="ltr" className="overflow-x-auto rounded-md bg-bg p-4 font-mono text-xs leading-relaxed">
        {text}
      </pre>
    </div>
  );
}
