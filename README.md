# Landtrack India

Build a web-based National Land Acquisition & Management System (NLAMS) Dashboard— a government-grade MIS and analytics interface for tracking land acquisition projects across India. This is the executive/administrative dashboard layer of a larger backend system; you are building the frontend UI with mock/sample data wired through a clean data layer I can later connect to a real API.

## Overall Purpose

Central Ministries, State Governments, District Authorities, and Project Implementing Agencies need a single national view of land acquisition progress — replacing fragmented, state-specific manual tracking. The dashboard must let a Joint Secretary in Delhi and a District Collector in a state see the same data at different levels of granularity, in real time.

## Visual Style

- Clean, serious, **government/institutional aesthetic** — not a flashy consumer SaaS look. Think NIC/Digital India portal quality, but modern.

- Primary palette: navy/indigo (#1E3A5F or similar) as the dominant brand color, with a muted saffron/amber accent (#D97706-ish) used sparingly for alerts and highlights, and a clean off-white/light-gray background (#F5F6F8).

- Use a status-color system consistently across the whole app: green = on track/completed, amber = at risk/pending, red = delayed/blocked, gray = not yet started.

- Typography: a clean sans-serif (Inter or similar), strong numeric emphasis for KPI figures (tabular-nums, large weight).

- Data-dense but not cluttered — generous whitespace between card groups, clear section headers, sticky top navigation.

- Fully responsive; must work well on a tablet for field-level district officers as well as a large desktop monitor for the national command view.

## Information Architecture / Pages

### 1. National Overview (home/landing page)

- Top KPI strip (4–6 large stat cards): Total projects active, Total area notified (hectares), Total area acquired (hectares), Total compensation disbursed (₹ Cr), Total affected families, Total displaced families.

- **Interactive India map** (choropleth by state) showing acquisition progress intensity per state — clicking a state drills into the State View. Use a placeholder India TopoJSON/GeoJSON and mock state-wise data.

- A horizontal timeline/funnel visual showing national totals moving through stages: Proposed → Notified (Sec. 11) → Declared (Sec. 19) → Awarded (Sec. 23) → Compensation Paid → Possession Taken.

- "Projects at risk" panel: a sortable table of projects with delayed milestones or stalled objections, with a status badge and days-overdue count.

- Recent activity feed: latest notifications issued, awards declared, possessions taken (mock real-time feed, newest at top).

### 2. Project-wise Progress

- Filterable, sortable data table of all projects (Project name, State, Sector — highway/rail/irrigation/industrial/renewable/urban, Land Requiring Body, Area notified, Area acquired, % complete, Current stage, Status badge).

- Filters: by state, by sector, by status, by date range.

- Clicking a project row opens a **Project Detail drawer/page** with:

  - Project metadata and implementing agency

  - A stage-by-stage progress tracker (visual stepper matching: Proposal → Sec 11 → Title/Friction Check → Sec 19 → Objections → Sec 23 Award → Payment → Possession → Post-possession monitoring)

  - Parcel-level breakdown table (parcel ULPIN, area, owner status, friction score badge, compensation status)

  - Small embedded map showing the project's parcel geometries

  - R&R status sub-panel: affected families count, displaced families count, entitlement status breakdown (pending/allotted/completed) as a simple progress bar or donut

### 3. State-wise Progress

- Similar structure to Project-wise, but aggregated per state/UT: total projects, area notified vs acquired, compensation disbursed vs assessed, R&R completion %, average processing time per stage.

- Bar chart comparing states side-by-side on a selectable metric (area acquired, disbursement %, families resettled, average delay days).

- State ranking/leaderboard table sortable by any KPI.

### 4. Compensation & Disbursement

- KPI cards: Total assessed, Total disbursed, Pending disbursement, % disbursed.

- Line/area chart of disbursement trend over time (monthly, last 12 months, mock data).

- Table of pending disbursements with days-pending and escalation flag.

### 5. Rehabilitation & Resettlement (R&R)

- KPI cards: Total affected families, Total displaced families, Housing allotted, Livelihood support disbursed.

- Donut/stacked bar of entitlement status (pending / allotted / completed) — state-wise and project-wise toggle.

- Table of family-level entitlement tracking (mock data): Family ID, Project, State, Category (agricultural/non-agricultural), Entitlement type, Status.

### 6. Objections & Citizen Engagement

- KPI cards: Total objections received, Resolved, Pending, Average resolution time.

- Theme-clustered bar chart: objections by category (Valuation, Boundaries, R&R/Housing, Environmental).

- Table of open objections with project, theme, days pending, and status.

### 7. Timeline & Milestone Monitoring

- Gantt-style or milestone-timeline view per project showing planned vs actual dates for each statutory stage (Sec 11, Sec 19, Sec 23, Possession).

- Highlight overdue milestones in red with days-overdue.

- Filter by state/sector/status.

### 8. Reports & Analytics (MIS)

- A report-builder style panel: select metric, group-by (state/project/sector/time), date range, chart type (bar/line/table) → generates a preview chart.

- "Export" buttons (PDF/CSV — can be non-functional stubs for now, just wire the UI).

- Include a couple of pre-built example report cards (e.g. "Monthly National Progress Report", "State Compliance Summary") the user can click to preview.

## Cross-cutting UI Requirements

- **Persistent left sidebar navigation** with icons for each page listed above, collapsible on smaller screens.

- **Top bar**: search, notification bell (with a mock dropdown of alerts — "Section 101 reversion alert for Project X", "Objection deadline approaching"), user role indicator/avatar (mock roles: Central Ministry Admin, State Officer, District Collector, Project Agency — role should change what's visible, e.g. a District view is scoped to one district's projects only — you can fake this with a role switcher dropdown for demo purposes).

- **Global filter bar** on data-heavy pages (state, sector, date range) that persists as you navigate between related pages.

- Loading skeletons for all data-driven components, not blank flashes.

- Empty and error states designed, not just omitted.

- All charts should have accessible tooltips on hover showing exact figures.

- Status badges must be a single small reusable component used consistently everywhere (project stage, objection status, R&R status, milestone status) — build this once, reuse everywhere.

## Data Layer

- Set up a clean, typed mock data layer (e.g. a `/data` or `/lib/mock-data` folder with realistic sample JSON: ~15–20 mock projects spread across 6–8 states, covering highways/rail/irrigation/industrial/urban/renewable sectors, with parcel-level and family-level nested mock records) so every screen renders with believable data out of the box.

- Structure the mock data and types so it's obvious where a real backend API call would later replace the mock fetch (e.g. a single `getProjects()`, `getStateStats()`, `getProject(id)` function layer, not data scattered inline in components).

- Use realistic Indian project names, state names, and ₹ Crore figures — not lorem ipsum.

## Tech Preferences

- React with TypeScript.

- Use a clean component library (shadcn/ui style) for tables, cards, tabs, badges, drawers/dialogs.

- Use Recharts (or similar) for all charts.

- Use a lightweight map library compatible with static GeoJSON (no need for a paid maps API key) for the India choropleth and project parcel maps.

## What NOT to build right now

- No real authentication — a role-switcher dropdown that changes the visible scope is enough.

- No real backend/API — mock data only, but structured so it's easy to swap in real calls later.

- No file upload / document management UI yet — that's a separate module I'll prompt for later.

Build the National Overview page first and get it polished, then scaffold the other pages with the sidebar navigation working end-to-end, even if some pages are simpler first drafts.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eff9510b-04b8-4c40-afa7-6bf98f1f840c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
