import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccess } from "@/lib/access/session";
import { APP_AUTHOR, APP_NAME, APP_TAGLINE } from "@/lib/inventory/fields";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login, session } = useAccess();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (session && typeof window !== "undefined") {
    queueMicrotask(() => navigate({ to: "/" }));
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      {
        onSuccess: () => {
          toast.success("ورود موفق");
          navigate({ to: "/" });
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "ورود ناموفق");
        },
      },
    );
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
          <CardDescription>{APP_TAGLINE}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={login.isPending} className="w-full">
              {login.isPending ? "در حال ورود…" : "ورود"}
            </Button>
            <p className="text-center text-[11px] text-faint">
              کاربر پیش‌فرض ادمین: <span className="font-mono" dir="ltr">admin / Admin@123</span>
              <br />
              ساخته‌شده توسط {APP_AUTHOR}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
