import { createFileRoute } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  formatCrore,
  formatPercent,
  getDisbursementTrend,
  getPendingDisbursements,
  totalsFor,
  type PendingDisbursement,
} from "@/lib/nlams-data";

export const Route = createFileRoute("/compensation")({ component: CompensationPage });

function CompensationPage() {
  const projects = useScopedProjects();
  const trend = useMockQuery(getDisbursementTrend, []);
  const pending = useMockQuery(getPendingDisbursements, []);

  const totals = useMemo(() => totalsFor(projects.rows), [projects.rows]);
  const visibleIds = useMemo(
    () => new Set(projects.rows.map((project) => project.id)),
    [projects.rows],
  );

  const pendingRows = useMemo<PendingDisbursement[]>(
    () => (pending.data ?? []).filter((row) => visibleIds.has(row.projectId)),
    [pending.data, visibleIds],
  );

  const { sorted, sortKey, direction, toggle } = useSort(pendingRows, "pending");
  const escalated = pendingRows.filter((row) => row.escalated).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Financial monitoring"
        title="Compensation & Disbursement"
        description="Assessed versus disbursed compensation under Sec. 23 awards, with ageing of pending payments."
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
            label="Total assessed"
            value={formatCrore(totals.compensationAssessed)}
            note="across projects in scope"
          />
          <KpiCard
            label="Total disbursed"
            value={formatCrore(totals.compensationPaid)}
            note="credited to beneficiaries"
            tone="success"
            trend="up"
          />
          <KpiCard
            label="Pending disbursement"
            value={formatCrore(totals.compensationAssessed - totals.compensationPaid)}
            note={`${escalated} project${escalated === 1 ? "" : "s"} escalated`}
            tone="danger"
          />
          <KpiCard
            label="% disbursed"
            value={formatPercent(totals.disbursementRate)}
            note="of assessed compensation"
            tone="accent"
          />
        </KpiGrid>
      )}

      <Panel>
        <PanelHeader
          title="Disbursement trend"
          description="Monthly compensation released over the last twelve months (₹ Cr)."
        />
        <div className="p-5">
          {trend.loading ? (
            <ChartSkeleton />
          ) : trend.error ? (
            <ErrorState error={trend.error} onRetry={trend.refetch} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend.data ?? []} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="disbursement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(value: number) => `₹${value}`}
                />
                <Tooltip content={<ChartTooltip formatter={(value) => formatCrore(value)} />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Disbursed"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#disbursement)"
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Pending disbursements"
          description="Awarded compensation awaiting release, aged by days pending."
          action={<ExportButton format="PDF" />}
        />
        {pending.loading || projects.loading ? (
          <LoadingRows rows={8} />
        ) : pending.error ? (
          <div className="p-5">
            <ErrorState error={pending.error} onRetry={pending.refetch} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No pending disbursements"
              description="Every award in this scope has been fully disbursed."
            />
          </div>
        ) : (
          <TableFrame>
            <TableHeadRow>
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
                label="Assessed"
                sortKey="assessed"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Disbursed"
                sortKey="paid"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Pending"
                sortKey="pending"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Days pending"
                sortKey="daysPending"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <th className="px-4 py-2.5 text-right font-semibold">Flag</th>
            </TableHeadRow>
            <tbody className="divide-y divide-border">
              {sorted.map((row) => {
                const share = row.assessed === 0 ? 0 : (row.paid / row.assessed) * 100;
                return (
                  <tr key={row.projectId} className="transition-colors hover:bg-muted/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-primary">{row.project}</div>
                      <div className="mt-1 w-32">
                        <ProgressBar value={share} tone={share > 70 ? "success" : "accent"} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.state}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCrore(row.assessed)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCrore(row.paid)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-danger">
                      {formatCrore(row.pending)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.daysPending}d</td>
                    <td className="px-4 py-3 text-right">
                      {row.escalated ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-[10px] font-semibold text-danger">
                          <TriangleAlert className="size-3" />
                          Escalated
                        </span>
                      ) : (
                        <StatusBadge status={row.daysPending > 45 ? "at-risk" : "on-track"}>
                          {row.daysPending > 45 ? "Ageing" : "Within norms"}
                        </StatusBadge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableFrame>
        )}
      </Panel>
    </PageShell>
  );
}
