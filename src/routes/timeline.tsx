import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  EmptyState,
  ErrorState,
  ExportButton,
  GlobalFilterBar,
  KpiCard,
  KpiGrid,
  KpiSkeleton,
  LoadingRows,
  OverdueFlag,
  PageHeader,
  PageShell,
  Panel,
  PanelHeader,
  StatusBadge,
} from "@/components/nlams-ui";
import { useMockQuery } from "@/hooks/use-mock-query";
import { useScopedProjects } from "@/hooks/use-projects";
import {
  formatDate,
  formatNumber,
  getTimelines,
  type Milestone,
  type ProjectTimeline,
} from "@/lib/nlams-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timeline")({ component: TimelinePage });

const toTime = (value: string): number => new Date(`${value}T00:00:00Z`).getTime();

function TimelinePage() {
  const query = useMockQuery(getTimelines, []);
  const projects = useScopedProjects();

  const visibleIds = useMemo(
    () => new Set(projects.rows.map((project) => project.id)),
    [projects.rows],
  );
  const rows = useMemo<ProjectTimeline[]>(
    () => (query.data ?? []).filter((timeline) => visibleIds.has(timeline.projectId)),
    [query.data, visibleIds],
  );

  const domain = useMemo(() => {
    const times = rows.flatMap((row) =>
      row.milestones.flatMap((milestone) => [
        toTime(milestone.planned),
        milestone.actual ? toTime(milestone.actual) : toTime(milestone.planned),
      ]),
    );
    if (times.length === 0) return { min: 0, max: 1 };
    const min = Math.min(...times);
    const max = Math.max(...times);
    return { min, max: max === min ? min + 1 : max };
  }, [rows]);

  const overdueMilestones = rows.flatMap((row) =>
    row.milestones.filter((milestone) => milestone.daysOverdue > 0),
  );
  const worst = overdueMilestones.reduce(
    (max, milestone) => Math.max(max, milestone.daysOverdue),
    0,
  );
  const onSchedule = rows.filter((row) =>
    row.milestones.every((milestone) => milestone.daysOverdue === 0),
  ).length;
  const loading = query.loading || projects.loading;

  const ticks = useMemo(() => {
    const start = new Date(domain.min);
    const end = new Date(domain.max);
    const list: { label: string; position: number }[] = [];
    const cursor = new Date(
      Date.UTC(start.getUTCFullYear(), Math.floor(start.getUTCMonth() / 3) * 3, 1),
    );
    while (cursor.getTime() <= end.getTime()) {
      const position = ((cursor.getTime() - domain.min) / (domain.max - domain.min)) * 100;
      if (position >= 0 && position <= 100) {
        list.push({
          label: `Q${Math.floor(cursor.getUTCMonth() / 3) + 1} ${String(cursor.getUTCFullYear()).slice(2)}`,
          position,
        });
      }
      cursor.setUTCMonth(cursor.getUTCMonth() + 3);
    }
    return list;
  }, [domain]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Statutory compliance"
        title="Timeline & Milestone Monitoring"
        description="Planned versus actual dates for each statutory milestone, with overdue stages flagged for escalation."
      >
        <ExportButton format="PDF" />
      </PageHeader>

      <GlobalFilterBar />

      {loading ? (
        <KpiSkeleton count={4} />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : (
        <KpiGrid columns={4}>
          <KpiCard
            label="Projects tracked"
            value={formatNumber(rows.length)}
            note="with statutory milestones"
          />
          <KpiCard
            label="Milestones on schedule"
            value={formatNumber(rows.length * 4 - overdueMilestones.length)}
            note="of all tracked milestones"
            tone="success"
          />
          <KpiCard
            label="Overdue milestones"
            value={formatNumber(overdueMilestones.length)}
            note="require escalation"
            tone="danger"
          />
          <KpiCard
            label="Worst slippage"
            value={`${worst} days`}
            note={`${onSchedule} projects fully on schedule`}
            tone="accent"
          />
        </KpiGrid>
      )}

      <Panel>
        <PanelHeader
          title="Milestone timeline"
          description="Hollow marker = planned date · solid marker = actual date · red = overdue."
          action={
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2 border-muted-foreground bg-card" />
                Planned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-success" />
                Achieved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-danger" />
                Overdue
              </span>
            </div>
          }
        />
        {loading ? (
          <LoadingRows rows={8} />
        ) : query.error ? (
          <div className="p-5">
            <ErrorState error={query.error} onRetry={query.refetch} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No milestones in view"
              description="Adjust the global filters to see project milestones."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px] p-5 pt-3">
              <div className="relative mb-2 ml-[280px] h-5 border-b border-border">
                {ticks.map((tick) => (
                  <span
                    key={tick.label}
                    className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
                    style={{ left: `${tick.position}%` }}
                  >
                    {tick.label}
                  </span>
                ))}
              </div>
              <div className="space-y-1">
                {rows.map((row) => (
                  <TimelineRow key={row.projectId} row={row} domain={domain} ticks={ticks} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Overdue milestone register"
          description="Every statutory stage past its planned date, newest slippage first."
        />
        {loading ? (
          <LoadingRows rows={6} />
        ) : overdueMilestones.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No overdue milestones"
              description="Every tracked milestone in this scope is on schedule."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows
              .flatMap((row) =>
                row.milestones
                  .filter((milestone) => milestone.daysOverdue > 0)
                  .map((milestone) => ({ row, milestone })),
              )
              .sort((left, right) => right.milestone.daysOverdue - left.milestone.daysOverdue)
              .slice(0, 12)
              .map(({ row, milestone }) => (
                <li
                  key={`${row.projectId}-${milestone.stage}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <div className="min-w-56 flex-1">
                    <div className="text-xs font-semibold text-primary">{row.project}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {row.state} · {row.sector}
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-foreground">{milestone.stage}</div>
                  <div className="text-[11px] text-muted-foreground">
                    planned {formatDate(milestone.planned)} · actual {formatDate(milestone.actual)}
                  </div>
                  <OverdueFlag days={milestone.daysOverdue} />
                  <StatusBadge status={row.status} />
                </li>
              ))}
          </ul>
        )}
      </Panel>
    </PageShell>
  );
}

function TimelineRow({
  row,
  domain,
  ticks,
}: {
  row: ProjectTimeline;
  domain: { min: number; max: number };
  ticks: { label: string; position: number }[];
}) {
  const position = (value: string): number =>
    ((toTime(value) - domain.min) / (domain.max - domain.min)) * 100;

  return (
    <div className="flex items-center gap-3 rounded-md py-2 hover:bg-muted/50">
      <div className="w-[268px] shrink-0 pl-1">
        <div className="truncate text-xs font-semibold text-primary" title={row.project}>
          {row.project}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {row.state} · {row.sector}
        </div>
      </div>
      <div className="relative h-9 flex-1">
        {ticks.map((tick) => (
          <span
            key={tick.label}
            className="absolute inset-y-0 w-px bg-border"
            style={{ left: `${tick.position}%` }}
          />
        ))}
        <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-muted" />
        {row.milestones.map((milestone) => (
          <MilestoneMarker
            key={milestone.stage}
            milestone={milestone}
            left={position(milestone.planned)}
            actualLeft={milestone.actual ? position(milestone.actual) : null}
          />
        ))}
      </div>
    </div>
  );
}

function MilestoneMarker({
  milestone,
  left,
  actualLeft,
}: {
  milestone: Milestone;
  left: number;
  actualLeft: number | null;
}) {
  const overdue = milestone.daysOverdue > 0;
  const label = `${milestone.stage} · planned ${formatDate(milestone.planned)} · actual ${formatDate(milestone.actual)}${overdue ? ` · ${milestone.daysOverdue} days overdue` : ""}`;

  return (
    <>
      {actualLeft !== null && Math.abs(actualLeft - left) > 0.2 && (
        <span
          className={cn(
            "absolute top-1/2 h-1 -translate-y-1/2 rounded-full",
            overdue ? "bg-danger/60" : "bg-success/60",
          )}
          style={{
            left: `${Math.min(left, actualLeft)}%`,
            width: `${Math.abs(actualLeft - left)}%`,
          }}
          title={label}
        />
      )}
      <span
        className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground bg-card"
        style={{ left: `${left}%` }}
        title={label}
      />
      {actualLeft !== null && (
        <span
          className={cn(
            "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card",
            overdue ? "bg-danger" : "bg-success",
          )}
          style={{ left: `${actualLeft}%` }}
          title={label}
        />
      )}
      {actualLeft === null && (
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-danger"
          style={{ left: `${left}%` }}
          title={`${milestone.stage} · not yet reached · planned ${formatDate(milestone.planned)}`}
        />
      )}
    </>
  );
}
