import { ArrowDown, ArrowUp, ChevronRight, CircleAlert, Clock3, Download, ExternalLink, MapPin, RefreshCw, TrendingUp } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/nlams-data";

export function StatusBadge({ status, children }: { status: Status; children?: ReactNode }) {
  const labels: Record<Status, string> = { "on-track": "On track", "at-risk": "At risk", delayed: "Delayed", "not-started": "Not started", completed: "Completed" };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold", status === "on-track" || status === "completed" ? "bg-success/10 text-success" : status === "at-risk" ? "bg-accent/10 text-accent" : status === "delayed" ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground")}><span className="size-1.5 rounded-full bg-current" />{children ?? labels[status]}</span>;
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</div><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{title}</h1><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{children}</div>;
}

export function KpiCard({ label, value, note, tone = "default", trend }: { label: string; value: string; note: string; tone?: "default" | "accent" | "success"; trend?: "up" | "down" }) {
  return <Card className={cn("p-4 shadow-[0_12px_28px_-18px_var(--color-primary)]", tone === "accent" && "border-accent/30 bg-accent/5", tone === "success" && "border-success/25 bg-success/5")}><div className={cn("text-[10px] font-semibold uppercase tracking-wider", tone === "accent" ? "text-accent" : "text-muted-foreground")}>{label}</div><div className="mt-2 text-3xl font-extrabold tabular-nums text-primary">{value}</div><div className={cn("mt-1 flex items-center gap-1 text-[11px] font-medium", tone === "accent" ? "text-accent" : tone === "success" ? "text-success" : "text-muted-foreground")}>{trend === "up" && <ArrowUp className="size-3" />}{trend === "down" && <ArrowDown className="size-3" />}{note}</div></Card>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-primary">{title}</h2>{description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}</div>{action}</div>; }
export function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="flex min-w-32 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-md border border-border bg-card px-2.5 text-xs font-medium normal-case tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
export function EmptyState({ title = "No records match these filters", description = "Try widening your selection or clearing one of the filters." }: { title?: string; description?: string }) { return <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center"><CircleAlert className="size-6 text-muted-foreground" /><h3 className="mt-3 text-sm font-semibold text-primary">{title}</h3><p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p></div>; }
export function LoadingRows() { return <div className="space-y-3 p-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-9 animate-pulse rounded-md bg-muted" />)}</div>; }
export function DataFreshness() { return <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><span className="size-1.5 rounded-full bg-success" />Data synchronised 04:12 IST <RefreshCw className="size-3" /></div>; }
export function ExportButton() { return <Button variant="outline" size="sm"><Download />Export</Button>; }
export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "accent" | "success" | "danger" }) { return <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", tone === "accent" ? "bg-accent" : tone === "success" ? "bg-success" : tone === "danger" ? "bg-danger" : "bg-primary")} style={{ width: `${Math.min(value, 100)}%` }} /></div>; }
export function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "success" | "accent" | "danger" }) { return <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className={cn("mt-1 text-lg font-extrabold tabular-nums text-primary", tone === "success" && "text-success", tone === "accent" && "text-accent", tone === "danger" && "text-danger")}>{value}</div></div>; }
export function ActivityIcon({ tone }: { tone: string }) { return <span className={cn("grid size-7 shrink-0 place-items-center rounded-md text-xs", tone === "success" ? "bg-success/10 text-success" : tone === "danger" ? "bg-danger/10 text-danger" : tone === "accent" ? "bg-accent/10 text-accent" : "bg-secondary text-secondary-foreground")}><TrendingUp className="size-3.5" /></span>; }
export const UiIcons = { ChevronRight, ExternalLink, MapPin, Clock3 };
