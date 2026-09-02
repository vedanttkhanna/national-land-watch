export type Status = "on-track" | "at-risk" | "delayed" | "not-started" | "completed";
export type Sector = "Highway" | "Rail" | "Irrigation" | "Industrial" | "Renewable" | "Urban";

export interface Parcel {
  ulpin: string;
  area: number;
  ownerStatus: "Verified" | "Pending verification" | "Disputed";
  frictionScore: number;
  compensation: "Paid" | "Pending" | "Under assessment";
}

export interface FamilyEntitlement {
  familyId: string;
  category: "Agricultural" | "Non-agricultural";
  entitlement: "Housing plot" | "Livelihood grant" | "House construction" | "Training";
  status: "Pending" | "Allotted" | "Completed";
}

export interface Project {
  id: string;
  name: string;
  state: string;
  code: string;
  sector: Sector;
  agency: string;
  district: string;
  areaNotified: number;
  areaAcquired: number;
  compensationAssessed: number;
  compensationPaid: number;
  familiesAffected: number;
  familiesDisplaced: number;
  stage: string;
  status: Status;
  daysOverdue?: number;
  riskReason?: string;
  lastActivity: string;
  parcels: Parcel[];
  entitlements: FamilyEntitlement[];
}

export interface StateStat {
  state: string;
  code: string;
  projects: number;
  areaNotified: number;
  areaAcquired: number;
  compensationAssessed: number;
  compensationPaid: number;
  familiesResettled: number;
  averageDelay: number;
  status: Status;
}

const parcelSet = (seed: string, count: number): Parcel[] =>
  Array.from({ length: count }, (_, index) => ({
    ulpin: `${seed}${String(index + 1).padStart(3, "0")}447`,
    area: [12.4, 8.7, 24.2, 6.9, 18.1][index % 5],
    ownerStatus: index % 5 === 0 ? "Disputed" : index % 3 === 0 ? "Pending verification" : "Verified",
    frictionScore: [18, 34, 61, 27, 79][index % 5],
    compensation: index % 4 === 0 ? "Pending" : index % 3 === 0 ? "Under assessment" : "Paid",
  }));

const familySet = (seed: string, count: number): FamilyEntitlement[] =>
  Array.from({ length: count }, (_, index) => ({
    familyId: `FAM-${seed}-${String(index + 1).padStart(3, "0")}`,
    category: index % 3 === 0 ? "Non-agricultural" : "Agricultural",
    entitlement: ["Housing plot", "Livelihood grant", "House construction", "Training"][index % 4] as FamilyEntitlement["entitlement"],
    status: index % 4 === 0 ? "Pending" : index % 3 === 0 ? "Allotted" : "Completed",
  }));

