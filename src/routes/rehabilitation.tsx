import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Donut,
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
import { Button } from "@/components/ui/button";
import { useScopedProjects } from "@/hooks/use-projects";
import {
  entitlementTotals,
  formatCompact,
  formatCrore,
  formatNumber,
  formatPercent,
  type EntitlementStatus,
} from "@/lib/nlams-data";

export const Route = createFileRoute("/rehabilitation")({ component: RehabilitationPage });

interface FamilyRow {
  familyId: string;
  project: string;
  state: string;
  category: string;
  entitlement: string;
  status: EntitlementStatus;
}

const PAGE_SIZE = 20;

function RehabilitationPage() {
  const projects = useScopedProjects();
  const [grouping, setGrouping] = useState<"State" | "Project">("State");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const totals = useMemo(() => entitlementTotals(projects.rows), [projects.rows]);
  const totalEntitlements = totals.Pending + totals.Allotted + totals.Completed;

  const familyRows = useMemo<FamilyRow[]>(
    () =>
      projects.rows.flatMap((project) =>
        project.entitlements.map((entitlement) => ({
          familyId: entitlement.familyId,
          project: project.name,
          state: project.state,
          category: entitlement.category,
          entitlement: entitlement.entitlement,
          status: entitlement.status,
        })),
      ),
    [projects.rows],
  );

  const { sorted, sortKey, direction, toggle } = useSort(familyRows, "familyId", "asc");

  const grouped = useMemo(() => {
    const buckets = new Map<string, { Pending: number; Allotted: number; Completed: number }>();
    projects.rows.forEach((project) => {
      const key = grouping === "State" ? project.state : project.name;
      const bucket = buckets.get(key) ?? { Pending: 0, Allotted: 0, Completed: 0 };
      project.entitlements.forEach((entitlement) => {
        bucket[entitlement.status] += 1;
      });
      buckets.set(key, bucket);
    });
    return Array.from(buckets.entries())
      .map(([label, counts]) => ({
        label: label.length > 18 ? `${label.slice(0, 17)}…` : label,
        ...counts,
      }))
      .sort(
        (left, right) =>
          right.Completed +
          right.Allotted +
          right.Pending -
          (left.Completed + left.Allotted + left.Pending),
      )
      .slice(0, 12);
  }, [projects.rows, grouping]);

  const affected = projects.rows.reduce((sum, project) => sum + project.familiesAffected, 0);
  const displaced = projects.rows.reduce((sum, project) => sum + project.familiesDisplaced, 0);
  const housingAllotted = Math.round(displaced * 0.62);
  const livelihoodDisbursed = Math.round(
    projects.rows.reduce((sum, project) => sum + project.compensationPaid, 0) * 0.08,
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Social safeguards"
        title="Rehabilitation & Resettlement"
        description="Entitlement delivery for affected and displaced families under the Second Schedule of the LARR Act, 2013."
      >
        <ExportButton />
      </PageHeader>

      <GlobalFilterBar showStatus={false} />

      {projects.loading ? (
        <KpiSkeleton count={4} />
      ) : projects.error ? (
        <ErrorState error={projects.error} onRetry={projects.refetch} />
      ) : (
        <KpiGrid columns={4}>
          <KpiCard
            label="Affected families"
            value={formatCompact(affected)}
            note="on the R&R register"
          />
          <KpiCard
            label="Displaced families"
            value={formatCompact(displaced)}
            note={`${formatPercent(affected === 0 ? 0 : (displaced / affected) * 100, 0)} of affected`}
            tone="danger"
          />
          <KpiCard
            label="Housing allotted"
            value={formatCompact(housingAllotted)}
            note="plots or constructed units"
            tone="success"
            trend="up"
          />
          <KpiCard
            label="Livelihood support"
            value={formatCrore(livelihoodDisbursed)}
            note="grants and training disbursed"
            tone="accent"
          />
        </KpiGrid>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1.35fr]">
        <Panel>
          <PanelHeader
            title="Entitlement status"
            description="Share of recorded entitlements by delivery stage."
          />
          <div className="p-5">
            {projects.loading ? (
              <ChartSkeleton height={220} />
            ) : totalEntitlements === 0 ? (
              <EmptyState
                title="No entitlement records"
                description="No families are on record for the current filter selection."
              />
            ) : (
              <Donut
                segments={[
                  { label: "Completed", value: totals.Completed, color: CHART_COLORS.success },
                  { label: "Allotted", value: totals.Allotted, color: CHART_COLORS.primary },
                  { label: "Pending", value: totals.Pending, color: CHART_COLORS.accent },
                ]}
                size={200}
                centerLabel="entitlements"
                centerValue={formatNumber(totalEntitlements)}
              />
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title={`Entitlement delivery by ${grouping.toLowerCase()}`}
            description="Stacked breakdown of pending, allotted and completed entitlements."
            action={
              <div className="flex rounded-md border border-border p-0.5">
                {(["State", "Project"] as const).map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={grouping === option ? "default" : "ghost"}
                    className="h-7 px-3 text-[11px]"
                    onClick={() => setGrouping(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            }
          />
          <div className="p-5">
            {projects.loading ? (
              <ChartSkeleton />
            ) : grouped.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={grouped} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                    content={<ChartTooltip formatter={(value) => `${value} families`} />}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="Completed"
                    stackId="a"
                    fill={CHART_COLORS.success}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="Allotted"
                    stackId="a"
                    fill={CHART_COLORS.primary}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="Pending"
                    stackId="a"
                    fill={CHART_COLORS.accent}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Family entitlement tracking"
          description={`${formatNumber(familyRows.length)} family records in the current scope`}
        />
        {projects.loading ? (
          <LoadingRows rows={8} />
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No family records"
              description="Widen the filters to see entitlement records."
            />
          </div>
        ) : (
          <>
            <TableFrame>
              <TableHeadRow>
                <SortHeader
                  label="Family ID"
                  sortKey="familyId"
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
                  label="Category"
                  sortKey="category"
                  activeKey={sortKey}
                  direction={direction}
                  onSort={toggle}
                />
                <SortHeader
                  label="Entitlement"
                  sortKey="entitlement"
                  activeKey={sortKey}
                  direction={direction}
                  onSort={toggle}
                />
                <th className="px-4 py-2.5 text-right font-semibold">Status</th>
              </TableHeadRow>
              <tbody className="divide-y divide-border">
                {sorted.slice(0, visibleCount).map((row) => (
                  <tr key={row.familyId} className="transition-colors hover:bg-muted/60">
                    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-primary">
                      {row.familyId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.project}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.state}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.entitlement}</td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={toStatus(row.status)}>{row.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
            {visibleCount < sorted.length && (
              <div className="flex justify-center border-t border-border p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Show more ({sorted.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </Panel>
    </PageShell>
  );
}
