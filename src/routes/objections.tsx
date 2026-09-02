import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  SortHeader,
  StatusBadge,
  TableFrame,
  TableHeadRow,
  toStatus,
  useSort,
} from "@/components/nlams-ui";
import { useMockQuery } from "@/hooks/use-mock-query";
import { useScopedProjects } from "@/hooks/use-projects";
import { formatNumber, getObjections, type Objection } from "@/lib/nlams-data";

export const Route = createFileRoute("/objections")({ component: ObjectionsPage });

const THEMES = ["Valuation", "Boundaries", "R&R / Housing", "Environmental"] as const;

function ObjectionsPage() {
  const query = useMockQuery(getObjections, []);
  const projects = useScopedProjects();

  const visibleIds = useMemo(
    () => new Set(projects.rows.map((project) => project.id)),
    [projects.rows],
  );
  const rows = useMemo<Objection[]>(
    () => (query.data ?? []).filter((objection) => visibleIds.has(objection.projectId)),
    [query.data, visibleIds],
  );

  const open = useMemo(() => rows.filter((objection) => objection.status !== "Resolved"), [rows]);
  const resolved = rows.length - open.length;
  const averageResolution =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((sum, row) => sum + row.daysPending, 0) / rows.length);

  const byTheme = useMemo(
    () =>
      THEMES.map((theme) => {
        const themeRows = rows.filter((objection) => objection.theme === theme);
        return {
          theme,
          Resolved: themeRows.filter((objection) => objection.status === "Resolved").length,
          "Under hearing": themeRows.filter((objection) => objection.status === "Under hearing")
            .length,
          Open: themeRows.filter((objection) => objection.status === "Open").length,
        };
      }),
    [rows],
  );

  const { sorted, sortKey, direction, toggle } = useSort(open, "daysPending");
  const loading = query.loading || projects.loading;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Citizen engagement"
        title="Objections & Citizen Engagement"
        description="Objections filed under Sec. 15 and Sec. 21, their thematic distribution and resolution ageing."
      >
        <ExportButton />
      </PageHeader>

      <GlobalFilterBar showStatus={false} />

      {loading ? (
        <KpiSkeleton count={4} />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : (
        <KpiGrid columns={4}>
          <KpiCard
            label="Objections received"
            value={formatNumber(rows.length)}
            note="across projects in scope"
          />
          <KpiCard
            label="Resolved"
            value={formatNumber(resolved)}
            note={`${rows.length === 0 ? 0 : Math.round((resolved / rows.length) * 100)}% closure rate`}
            tone="success"
            trend="up"
          />
          <KpiCard
            label="Pending"
            value={formatNumber(open.length)}
            note="open or under hearing"
            tone="danger"
          />
          <KpiCard
            label="Avg resolution time"
            value={`${averageResolution} days`}
            note="statutory norm: 60 days"
            tone="accent"
          />
        </KpiGrid>
      )}

      <Panel>
        <PanelHeader
          title="Objections by theme"
          description="Thematic clustering of grievances with their current disposal status."
        />
        <div className="p-5">
          {loading ? (
            <ChartSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No objections recorded"
              description="No objections match the current scope and filters."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byTheme} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="theme"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                  content={<ChartTooltip formatter={(value) => `${value} objections`} />}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="Resolved"
                  fill={CHART_COLORS.success}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="Under hearing"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="Open"
                  fill={CHART_COLORS.accent}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Open objections"
          description="Objections awaiting hearing or disposal, aged by days pending."
        />
        {loading ? (
          <LoadingRows rows={8} />
        ) : query.error ? (
          <div className="p-5">
            <ErrorState error={query.error} onRetry={query.refetch} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No open objections"
              description="Every objection in this scope has been disposed of."
            />
          </div>
        ) : (
          <TableFrame>
            <TableHeadRow>
              <SortHeader
                label="Objection"
                sortKey="id"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
              />
              <SortHeader
                label="Project"
                sortKey="project"
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
                label="Theme"
                sortKey="theme"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
              />
              <SortHeader
                label="Raised by"
                sortKey="raisedBy"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
              />
              <SortHeader
                label="Days pending"
                sortKey="daysPending"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <th className="px-4 py-2.5 text-right font-semibold">Status</th>
            </TableHeadRow>
            <tbody className="divide-y divide-border">
              {sorted.map((objection) => (
                <tr key={objection.id} className="transition-colors hover:bg-muted/60">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-primary">
                    {objection.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{objection.project}</td>
                  <td className="px-4 py-3 text-muted-foreground">{objection.state}</td>
                  <td className="px-4 py-3 text-muted-foreground">{objection.theme}</td>
                  <td className="px-4 py-3 text-muted-foreground">{objection.raisedBy}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        objection.daysPending > 60
                          ? "font-semibold tabular-nums text-danger"
                          : "tabular-nums text-foreground"
                      }
                    >
                      {objection.daysPending}d
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StatusBadge status={toStatus(objection.status)}>
                      {objection.status}
                    </StatusBadge>
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
