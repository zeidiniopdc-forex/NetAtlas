import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { RecordList, RelationGraph } from "@/components/search/relation-graph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRelationSearch } from "@/lib/inventory/query";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [draft, setDraft] = useState(q);
  const { data, isFetching } = useRelationSearch(q);

  useEffect(() => setDraft(q), [q]);

  const submit = (value: string) => {
    void navigate({ search: { q: value.trim() } });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">جستجوی ارتباطات</h1>
        <p className="mt-1 text-sm text-muted">
          هر آیتم را جستجو کنید — کاربر، IP، سوئیچ، اینترفیس، پچ‌پنل، نود، کابل، VLAN، کامپیوتر یا سرویس فایروال.
          تمام مسیرهای مرتبط نمایش داده می‌شود.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="مثلاً 10.10.20.34 یا SW-IDF-F2 یا مریم"
          autoFocus
        />
        <Button type="submit">
          <Search className="size-4" />
          بگرد
        </Button>
      </form>

      {!q ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          یک مقدار وارد کنید تا گراف ارتباطات و رکوردهای مرتبط ساخته شود.
        </p>
      ) : isFetching && !data ? (
        <p className="text-sm text-muted">در حال جستجو…</p>
      ) : (
        <>
          <p className="text-sm text-muted">
            {data?.records.length.toLocaleString("fa-IR") ?? "۰"} رکورد مرتبط با «{q}»
          </p>
          <RelationGraph
            nodes={data?.nodes ?? []}
            edges={data?.edges ?? []}
            onPick={(label) => {
              setDraft(label);
              submit(label);
            }}
          />
          <RecordList records={data?.records ?? []} />
        </>
      )}
    </div>
  );
}
