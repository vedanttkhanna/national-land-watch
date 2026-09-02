import { useMemo } from "react";
import { useMockQuery, type QueryResult } from "@/hooks/use-mock-query";
import { getProjects, type Project } from "@/lib/nlams-data";
import { applyRoleScope, useFilters } from "@/lib/nlams-filters";

export interface ScopedProjectsResult extends QueryResult<Project[]> {
  /** Role-scoped, globally filtered and search-matched projects. */
  rows: Project[];
  /** Role-scoped only — the denominator for "x of y" counts. */
  scoped: Project[];
}

/**
 * The single read path every page uses for project data: fetch through the mock
 * API layer, then narrow by role scope, the global filter bar and the top-bar
 * search term.
 */
export function useScopedProjects(): ScopedProjectsResult {
  const { role, matches, search } = useFilters();
  const query = useMockQuery(getProjects, []);

  const scoped = useMemo(
    () => (query.data ? applyRoleScope(role, query.data) : []),
    [query.data, role],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scoped.filter(matches).filter((project) => {
      if (!term) return true;
      return (
        project.name.toLowerCase().includes(term) ||
        project.state.toLowerCase().includes(term) ||
        project.district.toLowerCase().includes(term) ||
        project.agency.toLowerCase().includes(term) ||
        project.sector.toLowerCase().includes(term) ||
        project.parcels.some((parcel) => parcel.ulpin.toLowerCase().includes(term))
      );
    });
  }, [scoped, matches, search]);

  return { ...query, rows, scoped };
}
