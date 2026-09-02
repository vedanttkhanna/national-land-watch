import { Building2, Check, MapPin, Users } from "lucide-react";
import { useMemo } from "react";
import {
  CHART_COLORS,
  Donut,
  FrictionBadge,
  MiniStat,
  Panel,
  PanelHeader,
  ProgressBar,
  StatusBadge,
  TableFrame,
  TableHeadRow,
  toStatus,
} from "@/components/nlams-ui";
import { parcelGeometry } from "@/lib/india-geo";
import {
  STAGES,
  formatCompact,
  formatCrore,
  formatHectares,
  formatNumber,
  formatPercent,
  type EntitlementStatus,
  type Project,
} from "@/lib/nlams-data";
import { cn } from "@/lib/utils";

export function ProjectDetail({ project }: { project: Project }) {
  const completion =
    project.areaNotified === 0 ? 0 : (project.areaAcquired / project.areaNotified) * 100;
  const disbursed =
    project.compensationAssessed === 0
      ? 0
      : (project.compensationPaid / project.compensationAssessed) * 100;

  const entitlementSplit = useMemo(() => {
    const totals: Record<EntitlementStatus, number> = { Pending: 0, Allotted: 0, Completed: 0 };
    project.entitlements.forEach((entitlement) => {
      totals[entitlement.status] += 1;
    });
    return totals;
  }, [project.entitlements]);

  return (
    <div className="space-y-5">
      {/* Metadata */}
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-primary">{project.name}</h3>
              <StatusBadge status={project.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {project.district}, {project.state}
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3" />
                {project.agency}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" />
                {formatNumber(project.familiesAffected)} affected families
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Current stage
            </div>
            <div className="text-sm font-bold text-primary">{project.stage}</div>
            {project.daysOverdue ? (
              <div className="text-[11px] font-semibold text-danger">
                {project.daysOverdue} days overdue
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat label="Sector" value={project.sector} />
          <MiniStat label="Area notified" value={formatHectares(project.areaNotified)} />
          <MiniStat
            label="Area acquired"
            value={formatHectares(project.areaAcquired)}
            tone="success"
          />
          <MiniStat
            label="Compensation paid"
            value={formatCrore(project.compensationPaid)}
            tone="accent"
          />
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Acquisition completion</span>
              <span className="font-semibold tabular-nums text-primary">
                {formatPercent(completion)}
              </span>
            </div>
            <div className="mt-1">
              <ProgressBar value={completion} tone="success" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>
                Compensation disbursed of {formatCrore(project.compensationAssessed)} assessed
              </span>
              <span className="font-semibold tabular-nums text-primary">
                {formatPercent(disbursed)}
              </span>
            </div>
            <div className="mt-1">
              <ProgressBar value={disbursed} tone="accent" />
            </div>
          </div>
        </div>
      </div>

      <StageStepper currentStage={project.stage} status={project.status} />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeader
            title="Parcel-level breakdown"
            description="ULPIN-wise ownership, friction and compensation position."
          />
          <TableFrame>
            <TableHeadRow>
              <th className="px-4 py-2.5 font-semibold">ULPIN</th>
              <th className="px-4 py-2.5 text-right font-semibold">Area (ha)</th>
              <th className="px-4 py-2.5 font-semibold">Owner status</th>
              <th className="px-4 py-2.5 font-semibold">Friction</th>
              <th className="px-4 py-2.5 text-right font-semibold">Compensation</th>
            </TableHeadRow>
            <tbody className="divide-y divide-border">
              {project.parcels.map((parcel) => (
                <tr key={parcel.ulpin} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-primary">
                    {parcel.ulpin}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {parcel.area.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={toStatus(parcel.ownerStatus)}>
                      {parcel.ownerStatus}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <FrictionBadge score={parcel.frictionScore} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StatusBadge status={toStatus(parcel.compensation)}>
                      {parcel.compensation}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
        </Panel>

        <Panel>
          <PanelHeader
            title="Parcel geometry"
            description="Indicative plot layout — placeholder geometry pending survey import."
          />
          <div className="p-5">
            <ParcelMap project={project} />
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Rehabilitation & Resettlement"
          description="Entitlement position for families on this project's record."
        />
        <div className="grid gap-6 p-5 lg:grid-cols-[auto_1fr]">
          <Donut
            segments={[
              {
                label: "Completed",
                value: entitlementSplit.Completed,
                color: CHART_COLORS.success,
              },
              { label: "Allotted", value: entitlementSplit.Allotted, color: CHART_COLORS.primary },
              { label: "Pending", value: entitlementSplit.Pending, color: CHART_COLORS.accent },
            ]}
            centerLabel="entitlements"
            centerValue={formatNumber(project.entitlements.length)}
          />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Affected families" value={formatCompact(project.familiesAffected)} />
              <MiniStat
                label="Displaced families"
                value={formatCompact(project.familiesDisplaced)}
                tone="danger"
              />
            </div>
            <div className="space-y-2 rounded-lg border border-border p-3">
              {(["Completed", "Allotted", "Pending"] as EntitlementStatus[]).map((status) => {
                const share =
                  project.entitlements.length === 0
                    ? 0
                    : (entitlementSplit[status] / project.entitlements.length) * 100;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{status}</span>
                      <span className="font-semibold tabular-nums text-primary">
                        {formatPercent(share, 0)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar
                        value={share}
                        tone={
                          status === "Completed"
                            ? "success"
                            : status === "Pending"
                              ? "accent"
                              : "primary"
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Last recorded activity: {project.lastActivity}
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/** Stage-by-stage statutory tracker. */
export function StageStepper({
  currentStage,
  status,
}: {
  currentStage: string;
  status: Project["status"];
}) {
  const activeIndex = Math.max(
    STAGES.findIndex((stage) => stage === currentStage),
    currentStage === "R&R Allotment" ? STAGES.indexOf("Compensation") : 0,
  );

  return (
    <Panel>
      <PanelHeader
        title="Statutory progress"
        description="Stage tracker under the LARR Act, 2013."
      />
      <div className="overflow-x-auto p-5">
        <ol className="flex min-w-[820px] items-start">
          {STAGES.map((stage, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={stage} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      index === 0 ? "bg-transparent" : done || active ? "bg-primary" : "bg-border",
                    )}
                  />
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold",
                      done
                        ? "border-success bg-success text-white"
                        : active
                          ? cn(
                              "border-accent bg-accent text-accent-foreground",
                              status === "delayed" && "border-danger bg-danger text-white",
                            )
                          : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      index === STAGES.length - 1
                        ? "bg-transparent"
                        : done
                          ? "bg-primary"
                          : "bg-border",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 px-1 text-[10px] leading-tight",
                    active ? "font-bold text-primary" : "text-muted-foreground",
                  )}
                >
                  {stage}
                </span>
                {active && (
                  <span className="mt-1">
                    <StatusBadge status={status} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Panel>
  );
}

function ParcelMap({ project }: { project: Project }) {
  const seed = project.id.charCodeAt(project.id.length - 1);
  const plots = parcelGeometry(seed, project.parcels.length);

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-auto w-full rounded-lg border border-border bg-muted/40"
      role="img"
      aria-label="Project parcel map"
    >
      <defs>
        <pattern id={`grid-${project.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 L0 0 0 10" fill="none" stroke="var(--color-border)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#grid-${project.id})`} />
      <path
        d="M0 62 C 20 56, 34 70, 52 64 S 84 52, 100 58"
        fill="none"
        stroke="var(--color-ring)"
        strokeWidth="1.2"
        opacity="0.5"
      />
      {plots.map((plot, index) => {
        const parcel = project.parcels[index];
        const tone =
          parcel === undefined
            ? CHART_COLORS.muted
            : parcel.compensation === "Paid"
              ? CHART_COLORS.success
              : parcel.compensation === "Pending"
                ? CHART_COLORS.accent
                : CHART_COLORS.primary;
        return (
          <g key={plot.d}>
            <path d={plot.d} fill={tone} fillOpacity={0.28} stroke={tone} strokeWidth="0.7">
              <title>
                {parcel
                  ? `${parcel.ulpin} · ${parcel.area} ha · ${parcel.compensation} · friction ${parcel.frictionScore}`
                  : "Parcel"}
              </title>
            </path>
            <text
              x={plot.cx}
              y={plot.cy}
              textAnchor="middle"
              className="fill-[var(--color-primary)] text-[3px] font-bold"
            >
              P{index + 1}
            </text>
          </g>
        );
      })}
      <text x="4" y="96" className="fill-[var(--color-muted-foreground)] text-[3px]">
        Indicative geometry · not to scale
      </text>
    </svg>
  );
}
