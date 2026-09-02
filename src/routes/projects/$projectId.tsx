import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProjectDetail } from "@/components/project-detail";
import {
  AsyncSection,
  EmptyState,
  ExportButton,
  LoadingRows,
  PageHeader,
  PageShell,
} from "@/components/nlams-ui";
import { Button } from "@/components/ui/button";
import { useMockQuery } from "@/hooks/use-mock-query";
import { getProject } from "@/lib/nlams-data";

export const Route = createFileRoute("/projects/$projectId")({ component: ProjectPage });

function ProjectPage() {
  const { projectId } = useParams({ from: "/projects/$projectId" });
  const query = useMockQuery(() => getProject(projectId), [projectId]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Project record"
        title="Project Detail"
        description="Complete statutory, parcel and R&R position for a single project."
      >
        <Button variant="outline" size="sm" asChild>
          <Link to="/projects">
            <ArrowLeft />
            All projects
          </Link>
        </Button>
        <ExportButton format="PDF" />
      </PageHeader>

      <AsyncSection
        query={query}
        skeleton={<LoadingRows rows={8} />}
        isEmpty={(project) => project === undefined}
        empty={
          <EmptyState
            title="Project not found"
            description="This project record is not available in the current scope."
          />
        }
      >
        {(project) => (project ? <ProjectDetail project={project} /> : null)}
      </AsyncSection>
    </PageShell>
  );
}