const projectSeed: Array<Omit<Project, "parcels" | "entitlements">> = [
  { id: "nlams-001", name: "NH-44 Pune–Satara Expansion", state: "Maharashtra", code: "MH", sector: "Highway", agency: "NHAI · Western Region", district: "Pune", areaNotified: 18420, areaAcquired: 14680, compensationAssessed: 1860, compensationPaid: 1422, familiesAffected: 8420, familiesDisplaced: 2210, stage: "Sec 23 Award", status: "delayed", daysOverdue: 46, riskReason: "Award publication pending", lastActivity: "Award objections escalated 18 min ago" },
  { id: "nlams-002", name: "Visakhapatnam Port Industrial Belt", state: "Andhra Pradesh", code: "AP", sector: "Industrial", agency: "APIIC · Land Wing", district: "Visakhapatnam", areaNotified: 12600, areaAcquired: 8064, compensationAssessed: 2210, compensationPaid: 1660, familiesAffected: 6340, familiesDisplaced: 1480, stage: "Objections", status: "at-risk", daysOverdue: 28, riskReason: "Objection backlog", lastActivity: "37 objections received today" },
  { id: "nlams-003", name: "Bengaluru Metro Phase 2 Extension", state: "Karnataka", code: "KA", sector: "Urban", agency: "BMRCL · Project Cell", district: "Bengaluru Urban", areaNotified: 7920, areaAcquired: 5814, compensationAssessed: 1290, compensationPaid: 830, familiesAffected: 4200, familiesDisplaced: 960, stage: "Compensation", status: "delayed", daysOverdue: 61, riskReason: "Payment reconciliation", lastActivity: "Payment batch held for verification" },
  { id: "nlams-004", name: "Chennai–Bengaluru Freight Corridor", state: "Tamil Nadu", code: "TN", sector: "Rail", agency: "DFCCIL · South Zone", district: "Vellore", areaNotified: 22400, areaAcquired: 10430, compensationAssessed: 3060, compensationPaid: 1842, familiesAffected: 9100, familiesDisplaced: 2810, stage: "Sec 19 Declaration", status: "at-risk", daysOverdue: 19, riskReason: "Hearing schedule delayed", lastActivity: "Hearing calendar revised yesterday" },
  { id: "nlams-005", name: "NH-65 Hyderabad Outer Loop", state: "Telangana", code: "TG", sector: "Highway", agency: "R&B Department · Telangana", district: "Rangareddy", areaNotified: 9800, areaAcquired: 7212, compensationAssessed: 1140, compensationPaid: 1014, familiesAffected: 3810, familiesDisplaced: 1220, stage: "Possession Taken", status: "completed", lastActivity: "Possession taken · 412 ha · 2 min ago" },
  { id: "nlams-006", name: "Jaipur–Ajmer Rail Doubling", state: "Rajasthan", code: "RJ", sector: "Rail", agency: "North Western Railway", district: "Ajmer", areaNotified: 16400, areaAcquired: 6724, compensationAssessed: 2480, compensationPaid: 920, familiesAffected: 7200, familiesDisplaced: 1960, stage: "Sec 11 Notification", status: "delayed", daysOverdue: 33, riskReason: "Title verification friction", lastActivity: "Title friction flagged for 112 parcels" },
  { id: "nlams-007", name: "Rajasthan Solar Park II", state: "Rajasthan", code: "RJ", sector: "Renewable", agency: "RRECL · Solar Mission", district: "Jaisalmer", areaNotified: 34600, areaAcquired: 14200, compensationAssessed: 3920, compensationPaid: 2200, familiesAffected: 4840, familiesDisplaced: 1080, stage: "Title / Friction Check", status: "at-risk", daysOverdue: 12, riskReason: "Fragmented ownership records", lastActivity: "Escalation note issued to district" },
  { id: "nlams-008", name: "Narmada Canal Phase II", state: "Madhya Pradesh", code: "MP", sector: "Irrigation", agency: "Water Resources Department", district: "Khargone", areaNotified: 18800, areaAcquired: 12400, compensationAssessed: 1760, compensationPaid: 1330, familiesAffected: 6160, familiesDisplaced: 2040, stage: "R&R Allotment", status: "at-risk", daysOverdue: 19, riskReason: "Housing allotment pending", lastActivity: "R&R camp held in Khargone" },
  { id: "nlams-009", name: "Delhi–Mumbai Dedicated Rail Corridor", state: "Delhi", code: "DL", sector: "Rail", agency: "DFCCIL · Central Zone", district: "South West Delhi", areaNotified: 5200, areaAcquired: 4576, compensationAssessed: 980, compensationPaid: 802, familiesAffected: 1640, familiesDisplaced: 410, stage: "Objections", status: "delayed", daysOverdue: 31, riskReason: "High-value objections", lastActivity: "Section 101 reversion alert" },
  { id: "nlams-010", name: "East Coast Rail Link", state: "West Bengal", code: "WB", sector: "Rail", agency: "Eastern Railway · Projects", district: "Purba Medinipur", areaNotified: 14200, areaAcquired: 6106, compensationAssessed: 1880, compensationPaid: 790, familiesAffected: 5620, familiesDisplaced: 1710, stage: "Objections", status: "delayed", daysOverdue: 24, riskReason: "Objection backlog", lastActivity: "Public hearing notice issued" },
  { id: "nlams-011", name: "Konkan Coastal Highway Link", state: "Maharashtra", code: "MH", sector: "Highway", agency: "MSRDC · Corridor Unit", district: "Raigad", areaNotified: 11200, areaAcquired: 8064, compensationAssessed: 1420, compensationPaid: 1240, familiesAffected: 3340, familiesDisplaced: 880, stage: "Compensation", status: "on-track", lastActivity: "Payment batch released · 3 hrs ago" },
  { id: "nlams-012", name: "Sri City Integrated Industrial Zone", state: "Andhra Pradesh", code: "AP", sector: "Industrial", agency: "APIIC · Tirupati Region", district: "Tirupati", areaNotified: 8900, areaAcquired: 4005, compensationAssessed: 960, compensationPaid: 420, familiesAffected: 2980, familiesDisplaced: 740, stage: "Title / Friction Check", status: "at-risk", daysOverdue: 12, riskReason: "Title check pending", lastActivity: "Title verification batch queued" },
  { id: "nlams-013", name: "Kaveri Basin Lift Irrigation", state: "Karnataka", code: "KA", sector: "Irrigation", agency: "Karnataka Neeravari Nigam", district: "Mandya", areaNotified: 7600, areaAcquired: 5168, compensationAssessed: 840, compensationPaid: 620, familiesAffected: 2440, familiesDisplaced: 690, stage: "Sec 23 Award", status: "on-track", lastActivity: "Award declared · 1 day ago" },
  { id: "nlams-014", name: "Coimbatore Urban Mobility Grid", state: "Tamil Nadu", code: "TN", sector: "Urban", agency: "Tamil Nadu Highways", district: "Coimbatore", areaNotified: 6400, areaAcquired: 5120, compensationAssessed: 710, compensationPaid: 600, familiesAffected: 1940, familiesDisplaced: 520, stage: "Possession Taken", status: "completed", lastActivity: "Post-possession survey complete" },
  { id: "nlams-015", name: "Assam Petro Distribution Phase I", state: "Assam", code: "AS", sector: "Industrial", agency: "Assam Industrial Development Corp.", district: "Dibrugarh", areaNotified: 7100, areaAcquired: 2130, compensationAssessed: 780, compensationPaid: 190, familiesAffected: 2640, familiesDisplaced: 620, stage: "Sec 11 Notification", status: "at-risk", daysOverdue: 29, riskReason: "Notification reissue", lastActivity: "Notification correction under review" },
  { id: "nlams-016", name: "Maharashtra Green Energy Corridor", state: "Maharashtra", code: "MH", sector: "Renewable", agency: "MSETCL · Transmission", district: "Nashik", areaNotified: 9800, areaAcquired: 8330, compensationAssessed: 1080, compensationPaid: 960, familiesAffected: 2860, familiesDisplaced: 740, stage: "Possession Taken", status: "on-track", lastActivity: "92 parcels handed over · yesterday" },
];

