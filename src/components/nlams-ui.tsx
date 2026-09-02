import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  CircleAlert,
  Download,
  FileWarning,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SECTORS, type Status } from "@/lib/nlams-data";
import { ANY, DATE_RANGES, useFilters, useScopedStates, type DateRange } from "@/lib/nlams-filters";

/* -------------------------------------------------------------------------- *
 * Status badge — the single status primitive reused for project stage,
 * objection status, R&R entitlement status and milestone status.
 * -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<Status, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  delayed: "Delayed",
  "not-started": "Not started",
  completed: "Completed",
};

const STATUS_CLASSES: Record<Status, string> = {
  "on-track": "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  "at-risk": "bg-accent/10 text-accent",
  delayed: "bg-danger/10 text-danger",
  "not-started": "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  children,
  className,
}: {
  status: Status;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold",
        STATUS_CLASSES[status],
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {children ?? STATUS_LABELS[status]}
    </span>
  );
}

/** Map the domain-specific vocabularies onto the five canonical statuses. */
export const toStatus = (value: string): Status => {
  const normalised = value.toLowerCase();
  if (["completed", "paid", "resolved", "verified", "possession taken"].includes(normalised))
    return "completed";
  if (["allotted", "on track", "on-track", "under hearing", "released"].includes(normalised))
    return "on-track";
  if (
    ["pending", "at risk", "at-risk", "under assessment", "pending verification", "open"].includes(
      normalised,
    )
  )
    return "at-risk";
  if (["delayed", "disputed", "overdue", "escalated", "blocked"].includes(normalised))
    return "delayed";
  return "not-started";
};

export function FrictionBadge({ score }: { score: number }) {
  const status: Status = score >= 60 ? "delayed" : score >= 30 ? "at-risk" : "on-track";
  return <StatusBadge status={status}>{`Friction ${score}`}</StatusBadge>;
}

/* ------------------------------- Page chrome ------------------------------ */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden p-0 shadow-[0_12px_28px_-22px_var(--color-primary)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-sm font-bold text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- KPIs ---------------------------------- */

export function KpiCard({
  label,
  value,
  note,
  tone = "default",
  trend,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "accent" | "success" | "danger";
  trend?: "up" | "down";
}) {
  return (
    <Card
      className={cn(
        "gap-0 p-4 shadow-[0_12px_28px_-18px_var(--color-primary)]",
        tone === "accent" && "border-accent/30 bg-accent/5",
        tone === "success" && "border-success/25 bg-success/5",
        tone === "danger" && "border-danger/25 bg-danger/5",
      )}
    >
      <div
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          tone === "accent" ? "text-accent" : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold tabular-nums text-primary xl:text-3xl">
        {value}
      </div>
      <div
        className={cn(
          "mt-1 flex items-center gap-1 text-[11px] font-medium",
          tone === "accent"
            ? "text-accent"
            : tone === "success"
              ? "text-success"
              : tone === "danger"
                ? "text-danger"
                : "text-muted-foreground",
        )}
      >
        {trend === "up" && <ArrowUp className="size-3" />}
        {trend === "down" && <ArrowDown className="size-3" />}
        {note}
      </div>
    </Card>
  );
}

export function KpiGrid({ children, columns = 6 }: { children: ReactNode; columns?: 4 | 6 }) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
        columns === 6 ? "xl:grid-cols-6" : "xl:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function KpiSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="gap-0 p-4">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-7 w-28" />
          <Skeleton className="mt-2 h-2.5 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "accent" | "danger";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-extrabold tabular-nums text-primary",
          tone === "success" && "text-success",
          tone === "accent" && "text-accent",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "accent" | "success" | "danger";
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          tone === "accent"
            ? "bg-accent"
            : tone === "success"
              ? "bg-success"
              : tone === "danger"
                ? "bg-danger"
                : "bg-primary",
        )}
        style={{ width: `${Math.max(Math.min(value, 100), 0)}%` }}
      />
    </div>
  );
}

/* ------------------------- Loading / empty / error ------------------------ */

export function LoadingRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 p-5" style={{ height }}>
      {[62, 88, 46, 74, 95, 58, 80, 40, 68, 90].map((value, index) => (
        <Skeleton key={index} className="w-full rounded-t-md" style={{ height: `${value}%` }} />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No records match these filters",
  description = "Try widening your selection or clearing one of the global filters.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
      <CircleAlert className="size-6 text-muted-foreground" />
      <h3 className="mt-3 text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 p-6 text-center">
      <FileWarning className="size-6 text-danger" />
      <h3 className="mt-3 text-sm font-semibold text-danger">This section could not be loaded</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error.message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
      )}
    </div>
  );
}

/** Standard loading → error → empty → content ladder used by every panel. */
export function AsyncSection<T>({
  query,
  isEmpty,
  skeleton,
  empty,
  children,
}: {
  query: { data: T | undefined; loading: boolean; error: Error | undefined; refetch: () => void };
  isEmpty?: (data: T) => boolean;
  skeleton?: ReactNode;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.loading || query.data === undefined) return <>{skeleton ?? <LoadingRows />}</>;
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (isEmpty?.(query.data)) return <div className="p-5">{empty ?? <EmptyState />}</div>;
  return <>{children(query.data)}</>;
}

/* -------------------------------- Filters -------------------------------- */

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-36 flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:flex-none">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-border bg-card px-2.5 text-xs font-medium normal-case tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Global filter bar — state / sector / status / date range. Backed by the app
 * level filter context, so selections persist as the user moves between the
 * data-heavy pages.
 */
