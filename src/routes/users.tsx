import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteUser, listUsers, saveUser, updateUserRolePermissions } from "@/lib/access/actions";
import { ALL_PAGES, PAGE_LABELS } from "@/lib/access/permissions";
import { useAccess } from "@/lib/access/session";
import type { PageKey, PublicUser, Role } from "@/lib/access/types";

export const Route = createFileRoute("/users")({ component: UsersPage });

function UsersPage() {
  const { session, canPage } = useAccess();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["access-users"],
    queryFn: () => listUsers(),
    enabled: session?.user.role === "admin",
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PublicUser | null>(null);
  const [form, setForm] = useState({ username: "", displayName: "", role: "user" as Role, password: "", active: true });
  const [userPages, setUserPages] = useState<PageKey[]>([]);
  const [userCanEdit, setUserCanEdit] = useState(false);

  useEffect(() => {
    if (data?.rolePermissions.user) {
      setUserPages(data.rolePermissions.user.pages);
      setUserCanEdit(data.rolePermissions.user.canEdit);
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: saveUser,
    onSuccess: (res) => { qc.setQueryData(["access-users"], res); toast.success("ذخیره شد"); setOpen(false); setEditing(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => deleteUser({ data: { id } }),
    onSuccess: (res) => { qc.setQueryData(["access-users"], res); toast.success("حذف شد"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا"),
  });
  const permMut = useMutation({
    mutationFn: () => updateUserRolePermissions({ data: { pages: userPages, canEdit: userCanEdit } }),
    onSuccess: (res) => { qc.setQueryData(["access-users"], res); toast.success("دسترسی کاربران عادی ذخیره شد"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا"),
  });

  if (!session) return <Navigate to="/login" />;
  if (!canPage("users") || session.user.role !== "admin") {
    return <p className="text-sm text-muted">فقط مدیر سیستم به این بخش دسترسی دارد.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">مدیریت کاربران و دسترسی</h1>
          <p className="mt-1 text-sm text-muted">تعریف کاربران و تعیین بخش‌های قابل‌مشاهده برای کاربر عادی</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ username: "", displayName: "", role: "user", password: "", active: true }); setOpen(true); }}>
          <Plus className="size-4" /> کاربر جدید
        </Button>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>کاربران</CardTitle>
          <CardDescription>{isLoading ? "…" : `${data?.users.length ?? 0} کاربر`}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="px-2 py-2 text-start">نام نمایشی</th>
                <th className="px-2 py-2 text-start">نام کاربری</th>
                <th className="px-2 py-2 text-start">نقش</th>
                <th className="px-2 py-2 text-start">وضعیت</th>
                <th className="px-2 py-2 text-start">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {(data?.users ?? []).map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-2 py-2">{u.displayName}</td>
                  <td className="px-2 py-2 font-mono" dir="ltr">{u.username}</td>
                  <td className="px-2 py-2">{u.role === "admin" ? "ادمین" : "عادی"}</td>
                  <td className="px-2 py-2">{u.active ? "فعال" : "غیرفعال"}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(u); setForm({ username: u.username, displayName: u.displayName, role: u.role, password: "", active: u.active }); setOpen(true); }}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { if (confirm(`حذف ${u.username}؟`)) delMut.mutate(u.id); }}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>دسترسی پیش‌فرض کاربر عادی</CardTitle>
          <CardDescription>بخش‌هایی که کاربر عادی می‌بیند. ویرایش فقط با تیک زیر.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {ALL_PAGES.filter((p) => p !== "users").map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={userPages.includes(p)} onChange={() => setUserPages((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])} />
                {PAGE_LABELS[p]}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={userCanEdit} onChange={(e) => setUserCanEdit(e.target.checked)} />
            اجازه ویرایش / حذف / افزودن برای کاربر عادی
          </label>
          <Button onClick={() => permMut.mutate()} disabled={permMut.isPending}>ذخیره دسترسی‌ها</Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش کاربر" : "کاربر جدید"}</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate({ data: { id: editing?.id, username: form.username, displayName: form.displayName, role: form.role, password: form.password || undefined, active: form.active } });
          }}>
            <div className="space-y-1"><Label>نام کاربری</Label><Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required dir="ltr" /></div>
            <div className="space-y-1"><Label>نام نمایشی</Label><Input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>نقش</Label>
              <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
                <option value="user">عادی</option>
                <option value="admin">ادمین</option>
              </select>
            </div>
            <div className="space-y-1"><Label>رمز عبور {editing ? "(خالی = بدون تغییر)" : ""}</Label><Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!editing} dir="ltr" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />فعال</label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>انصراف</Button>
              <Button type="submit" disabled={saveMut.isPending}>ذخیره</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
