import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  FileBarChart,
  Flag,
  Gauge,
  IndianRupee,
  Map,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Timer,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROLES, useFilters, type RoleId } from "@/lib/nlams-filters";

const navItems = [
  { label: "National Overview", to: "/", icon: Gauge },
  { label: "Project-wise Progress", to: "/projects", icon: ClipboardList },
  { label: "State-wise Progress", to: "/states", icon: Map },
  { label: "Compensation", to: "/compensation", icon: IndianRupee },
  { label: "Rehabilitation & R&R", to: "/rehabilitation", icon: Users },
  { label: "Objections", to: "/objections", icon: Flag },
  { label: "Timeline & Milestones", to: "/timeline", icon: Timer },
  { label: "Reports & Analytics", to: "/reports", icon: FileBarChart },
] as const;

const alerts = [
  {
    title: "Section 101 reversion alert",
    detail: "Delhi–Mumbai Dedicated Rail Corridor · 5 yr non-utilisation review",
    tone: "danger",
  },
  {
    title: "Objection deadline approaching",
    detail: "Rajasthan Solar Park II · 4 days to statutory hearing",
    tone: "accent",
  },
  {
    title: "Payment batch held",
    detail: "Bengaluru Metro Phase 2 · ₹46 Cr pending verification",
    tone: "accent",
  },
] as const;

export function NlamsShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const { role, setRole, search, setSearch, scopedProjects } = useFilters();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-sm font-extrabold tracking-tight text-primary-foreground">
              NL
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[13px] font-bold text-primary">NLAMS</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                National Land Acquisition
              </span>
            </span>
          </Link>
          <div className="hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-lg bg-muted px-3 text-xs text-muted-foreground md:flex">
            <Search className="size-4 shrink-0" />
            <Input
              ref={searchRef}
              aria-label="Search projects, districts, ULPIN"
              placeholder="Search projects, districts, ULPIN…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
            <kbd className="hidden shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground lg:block">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                aria-label="View notifications"
                aria-expanded={alertsOpen}
                onClick={() => setAlertsOpen((open) => !open)}
              >
                <Bell />
              </Button>
              <span className="pointer-events-none absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                {alerts.length}
              </span>
              {alertsOpen && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close notifications"
                    onClick={() => setAlertsOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-border bg-card p-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-primary">
                        Alerts requiring attention
                      </span>
                      <span className="text-[10px] text-muted-foreground">{alerts.length} new</span>
                    </div>
                    <div className="divide-y divide-border">
                      {alerts.map((alert) => (
                        <div key={alert.title} className="flex gap-2.5 py-3">
                          <span
                            className={cn(
                              "mt-1 size-2 shrink-0 rounded-full",
                              alert.tone === "danger" ? "bg-danger" : "bg-accent",
                            )}
                          />
                          <div>
                            <div className="text-xs font-semibold text-foreground">
                              {alert.title}
                            </div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                              {alert.detail}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/timeline"
                      onClick={() => setAlertsOpen(false)}
                      className="mt-1 block rounded-md bg-muted px-2 py-2 text-center text-[11px] font-semibold text-primary hover:bg-secondary"
                    >
                      Open milestone monitoring
                    </Link>
                  </div>
                </>
              )}
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground">
                {role.initials}
              </span>
              <select
                aria-label="Select role"
                value={role.id}
                onChange={(event) => setRole(event.target.value as RoleId)}
                className="max-w-32 bg-transparent text-[11px] font-semibold text-foreground outline-none sm:max-w-52"
              >
                {ROLES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
            </label>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card px-3 py-5 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
            collapsed && "lg:w-[76px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-4 flex items-center justify-between px-3">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
                collapsed && "lg:hidden",
              )}
            >
              Modules
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X />
            </Button>
          </div>
          <nav className="space-y-1 text-[13px] font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_var(--color-primary)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "lg:justify-center lg:px-2",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div
            className={cn(
              "mt-auto rounded-xl border border-accent/25 bg-accent/10 p-3",
              collapsed && "lg:mx-1 lg:p-2",
            )}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold text-accent">
              <ShieldCheck className="size-3.5 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>Scope: {role.scope}</span>
            </div>
            <div className={cn("mt-1 text-[10px] text-muted-foreground", collapsed && "lg:hidden")}>
              {role.detail} · {scopedProjects.length} projects visible
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 hidden lg:flex"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
            <span className={cn(collapsed && "hidden")}>Collapse menu</span>
          </Button>
        </aside>
        {mobileOpen && (
          <button
            className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