export function GlobalFilterBar({ showStatus = true }: { showStatus?: boolean }) {
  const filters = useFilters();
  const states = useScopedStates();

  return (
    <Card className="gap-0 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 self-center pr-1 text-[11px] font-semibold text-primary">
          <SlidersHorizontal className="size-3.5 text-accent" />
          Global filters
        </div>
        <FilterSelect
          label="State / UT"
          value={filters.state}
          options={[ANY, ...states]}
          onChange={filters.setState}
        />
        <FilterSelect
          label="Sector"
          value={filters.sector}
          options={[ANY, ...SECTORS]}
          onChange={filters.setSector}
        />
        {showStatus && (
          <FilterSelect
            label="Status"
            value={filters.status}
            options={[ANY, "on-track", "at-risk", "delayed", "completed", "not-started"]}
            onChange={filters.setStatus}
          />
        )}
        <FilterSelect
          label="Date range"
          value={filters.dateRange}
          options={DATE_RANGES}
          onChange={(value) => filters.setDateRange(value as DateRange)}
        />
        <div className="ml-auto flex items-center gap-2 self-end">
          {filters.activeFilterCount > 0 && (
            <span className="rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent">
              {filters.activeFilterCount} active
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={filters.reset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </div>
      <p className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
        Viewing as <span className="font-semibold text-primary">{filters.role.label}</span> · scope
        limited to {filters.role.scope}.
      </p>
    </Card>
  );
}

/* --------------------------------- Tables -------------------------------- */

export type SortDirection = "asc" | "desc";

export function useSort<T>(
  rows: T[],
  initialKey: keyof T & string,
  initialDirection: SortDirection = "desc",
) {
  const [key, setKey] = useState<string>(initialKey);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((left, right) => {
      const a = (left as Record<string, unknown>)[key];
      const b = (right as Record<string, unknown>)[key];
      if (typeof a === "number" && typeof b === "number")
        return direction === "asc" ? a - b : b - a;
      const as = String(a ?? "");
      const bs = String(b ?? "");
      return direction === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [rows, key, direction]);

  const toggle = (nextKey: string) => {
    if (nextKey === key) setDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setKey(nextKey);
      setDirection("desc");
    }
  };

  return { sorted, sortKey: key, direction, toggle };
}

export function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: string;
  activeKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === activeKey;
  return (
    <th className={cn("px-4 py-2.5 font-semibold", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-primary",
          active ? "text-primary" : "text-muted-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ChevronsUpDown className="size-3 opacity-50" />
        )}
      </button>
    </th>
  );
}

export function TableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-xs">{children}</table>
    </div>
  );
}

export function TableHeadRow({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
      <tr>{children}</tr>
    </thead>
  );
}

/* -------------------------------- Charting -------------------------------- */

/** Shared tooltip surface so every chart reports exact figures identically. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
  }>;
  label?: string | number;
  formatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] shadow-lg">
      {label !== undefined && <div className="mb-1 font-bold text-primary">{label}</div>}
      {payload.map((entry, index) => {
        const name = entry.name ?? String(entry.dataKey ?? "Value");
        const raw = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
        return (
          <div key={index} className="flex items-center gap-2 tabular-nums text-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color ?? "var(--color-primary)" }}
            />
            <span className="text-muted-foreground">{name}</span>
            <span className="ml-auto font-semibold">
              {formatter ? formatter(raw, name) : raw.toLocaleString("en-IN")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const CHART_COLORS = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
  muted: "var(--color-muted-foreground)",
};

export const SERIES_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.success,
  CHART_COLORS.danger,
  "var(--color-ring)",
];

/** Lightweight SVG donut — used for R&R entitlement splits. */
export function Donut({
  segments,
  size = 168,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Entitlement status split"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((segment) => {
            const length = (segment.value / total) * circumference;
            const dash = `${length} ${circumference - length}`;
            const element = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={16}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              >
                <title>{`${segment.label}: ${segment.value.toLocaleString("en-IN")} (${((segment.value / total) * 100).toFixed(1)}%)`}</title>
              </circle>
            );
            offset += length;
            return element;
          })}
        </g>
        {centerValue && (
          <>
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              className="fill-[var(--color-primary)] text-xl font-extrabold tabular-nums"
            >
              {centerValue}
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              className="fill-[var(--color-muted-foreground)] text-[9px] uppercase tracking-wider"
            >
              {centerLabel}
            </text>
          </>
        )}
      </svg>
      <ul className="space-y-2 text-xs">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="ml-auto pl-6 font-semibold tabular-nums text-primary">
              {segment.value.toLocaleString("en-IN")} · {((segment.value / total) * 100).toFixed(0)}
              %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------- Misc chrome ------------------------------ */

export function DataFreshness() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <span className="size-1.5 rounded-full bg-success" />
      Data synchronised 04:12 IST
      <RefreshCw className="size-3" />
    </div>
  );
}

export function ExportButton({ format = "CSV" }: { format?: "CSV" | "PDF" }) {
  return (
    <Button
      variant="outline"
      size="sm"
      title={`Export ${format} (stub — wire to reporting service)`}
    >
      <Download />
      Export {format}
    </Button>
  );
}

export function OverdueFlag({ days }: { days: number }) {
  if (days <= 0) return <span className="text-[11px] text-muted-foreground">On schedule</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger">
      <TriangleAlert className="size-3" />
      {days}d overdue
    </span>
  );
}

export function ActivityIcon({ tone }: { tone: string }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md text-xs",
        tone === "success"
          ? "bg-success/10 text-success"
          : tone === "danger"
            ? "bg-danger/10 text-danger"
            : tone === "accent"
              ? "bg-accent/10 text-accent"
              : "bg-secondary text-secondary-foreground",
      )}
    >
      <span className="size-2 rounded-full bg-current" />
    </span>
  );
}