export const projects: Project[] = projectSeed.map((project, index) => ({
  ...project,
  parcels: parcelSet(`${project.code}${String(index + 1).padStart(2, "0")}`, 5),
  entitlements: familySet(`${project.code}${String(index + 1).padStart(2, "0")}`, 8),
}));

export const stateStats: StateStat[] = [
  { state: "Maharashtra", code: "MH", projects: 84, areaNotified: 38420, areaAcquired: 30910, compensationAssessed: 7210, compensationPaid: 5920, familiesResettled: 78, averageDelay: 11, status: "on-track" },
  { state: "Andhra Pradesh", code: "AP", projects: 62, areaNotified: 28800, areaAcquired: 16520, compensationAssessed: 5120, compensationPaid: 3420, familiesResettled: 61, averageDelay: 18, status: "at-risk" },
  { state: "Telangana", code: "TG", projects: 48, areaNotified: 21400, areaAcquired: 14200, compensationAssessed: 3760, compensationPaid: 3190, familiesResettled: 74, averageDelay: 9, status: "on-track" },
  { state: "Karnataka", code: "KA", projects: 71, areaNotified: 26200, areaAcquired: 18680, compensationAssessed: 4680, compensationPaid: 3580, familiesResettled: 69, averageDelay: 14, status: "on-track" },
  { state: "Tamil Nadu", code: "TN", projects: 56, areaNotified: 29800, areaAcquired: 15550, compensationAssessed: 4220, compensationPaid: 3040, familiesResettled: 55, averageDelay: 21, status: "at-risk" },
  { state: "Rajasthan", code: "RJ", projects: 43, areaNotified: 51200, areaAcquired: 20924, compensationAssessed: 6080, compensationPaid: 3120, familiesResettled: 48, averageDelay: 32, status: "delayed" },
  { state: "Madhya Pradesh", code: "MP", projects: 38, areaNotified: 20800, areaAcquired: 13900, compensationAssessed: 3420, compensationPaid: 2710, familiesResettled: 64, averageDelay: 16, status: "at-risk" },
  { state: "West Bengal", code: "WB", projects: 29, areaNotified: 18400, areaAcquired: 7700, compensationAssessed: 2560, compensationPaid: 1120, familiesResettled: 42, averageDelay: 29, status: "delayed" },
  { state: "Delhi", code: "DL", projects: 21, areaNotified: 6200, areaAcquired: 5120, compensationAssessed: 1420, compensationPaid: 1210, familiesResettled: 81, averageDelay: 8, status: "on-track" },
  { state: "Assam", code: "AS", projects: 18, areaNotified: 14200, areaAcquired: 5160, compensationAssessed: 2040, compensationPaid: 980, familiesResettled: 39, averageDelay: 34, status: "delayed" },
];

