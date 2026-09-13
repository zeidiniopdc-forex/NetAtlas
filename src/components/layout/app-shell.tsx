import { Link, useRouterState } from "@tanstack/react-router";
import {
  Cable,
  Command,
  LayoutDashboard,
  Menu,
  Search,
  Shield,
  Table2,
  Upload,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/inventory/fields";
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
          <p className="text-[11px] leading-relaxed text-faint">
            داده روی سرور در فایل JSON ذخیره می‌شود و از طریق شبکه قابل ویرایش است.
          </p>
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
            <Link
              to="/search"
              search={{ q: "" }}
              className="hidden h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted hover:text-fg sm:flex"
            >
              <Search className="size-4" />
              جستجوی هر آیتم…
            </Link>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            className="absolute inset-0 bg-bg/70"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 flex w-[min(84vw,280px)] flex-col bg-surface p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Brand compact />
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
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-md bg-accent text-accent-fg">
        <Cable className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium leading-tight">{APP_NAME}</span>
        {compact ? null : (
          <span className="block text-[11px] text-muted">{APP_TAGLINE}</span>
        )}
      </span>
    </Link>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Search;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
        active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon className={cn("size-4", active && "text-accent")} />
      {label}
    </Link>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
