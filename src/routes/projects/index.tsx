import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectDetail } from "@/components/project-detail";
import {
  EmptyState,
  ErrorState,
  ExportButton,
  GlobalFilterBar,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useScopedProjects } from "@/hooks/use-projects";
import { formatCrore, formatHectares, formatPercent, type Project } from "@/lib/nlams-data";

export const Route = createFileRoute("/projects/")({ component: ProjectsPage });

interface ProjectRow extends Project {
  completion: number;
}

function ProjectsPage() {
  const projects = useScopedProjects();
  const [selected, setSelected] = useState<Project | null>(null);

  const rows = useMemo<ProjectRow[]>(
    () =>
      projects.rows.map((project) => ({
        ...project,
        completion:
          project.areaNotified === 0 ? 0 : (project.areaAcquired / project.areaNotified) * 100,
      })),
    [projects.rows],
  );

  const { sorted, sortKey, direction, toggle } = useSort(rows, "completion");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Project register"
        title="Project-wise Progress"
        description="Every notified acquisition project with area, stage and compensation position. Select a row for the full project record."
      >
        <ExportButton />
        <ExportButton format="PDF" />
      </PageHeader>

      <GlobalFilterBar />

      <Panel>
        <PanelHeader
          title="All projects"
          description={`${rows.length} of ${projects.scoped.length} projects match the current filters`}
        />
        {projects.loading ? (
          <LoadingRows rows={8} />
        ) : projects.error ? (
          <div className="p-5">
            <ErrorState error={projects.error} onRetry={projects.refetch} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState />
          </div>
        ) : (
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
                label="Sector"
                sortKey="sector"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
              />
              <SortHeader
                label="Requiring body"
                sortKey="agency"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
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
                label="% complete"
                sortKey="completion"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
                align="right"
              />
              <SortHeader
                label="Current stage"
                sortKey="stage"
                activeKey={sortKey}
                direction={direction}
                onSort={toggle}
              />
              <th className="px-4 py-2.5 text-right font-semibold">Status</th>
            </TableHeadRow>
            <tbody className="divide-y divide-border">
              {sorted.map((project) => (
                <tr
                  key={project.id}
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                  onClick={() => setSelected(project)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelected(project);
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary">{project.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {project.district} · {formatCrore(project.compensationPaid)} disbursed
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{project.state}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project.sector}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project.agency}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {formatHectares(project.areaNotified)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {formatHectares(project.areaAcquired)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="tabular-nums font-semibold text-primary">
                        {formatPercent(project.completion, 0)}
                      </span>
                      <span className="w-16">
                        <ProgressBar
                          value={project.completion}
                          tone={
                            project.completion > 75
                              ? "success"
                              : project.completion > 40
                                ? "primary"
                                : "accent"
                          }
                        />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{project.stage}</td>
                  <td className="px-4 py-3 text-right">
                    <StatusBadge status={project.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
        )}
      </Panel>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
          {selected && (
            <>
              <SheetHeader className="pb-0">
                <SheetTitle className="text-primary">{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.district}, {selected.state} · {selected.sector} · {selected.agency}
                </SheetDescription>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: selected.id }}
                  className="inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold text-accent hover:underline"
                >
                  Open full project page
                  <ExternalLink className="size-3" />
                </Link>
              </SheetHeader>
              <div className="px-4 pb-6">
                <ProjectDetail project={selected} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
