import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { IndiaChoropleth } from "@/components/india-choropleth";
import {
  ActivityIcon,
  AsyncSection,
  DataFreshness,
  EmptyState,
  ErrorState,
  ExportButton,
  KpiCard,
  KpiGrid,
  KpiSkeleton,
  LoadingRows,
  OverdueFlag,
  PageHeader,
  PageShell,
  Panel,
  PanelHeader,
  SortHeader,
  StatusBadge,
  TableFrame,
  TableHeadRow,
  useSort,
} from "@/components/nlams-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockQuery } from "@/hooks/use-mock-query";
import { useScopedProjects } from "@/hooks/use-projects";
import {
  formatCompact,
  formatCrore,
  formatHectares,
  formatNumber,
  formatPercent,
  getActivityFeed,
  getFunnel,
  totalsFor,
  type Project,
} from "@/lib/nlams-data";
import { useFilters } from "@/lib/nlams-filters";

export const Route = createFileRoute("/")({ component: NationalOverview });

function NationalOverview() {
  const projects = useScopedProjects();
  const { role, setState } = useFilters();
  const navigate = useNavigate();

  const totals = useMemo(() => totalsFor(projects.rows), [projects.rows]);
  const atRisk = useMemo(
    () =>
      projects.rows.filter(
        (project) => project.status === "delayed" || project.status === "at-risk",
      ),
    [projects.rows],
  );

  const mapData = useMemo(() => {
    const byState = new Map<string, { area: number; projects: number }>();
    projects.rows.forEach((project) => {
      const entry = byState.get(project.state) ?? { area: 0, projects: 0 };
      byState.set(project.state, {
        area: entry.area + project.areaAcquired,
        projects: entry.projects + 1,
      });
    });
    return Array.from(byState.entries()).map(([state, entry]) => ({
      state,
      value: entry.area,
      detail: `${entry.projects} project${entry.projects === 1 ? "" : "s"} in view`,
    }));
  }, [projects.rows]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="National command view"
        title="National Overview"
        description="Live position of land acquisition across states, statutory stages, compensation and rehabilitation — as reported by implementing agencies."
      >
        <DataFreshness />
        <ExportButton />
      </PageHeader>

      {projects.loading ? (
        <KpiSkeleton />
      ) : projects.error ? (
        <ErrorState error={projects.error} onRetry={projects.refetch} />
      ) : (
        <KpiGrid>
          <KpiCard
            label="Active projects"
            value={formatNumber(totals.activeProjects)}
            note={`${role.scope} scope`}
          />
          <KpiCard
            label="Area notified"
            value={formatCompact(totals.areaNotified)}
            note="hectares under Sec. 11"
          />
          <KpiCard
            label="Area acquired"
            value={formatCompact(totals.areaAcquired)}
            note={`${formatPercent(totals.acquisitionRate)} of notified`}
            tone="success"
            trend="up"
          />
          <KpiCard
            label="Compensation disbursed"
            value={formatCrore(totals.compensationPaid)}
            note={`${formatPercent(totals.disbursementRate)} of assessed`}
            tone="accent"
          />
          <KpiCard
            label="Affected families"
            value={formatCompact(totals.familiesAffected)}
            note="on record across projects"
          />
          <KpiCard
            label="Displaced families"
            value={formatCompact(totals.familiesDisplaced)}
            note="entitled under R&R"
            tone="danger"
          />
        </KpiGrid>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <PanelHeader
            title="State-wise acquisition intensity"
            description="Area acquired per state or UT. Click a state to drill into its detailed progress."
          />
          <div className="p-5 pt-4">
            {projects.loading ? (
              <Skeleton className="h-[420px] w-full" />
            ) : mapData.length === 0 ? (
              <EmptyState
                title="No states in the current scope"
                description="Reset the global filters or switch to a wider role scope."
              />
            ) : (
              <IndiaChoropleth
                data={mapData}
                metricLabel="area acquired"
                onSelect={(state) => {
                  setState(state);
                  void navigate({ to: "/states" });
                }}
                formatValue={formatHectares}
              />
            )}
          </div>
        </Panel>

        <div className="space-y-5">
          <StageFunnel />
          <ActivityFeed />
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Projects at risk"
          description="Delayed milestones and stalled objections, ranked by days overdue."
          action={
            <Button variant="outline" size="sm" onClick={() => void navigate({ to: "/projects" })}>
              All projects
              <ArrowRight />
            </Button>
          }
        />
        {projects.loading ? (
          <LoadingRows />
        ) : projects.error ? (
          <div className="p-5">
            <ErrorState error={projects.error} onRetry={projects.refetch} />
          </div>
        ) : atRisk.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No projects at risk in this scope"
              description="Every project in the current selection is on track."
            />
          </div>
        ) : (
          <RiskTable rows={atRisk} />
        )}
      </Panel>
    </PageShell>
  );
}

function RiskTable({ rows }: { rows: Project[] }) {
  const { sorted, sortKey, direction, toggle } = useSort(rows, "daysOverdue");
  const navigate = useNavigate();

  return (
    <TableFrame>
      <TableHeadRow>
        <SortHeader
          label="Project"
          sortKey="name"
          activeKey={sortKey}
          direction={direction}
          onSort={toggle}
        />
        <SortHeader
          label="State"
          sortKey="state"
          activeKey={sortKey}
          direction={direction}
          onSort={toggle}
        />
        <SortHeader
          label="Current stage"
          sortKey="stage"
          activeKey={sortKey}
          direction={direction}
          onSort={toggle}
        />
        <th className="px-4 py-2.5 font-semibold">Risk reason</th>
        <SortHeader
          label="Days overdue"
          sortKey="daysOverdue"
          activeKey={sortKey}
          direction={direction}
          onSort={toggle}
          align="right"
        />
        <th className="px-4 py-2.5 text-right font-semibold">Status</th>
      </TableHeadRow>
      <tbody className="divide-y divide-border">
        {sorted.map((project) => (
          <tr
            key={project.id}
            className="cursor-pointer transition-colors hover:bg-muted/60"
            onClick={() =>
              void navigate({ to: "/projects/$projectId", params: { projectId: project.id } })
            }
          >
            <td className="px-4 py-3">
              <div className="font-semibold text-primary">{project.name}</div>
              <div className="text-[10px] text-muted-foreground">{project.agency}</div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {project.state}
              <div className="text-[10px]">{project.district}</div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{project.stage}</td>
            <td className="px-4 py-3 text-muted-foreground">{project.riskReason ?? "—"}</td>
            <td className="px-4 py-3 text-right">
              <OverdueFlag days={project.daysOverdue ?? 0} />
            </td>
            <td className="px-4 py-3 text-right">
              <StatusBadge status={project.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

function StageFunnel() {
  const funnel = useMockQuery(getFunnel, []);

  return (
    <Panel>
      <PanelHeader
        title="National statutory funnel"
        description="Projects moving through the LARR Act, 2013 stages."
      />
      <AsyncSection query={funnel} skeleton={<LoadingRows rows={6} />}>
        {(stages) => {
          const first = stages[0]?.value ?? 1;
          return (
            <div className="space-y-3 p-5">
              {stages.map((stage, index) => {
                const previous = stages[index - 1]?.value;
                const dropOff = previous === undefined ? null : previous - stage.value;
                return (
                  <div
                    key={stage.label}
                    title={`${stage.label}: ${stage.value} projects (${((stage.value / first) * 100).toFixed(1)}% of proposed)`}
                  >
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="font-semibold text-foreground">{stage.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        <span className="font-bold text-primary">{stage.value}</span>
                        {dropOff !== null && dropOff > 0 && (
                          <span className="ml-2 text-danger">−{dropOff}</span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={
                          stage.tone === "success"
                            ? "h-full rounded-full bg-success"
                            : stage.tone === "accent"
                              ? "h-full rounded-full bg-accent"
                              : "h-full rounded-full bg-primary"
                        }
                        style={{ width: `${stage.width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="border-t border-border pt-3 text-[10px] text-muted-foreground">
                {(((stages[stages.length - 1]?.value ?? 0) / first) * 100).toFixed(1)}% of proposed
                projects have reached possession.
              </p>
            </div>
          );
        }}
      </AsyncSection>
    </Panel>
  );
}

const liveEvents = [
  {
    tone: "success",
    title: "Possession taken — Konkan Coastal Highway Link",
    detail: "Just now · Maharashtra · Raigad",
  },
  {
    tone: "accent",
    title: "Award declared ₹18.4 Cr — Kaveri Basin Lift Irrigation",
    detail: "Just now · Karnataka · Sec 23",
  },
  {
    tone: "brand",
    title: "Sec 11 notification — Assam Petro Distribution",
    detail: "Just now · Assam · Dibrugarh",
  },
  {
    tone: "danger",
    title: "Objection escalated — East Coast Rail Link",
    detail: "Just now · West Bengal · Purba Medinipur",
  },
] as const;

function ActivityFeed() {
  const feed = useMockQuery(getActivityFeed, []);
  const [live, setLive] = useState<
    Array<{ id: number; tone: string; title: string; detail: string }>
  >([]);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      const next = liveEvents[index % liveEvents.length];
      index += 1;
      if (next) setLive((current) => [{ ...next, id: index }, ...current].slice(0, 4));
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Panel>
      <PanelHeader
        title="Recent activity"
        description="Notifications issued, awards declared and possessions taken."
        action={
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success">
            <Radio className="size-3" />
            Live
          </span>
        }
      />
      <AsyncSection query={feed} skeleton={<LoadingRows rows={5} />}>
        {(rows) => (
          <ul className="max-h-[320px] divide-y divide-border overflow-y-auto">
            {[...live, ...rows].map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="flex items-start gap-3 px-5 py-3 animate-rise"
              >
                <ActivityIcon tone={item.tone} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">{item.title}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{item.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AsyncSection>
    </Panel>
  );
}
