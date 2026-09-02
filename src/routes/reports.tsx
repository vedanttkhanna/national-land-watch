import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  LineChart as LineChartIcon,
  Table2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  FilterSelect,
  PageHeader,
  PageShell,
  Panel,
  PanelHeader,
  TableFrame,
  TableHeadRow,
} from "@/components/nlams-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScopedProjects } from "@/hooks/use-projects";
import {
  formatCompact,
  formatCrore,
  formatHectares,
  formatNumber,
  monthlyDisbursement,
  reportPresets,
  type Project,
} from "@/lib/nlams-data";
import { DATE_RANGES, useFilters, type DateRange } from "@/lib/nlams-filters";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const METRICS = {
  "Area notified (ha)": {
    read: (project: Project) => project.areaNotified,
    format: formatHectares,
  },
  "Area acquired (ha)": {
    read: (project: Project) => project.areaAcquired,
    format: formatHectares,
  },
  "Compensation assessed (₹ Cr)": {
    read: (project: Project) => project.compensationAssessed,
    format: formatCrore,
  },
  "Compensation disbursed (₹ Cr)": {
    read: (project: Project) => project.compensationPaid,
    format: formatCrore,
  },
  "Affected families": {
    read: (project: Project) => project.familiesAffected,
    format: formatNumber,
  },
  "Displaced families": {
    read: (project: Project) => project.familiesDisplaced,
    format: formatNumber,
  },
} as const;

type MetricLabel = keyof typeof METRICS;
const GROUPINGS = ["State", "Sector", "Project", "Month"] as const;
type Grouping = (typeof GROUPINGS)[number];
const CHART_TYPES = ["Bar", "Line", "Table"] as const;
type ChartType = (typeof CHART_TYPES)[number];

function ReportsPage() {
  const projects = useScopedProjects();
  const { dateRange, setDateRange } = useFilters();
  const [metric, setMetric] = useState<MetricLabel>("Area acquired (ha)");
  const [grouping, setGrouping] = useState<Grouping>("State");
  const [chartType, setChartType] = useState<ChartType>("Bar");
  const [exportNote, setExportNote] = useState<string | null>(null);

  const activeMetric = METRICS[metric];

  const dataset = useMemo(() => {
    if (grouping === "Month") {
      const scale = activeMetric.read === METRICS["Compensation disbursed (₹ Cr)"].read ? 1 : 12;
      return monthlyDisbursement.map((entry) => ({
        label: entry.month,
        value: entry.amount * scale,
      }));
    }
    const buckets = new Map<string, number>();
    projects.rows.forEach((project) => {
      const key =
        grouping === "State"
          ? project.state
          : grouping === "Sector"
            ? project.sector
            : project.name;
      buckets.set(key, (buckets.get(key) ?? 0) + activeMetric.read(project));
    });
    return Array.from(buckets.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 14);
  }, [projects.rows, grouping, activeMetric]);

  const applyPreset = (preset: (typeof reportPresets)[number]) => {
    const metricMatch = (Object.keys(METRICS) as MetricLabel[]).find((label) =>
      label.startsWith(preset.metric.split(" (")[0] ?? ""),
    );
    if (metricMatch) setMetric(metricMatch);
    if ((GROUPINGS as readonly string[]).includes(preset.groupBy))
      setGrouping(preset.groupBy as Grouping);
    setChartType(preset.chart === "bar" ? "Bar" : preset.chart === "line" ? "Line" : "Table");
    setExportNote(`Loaded preset “${preset.title}” into the report builder.`);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="MIS reporting"
        title="Reports & Analytics"
        description="Build an ad-hoc management report, preview it, and export it for circulation."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportPresets.map((preset) => (
          <Card
            key={preset.id}
            className="gap-0 p-4 transition-shadow hover:shadow-[0_16px_32px_-24px_var(--color-primary)]"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                {preset.chart === "line" ? (
                  <LineChartIcon className="size-4" />
                ) : preset.chart === "table" ? (
                  <Table2 className="size-4" />
                ) : (
                  <BarChart3 className="size-4" />
                )}
              </span>
              <div>
                <h3 className="text-xs font-bold text-primary">{preset.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {preset.description}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => applyPreset(preset)}
            >
              Preview report
            </Button>
          </Card>
        ))}
      </div>

      <Panel>
        <PanelHeader
          title="Report builder"
          description="Select a metric, a grouping and an output format to generate a preview."
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExportNote("CSV export queued — wire this to the reporting service.")
                }
              >
                <FileSpreadsheet />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExportNote("PDF export queued — wire this to the reporting service.")
                }
              >
                <FileText />
                Export PDF
              </Button>
            </div>
          }
        />
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/40 p-4">
          <FilterSelect
            label="Metric"
            value={metric}
            options={Object.keys(METRICS)}
            onChange={(value) => setMetric(value as MetricLabel)}
          />
          <FilterSelect
            label="Group by"
            value={grouping}
            options={GROUPINGS}
            onChange={(value) => setGrouping(value as Grouping)}
          />
          <FilterSelect
            label="Date range"
            value={dateRange}
            options={DATE_RANGES}
            onChange={(value) => setDateRange(value as DateRange)}
          />
          <FilterSelect
            label="Chart type"
            value={chartType}
            options={CHART_TYPES}
            onChange={(value) => setChartType(value as ChartType)}
          />
        </div>

        {exportNote && (
          <div className="border-b border-border bg-accent/10 px-5 py-2 text-[11px] font-medium text-accent">
            {exportNote}
            <button className="ml-2 underline" onClick={() => setExportNote(null)}>
              dismiss
            </button>
          </div>
        )}

        <div className="p-5">
          {projects.loading ? (
            <ChartSkeleton height={320} />
          ) : projects.error ? (
            <ErrorState error={projects.error} onRetry={projects.refetch} />
          ) : dataset.length === 0 ? (
            <EmptyState
              title="Nothing to report"
              description="No records match the current scope, so this report has no rows."
            />
          ) : chartType === "Table" ? (
            <TableFrame>
              <TableHeadRow>
                <th className="px-4 py-2.5 font-semibold">{grouping}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{metric}</th>
                <th className="px-4 py-2.5 text-right font-semibold">Share</th>
              </TableHeadRow>
              <tbody className="divide-y divide-border">
                {dataset.map((row) => {
                  const total = dataset.reduce((sum, entry) => sum + entry.value, 0) || 1;
                  return (
                    <tr key={row.label} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-semibold text-primary">{row.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {activeMetric.format(row.value)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {((row.value / total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableFrame>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              {chartType === "Bar" ? (
                <BarChart data={dataset} margin={{ top: 8, right: 8, bottom: 60, left: 8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(value: number) => formatCompact(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                    content={<ChartTooltip formatter={(value) => activeMetric.format(value)} />}
                  />
                  <Bar
                    dataKey="value"
                    name={metric}
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <LineChart data={dataset} margin={{ top: 8, right: 8, bottom: 60, left: 8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(value: number) => formatCompact(value)}
                  />
                  <Tooltip
                    content={<ChartTooltip formatter={(value) => activeMetric.format(value)} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={metric}
                    stroke={CHART_COLORS.accent}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        <p className="border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
          Report scope: {projects.rows.length} projects · {dateRange} · exports are UI stubs pending
          the reporting service.
        </p>
      </Panel>
    </PageShell>
  );
}
