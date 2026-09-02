import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { projects as allProjects, type Project, type Sector, type Status } from "@/lib/nlams-data";

export const ROLES = [
  {
    id: "central",
    label: "Central Ministry Admin",
    scope: "National",
    initials: "JS",
    detail: "All 28 states & 8 UTs in view",
  },
  {
    id: "state",
    label: "State Officer · Maharashtra",
    scope: "Maharashtra",
    initials: "SO",
    detail: "State-level scope",
    state: "Maharashtra",
  },
  {
    id: "district",
    label: "District Collector · Pune",
    scope: "Pune district",
    initials: "DC",
    detail: "District-level scope",
    district: "Pune",
  },
  {
    id: "agency",
    label: "Project Agency · NHAI",
    scope: "NHAI projects",
    initials: "PA",
    detail: "Agency-level scope",
    agency: "NHAI",
  },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];
export type Role = (typeof ROLES)[number];

export const DATE_RANGES = ["Last 30 days", "Last 90 days", "FY 2025–26", "All time"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export const ANY = "All";

interface FilterState {
  state: string;
  sector: string;
  status: string;
  dateRange: DateRange;
  search: string;
}

interface FilterContextValue extends FilterState {
  role: Role;
  setRole: (id: RoleId) => void;
  setState: (value: string) => void;
  setSector: (value: string) => void;
  setStatus: (value: string) => void;
  setDateRange: (value: DateRange) => void;
  setSearch: (value: string) => void;
  reset: () => void;
  activeFilterCount: number;
  /** Projects visible to the current role, before page-level filters. */
  scopedProjects: Project[];
  /** Projects visible after role scope + the global filter bar. */
  filteredProjects: Project[];
  /** Apply the global filters to any row that carries a state/sector/status. */
  matches: (row: { state?: string; sector?: Sector; status?: Status }) => boolean;
}

const defaults: FilterState = {
  state: ANY,
  sector: ANY,
  status: ANY,
  dateRange: "FY 2025–26",
  search: "",
};

const FilterContext = createContext<FilterContextValue | null>(null);

/** Narrow any project list to what the given role is allowed to see. */
export const applyRoleScope = (role: Role, rows: Project[]): Project[] => {
  if (role.id === "state") return rows.filter((project) => project.state === "Maharashtra");
  if (role.id === "district") return rows.filter((project) => project.district === "Pune");
  if (role.id === "agency") return rows.filter((project) => project.agency.includes("NHAI"));
  return rows;
};

export function NlamsFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaults);
  const [roleId, setRoleId] = useState<RoleId>("central");

  const role = useMemo(() => ROLES.find((entry) => entry.id === roleId) ?? ROLES[0], [roleId]);
  const scopedProjects = useMemo(() => applyRoleScope(role, allProjects), [role]);

  const matches = useCallback(
    (row: { state?: string; sector?: Sector; status?: Status }) =>
      (filters.state === ANY || row.state === filters.state) &&
      (filters.sector === ANY || row.sector === filters.sector) &&
      (filters.status === ANY || row.status === filters.status),
    [filters.state, filters.sector, filters.status],
  );

  const filteredProjects = useMemo(() => scopedProjects.filter(matches), [scopedProjects, matches]);

  const value = useMemo<FilterContextValue>(
    () => ({
      ...filters,
      role,
      setRole: setRoleId,
      setState: (state) => setFilters((current) => ({ ...current, state })),
      setSector: (sector) => setFilters((current) => ({ ...current, sector })),
      setStatus: (status) => setFilters((current) => ({ ...current, status })),
      setDateRange: (dateRange) => setFilters((current) => ({ ...current, dateRange })),
      setSearch: (search) => setFilters((current) => ({ ...current, search })),
      reset: () => setFilters(defaults),
      activeFilterCount: [filters.state, filters.sector, filters.status].filter(
        (entry) => entry !== ANY,
      ).length,
      scopedProjects,
      filteredProjects,
      matches,
    }),
    [filters, role, scopedProjects, filteredProjects, matches],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters must be used inside <NlamsFilterProvider>");
  return context;
}

/** States available in the filter dropdown, narrowed by the active role scope. */
export function useScopedStates(): string[] {
  const { scopedProjects } = useFilters();
  return useMemo(
    () => Array.from(new Set(scopedProjects.map((project) => project.state))).sort(),
    [scopedProjects],
  );
}
