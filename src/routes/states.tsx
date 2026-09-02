import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IndiaChoropleth } from "@/components/india-choropleth";
import {
  CHART_COLORS,
  ChartSkeleton,
  ChartTooltip,
  EmptyState,
  ErrorState,
  ExportButton,
  GlobalFilterBar,
  KpiCard,
  KpiGrid,
  KpiSkeleton,
  LoadingRows,
  PageHeader,
  PageShell,
  Panel,
  PanelHeader,
  ProgressBar,
  SortHeader,
  StatusBadge,
  TableFrame,
  TableHeadRow,
  useSort,
} from "@/components/nlams-ui";
import { useMockQuery } from "@/hooks/use-mock-query";
import { useScopedProjects } from "@/hooks/use-projects";
import {
  formatCompact,
  formatCrore,
  formatHectares,
  formatNumber,
  formatPercent,
  getStateStats,
  type StateStat,
} from "@/lib/nlams-data";
import { ANY, useFilters } from "@/lib/nlams-filters";

export const Route = createFileRoute("/states")({ component: StatesPage });

const METRICS = {
  "Area acquired (ha)": {
    key: "areaAcquired",
    format: formatHectares,
    color: CHART_COLORS.primary,
  },
  "Disbursement (%)": {
    key: "disbursementRate",
    format: (value: number) => formatPercent(value),
    color: CHART_COLORS.success,
  },
  "Families resettled (%)": {
    key: "familiesResettled",
    format: (value: number) => formatPercent(value, 0),
    color: CHART_COLORS.accent,
  },
  "Average delay (days)": {
    key: "averageDelay",
    format: (value: number) => `${value} days`,
    color: CHART_COLORS.danger,
  },
} as const;

type MetricLabel = keyof typeof METRICS;

interface StateRow extends StateStat {
  disbursementRate: number;
  acquisitionRate: number;
}

const STAGE_BASELINE = [
  { stage: "Sec 11", base: 62 },
  { stage: "Sec 19", base: 95 },
  { stage: "Sec 23", base: 128 },
  { stage: "Possession", base: 74 },
];

