import { Link, useRouterState } from "@tanstack/react-router";
import {
  Cable,
  Command,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  Table2,
  Upload,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  APP_AUTHOR,
  APP_AUTHOR_ROLE,
  APP_COPYRIGHT,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/inventory/fields";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "داشبورد", icon: LayoutDashboard },
  { to: "/inventory", label: "موجودی", icon: Table2 },
  { to: "/search", label: "جستجوی ارتباطات", icon: Search },
  { to: "/firewall", label: "فایروال", icon: Shield },
  { to: "/cisco", label: "دستورات Cisco", icon: Command },
  { to: "/exchange", label: "ورود و خروجی", icon: Upload },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e border-border bg-surface/80 p-4 md:flex">
          <Brand />
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <NavLink key={item.to} {...item} active={isActive(pathname, item.to)} />
            ))}
          </nav>
          <div className="mt-auto space-y-2 border-t border-border pt-3">
            <p className="text-[11px] leading-relaxed text-faint">
              داده روی سرور در فایل JSON ذخیره می‌شود و از طریق شبکه قابل ویرایش است.
            </p>
            <p className="text-[11px] leading-relaxed text-muted">
              <span className="font-medium text-fg">{APP_AUTHOR}</span>
              <br />
              {APP_AUTHOR_ROLE}
            </p>
            <p className="text-[10px] text-faint">{APP_COPYRIGHT}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="منو"
            >
              <Menu className="size-5" />
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted">
              <Cable className="size-4 shrink-0 text-accent" />
              <span className="truncate">مدیریت نود، پچ‌پنل، سوئیچ، IP و دسترسی فایروال</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "تم روشن" : "تم تیره"}
              title={theme === "dark" ? "تم روشن" : "تم تیره"}
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Link
              to="/search"
              search={{ q: "" }}
              className="hidden h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted transition hover:border-accent/40 hover:text-fg sm:inline-flex"
            >
              <Search className="size-4" />
              جستجو
            </Link>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>

          <footer className="border-t border-border px-4 py-4 text-center text-[11px] text-faint md:px-6">
            <p>
              <span className="text-muted">{APP_NAME}</span>
              {" — "}
              ساخته و توسعه‌یافته توسط{" "}
              <span className="font-medium text-fg">{APP_AUTHOR}</span>
            </p>
            <p className="mt-1">{APP_COPYRIGHT}</p>
          </footer>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 flex w-72 flex-col border-e border-border bg-surface p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="بستن">
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  {...item}
                  active={isActive(pathname, item.to)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-auto space-y-2 border-t border-border pt-3">
              <Button variant="secondary" className="w-full justify-start gap-2" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "تم روشن" : "تم تیره"}
              </Button>
              <p className="text-[11px] text-muted">
                {APP_AUTHOR} — {APP_AUTHOR_ROLE}
              </p>
              <p className="text-[10px] text-faint">{APP_COPYRIGHT}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="block">
      <div className="text-lg font-semibold tracking-tight text-fg">{APP_NAME}</div>
      <div className="text-[11px] text-muted">{APP_TAGLINE}</div>
    </Link>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  to: (typeof NAV)[number]["to"];
  label: string;
  icon: (typeof NAV)[number]["icon"];
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
        active
          ? "bg-accent/15 font-medium text-accent"
          : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