export const funnelStages = [
  { label: "Proposed", value: 412, width: 100, tone: "brand" },
  { label: "Notified · Sec 11", value: 356, width: 86, tone: "brand" },
  { label: "Declared · Sec 19", value: 298, width: 72, tone: "brand" },
  { label: "Awarded · Sec 23", value: 241, width: 58, tone: "brand" },
  { label: "Compensation paid", value: 188, width: 45, tone: "accent" },
  { label: "Possession taken", value: 142, width: 34, tone: "success" },
];

export const monthlyDisbursement = [
  { month: "Apr", amount: 214 }, { month: "May", amount: 238 }, { month: "Jun", amount: 256 }, { month: "Jul", amount: 248 },
  { month: "Aug", amount: 291 }, { month: "Sep", amount: 306 }, { month: "Oct", amount: 288 }, { month: "Nov", amount: 334 },
  { month: "Dec", amount: 352 }, { month: "Jan", amount: 370 }, { month: "Feb", amount: 398 }, { month: "Mar", amount: 426 },
];

export const activities = [
  { tone: "success", title: "Possession taken — NH-65 Hyderabad Outer Loop", detail: "2 min ago · Telangana · Rangareddy" },
  { tone: "accent", title: "Award declared ₹42.6 Cr — Visakhapatnam Port Belt", detail: "14 min ago · Andhra Pradesh · Sec 23" },
  { tone: "brand", title: "Sec 11 notification — Jaipur–Ajmer Rail", detail: "1 hr ago · Rajasthan · Ajmer" },
  { tone: "success", title: "Compensation paid — Pune IT Industrial Area", detail: "3 hrs ago · Maharashtra · Pune" },
  { tone: "danger", title: "Section 101 reversion alert — Delhi–Mumbai Rail", detail: "Yesterday · Delhi NCR · Escalated" },
];

export const getProjects = async (): Promise<Project[]> => projects;
export const getProject = async (id: string): Promise<Project | undefined> => projects.find((project) => project.id === id);
export const getStateStats = async (): Promise<StateStat[]> => stateStats;