function StatesPage() {
  const query = useMockQuery(getStateStats, []);
  const projects = useScopedProjects();
  const { state: stateFilter, setState } = useFilters();
  const navigate = useNavigate();
  const [metric, setMetric] = useState<MetricLabel>("Area acquired (ha)");

  const visibleStates = useMemo(
    () => new Set(projects.scoped.map((project) => project.state)),
    [projects.scoped],
  );

  const rows = useMemo<StateRow[]>(() => {
    if (!query.data) return [];
    return query.data
      .filter((row) => visibleStates.has(row.state))
      .filter((row) => stateFilter === ANY || row.state === stateFilter)
      .map((row) => ({
        ...row,
        disbursementRate:
          row.compensationAssessed === 0
            ? 0
            : (row.compensationPaid / row.compensationAssessed) * 100,
        acquisitionRate: row.areaNotified === 0 ? 0 : (row.areaAcquired / row.areaNotified) * 100,
      }));
  }, [query.data, visibleStates, stateFilter]);

  const { sorted, sortKey, direction, toggle } = useSort(rows, "areaAcquired");
  const activeMetric = METRICS[metric];

  const chartData = useMemo(
    () =>
      [...rows]
        .sort(
          (left, right) => (right[activeMetric.key] as number) - (left[activeMetric.key] as number),
        )
        .map((row) => ({
          state: row.code,
          name: row.state,
          value: row[activeMetric.key] as number,
          status: row.status,
        })),
    [rows, activeMetric.key],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          projects: acc.projects + row.projects,
          areaNotified: acc.areaNotified + row.areaNotified,
          areaAcquired: acc.areaAcquired + row.areaAcquired,
          assessed: acc.assessed + row.compensationAssessed,
          paid: acc.paid + row.compensationPaid,
        }),
        { projects: 0, areaNotified: 0, areaAcquired: 0, assessed: 0, paid: 0 },
      ),
    [rows],
  );

  const stageTimes = useMemo(() => {
    const averageDelay =
      rows.length === 0 ? 0 : rows.reduce((sum, row) => sum + row.averageDelay, 0) / rows.length;
    return STAGE_BASELINE.map((entry) => ({
      stage: entry.stage,
      planned: entry.base,
      actual: Math.round(entry.base + averageDelay * 1.4),
    }));
  }, [rows]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Federal comparison"
        title="State-wise Progress"
        description="Aggregated acquisition, disbursement and rehabilitation performance for every state and union territory in scope."
      >
        <ExportButton />
      </PageHeader>

      <GlobalFilterBar showStatus={false} />

      {query.loading ? (
        <KpiSkeleton count={4} />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : (
        <KpiGrid columns={4}>
          <KpiCard
            label="States in view"
            value={formatNumber(rows.length)}
            note={`${formatNumber(totals.projects)} projects reported`}
          />
          <KpiCard
            label="Area notified"
            value={formatCompact(totals.areaNotified)}
            note="hectares across states"
          />
          <KpiCard
            label="Area acquired"
            value={formatCompact(totals.areaAcquired)}
            note={`${formatPercent(totals.areaNotified === 0 ? 0 : (totals.areaAcquired / totals.areaNotified) * 100)} of notified`}
            tone="success"
          />
          <KpiCard
            label="Compensation disbursed"
            value={formatCrore(totals.paid)}
            note={`of ${formatCrore(totals.assessed)} assessed`}
            tone="accent"
          />
        </KpiGrid>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel>
          <PanelHeader
            title="Geographic distribution"
            description="Click a state to filter this page to it."
          />
          <div className="p-5">
            {query.loading ? (
              <ChartSkeleton height={380} />
            ) : (
              <IndiaChoropleth
                data={rows.map((row) => ({
                  state: row.state,
                  value: row.areaAcquired,
                  detail: `${row.projects} projects`,
                }))}
                metricLabel="area acquired"
                selected={stateFilter === ANY ? undefined : stateFilter}
                onSelect={setState}
                formatValue={formatHectares}
              />
            )}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <PanelHeader
              title="State comparison"
              description="Side-by-side ranking on a selectable metric."
              action={
                <select
                  aria-label="Comparison metric"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value as MetricLabel)}
                  className="h-8 rounded-md border border-border bg-card px-2 text-[11px] font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.keys(METRICS).map((label) => (
                    <option key={label}>{label}</option>
                  ))}
                </select>
              }
            />
            <div className="p-5">
              {query.loading ? (
                <ChartSkeleton />
              ) : chartData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="state"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      tickFormatter={(value: number) =>
                        value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                      content={<ChartTooltip formatter={(value) => activeMetric.format(value)} />}
                      labelFormatter={(label: string) =>
                        chartData.find((row) => row.state === label)?.name ?? label
                      }
                    />
                    <Bar
                      dataKey="value"
                      name={metric}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    >
                      {chartData.map((row) => (
                        <Cell
                          key={row.state}
                          fill={activeMetric.color}
                          fillOpacity={stateFilter === row.name ? 1 : 0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Average processing time per stage"
              description={
                stateFilter === ANY
                  ? "Planned vs actual days, averaged across states in view."
                  : `Planned vs actual days · ${stateFilter}`
              }
            />
            <div className="space-y-3 p-5">
              {stageTimes.map((entry) => (
                <div key={entry.stage}>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-foreground">{entry.stage}</span>
                    <span className="tabular-nums text-muted-foreground">
                      planned {entry.planned}d ·{" "}
                      <span
                        className={
                          entry.actual > entry.planned
                            ? "font-semibold text-danger"
                            : "text-success"
                        }
                      >
                        actual {entry.actual}d
                      </span>
                    </span>
                  </div>
                  <div className="mt-1">
                    <ProgressBar
                      value={(entry.planned / Math.max(entry.actual, entry.planned)) * 100}
                      tone={entry.actual > entry.planned * 1.4 ? "danger" : "primary"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="State leaderboard"
          description="Sort by any KPI to rank states and union territories."
        />
        {query.loading ? (
          <LoadingRows rows={8} />
        ) : query.error ? (
          <div className="p-5">
            <ErrorState error={query.error} onRetry={query.refetch} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState />
          </div>
        ) : (
          <TableFrame>
            <TableHeadRow>
              <SortHeader
                label="State / UT"
                sortKey="state"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
              />
              <SortHeader
                label="Projects"
                sortKey="projects"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Notified"
                sortKey="areaNotified"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Acquired"
                sortKey="areaAcquired"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Assessed"
                sortKey="compensationAssessed"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Disbursed %"
                sortKey="disbursementRate"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="R&R complete %"
                sortKey="familiesResettled"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Avg delay"
                sortKey="averageDelay"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <th className="px-4 py-2.5 text-right font-semibold">Status</th>
            </TableHeadRow>
            <tbody className="divide-y divide-border">
              {sorted.map((row, index) => (
                <tr
                  key={row.code}
                  className="cursor-pointer transition-colors hover:bg-muted/60"
                  onClick={() => {
                    setState(row.state);
                    void navigate({ to: "/projects" });
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-md bg-secondary text-[10px] font-bold text-secondary-foreground">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-primary">{row.state}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.projects}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatHectares(row.areaNotified)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatHectares(row.areaAcquired)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCrore(row.compensationAssessed)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="tabular-nums font-semibold text-primary">
                        {formatPercent(row.disbursementRate, 0)}
                      </span>
                      <span className="w-14">
                        <ProgressBar value={row.disbursementRate} tone="accent" />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPercent(row.familiesResettled, 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.averageDelay}d</td>
                  <td className="px-4 py-3 text-right">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
        )}
      </Panel>
    </PageShell>
  );
}
