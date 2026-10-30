// All calls go to /api/portal/... on this same site. next.config.js forwards
// them to the API server, so the login cookie is first-party and httpOnly:
// page scripts never see the token.

export type Scope = "profile" | "sleep" | "heartRate" | "hrv" | "stress" | "sessions"

export interface Doctor {
  id: number
  email: string
  name: string
  clinic: string
  status: string
  lastLoginAt: string | null
}

export interface PatientRow {
  linkId: number
  email: string
  status: "pending" | "active" | "declined" | "revoked"
  invitedAt: string
  respondedAt: string | null
  endedAt: string | null
  note: string
  userId?: number
  name?: string
  age?: number | null
  scopes?: Scope[]
  lastSyncAt?: string | null
  lastNight?: { date: string; asleepMinutes: number | null; deepMinutes: number | null } | null
  hrv7d?: number | null
  stress7d?: number | null
  stressChange?: number | null
}

export interface DayRow {
  date: string
  sleep?: {
    asleepMinutes: number | null
    totalMinutes: number | null
    deepMinutes: number | null
    lightMinutes: number | null
    remMinutes: number | null
    awakeMinutes: number | null
    startTime: string | null
    endTime: string | null
    restingHeartRate: number | null
  } | null
  heartRate?: { avg: number; min: number; max: number; readings: number } | null
  hrv?: { avg: number; morning: number | null; readings: number } | null
  stress?: { avg: number; max: number; readings: number } | null
  sessions?: number
}

export interface Metric {
  value: number | null
  previous: number | null
  change: number | null
  days: number
}

export interface Summary {
  sleepMinutes?: Metric
  deepMinutes?: Metric
  restingHeartRate?: Metric
  heartRate?: Metric
  hrv?: Metric
  morningHrv?: Metric
  stress?: Metric
  sessions?: { value: number; previous: number }
  daysWorn: number
}

export interface PatientProfile {
  id: number
  name: string
  email: string
  age: number | null
  gender: string | null
  utcOffsetMinutes: number
  lastSyncAt: string | null
  sharedSince: string | null
  scopes: Scope[]
}

export interface SessionRow {
  id: string
  kind: string
  title: string
  startedAt: string
  endedAt: string | null
  minutes: number | null
  date: string
  before: { heartRate: number | null; hrv: number | null; stress: number | null } | null
  after: { heartRate: number | null; hrv: number | null; stress: number | null } | null
}

export interface ComparisonMetric {
  key: string
  label: string
  unit: string
  higherIsBetter: boolean
  sessionValue: number | null
  offValue: number | null
  diff: number | null
  threshold: number | null
  meaningful: boolean
  direction: "better" | "worse" | "same"
  sessionDays: number
  offDays: number
  confidence: "building" | "early" | "consistent"
}

export interface ResponseBlock {
  baseline?: { status: string; offDaysUsed: number; offDaysNeeded: number }
  comparison?: { windowDays: number; sessionDays: number; offDays: number; metrics: ComparisonMetric[] }
  whatWorks?: Array<{ kind: string; title: string; sessions: number; score: number; confidence: string; instant: Record<string, { median: number | null; n: number }> }>
  note?: string
}

export interface PatientDetail {
  patient: PatientProfile
  range: { from: string; to: string; days: number }
  summary: Summary
  days: DayRow[]
  sessions?: SessionRow[]
  response?: ResponseBlock
}

export interface KindCount { kind: string; title: string; sessions: number; medianStressDrop: number | null }

export interface WeeklyReport {
  patient: PatientProfile
  weekStart: string
  weekEnd: string
  summary: Summary
  days: DayRow[]
  sessionsByKind?: KindCount[]
  bestSession?: KindCount | null
  biggestChange?: ComparisonMetric | null
  sessionsDone?: number
  daysWorn: number
  response?: ResponseBlock
}

export interface MonthlyReport {
  patient: PatientProfile
  month: string
  from: string
  to: string
  complete: boolean
  summary: Summary
  days: DayRow[]
  sessionsByKind?: KindCount[]
  response?: ResponseBlock
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api/portal${path}`, {
      method,
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.")
  }

  let json: { success?: boolean; message?: string; body?: T } | null = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.assign(`/?next=${next}`)
  }
  if (!res.ok || !json || json.success === false) {
    throw new ApiError(res.status, json?.message || `Something went wrong (${res.status}).`)
  }
  return (json.body ?? {}) as T
}

export const api = {
  // auth
  me: () => request<{ doctor: Doctor }>("GET", "/auth/me"),
  login: (email: string, password: string) => request<{ doctor: Doctor }>("POST", "/auth/login", { email, password }),
  logout: () => request<object>("POST", "/auth/logout"),
  inviteInfo: (token: string) =>
    request<{ email: string; name: string; clinic: string }>("GET", `/auth/invite?token=${encodeURIComponent(token)}`),
  acceptInvite: (token: string, name: string, clinic: string, password: string) =>
    request<{ doctor: Doctor }>("POST", "/auth/accept-invite", { token, name, clinic, password }),
  forgot: (email: string) => request<object>("POST", "/auth/forgot", { email }),
  reset: (token: string, password: string) => request<{ doctor: Doctor }>("POST", "/auth/reset", { token, password }),

  // patients
  patients: () => request<{ patients: PatientRow[] }>("GET", "/patients"),
  invitePatient: (email: string, note: string) =>
    request<{ linkId: number; hasAccount: boolean }>("POST", "/patients/invite", { email, note }),
  removeLink: (linkId: number) => request<object>("DELETE", `/patients/links/${linkId}`),
  patient: (userId: string | number, days: number) => request<PatientDetail>("GET", `/patients/${userId}?days=${days}`),
  weeklyReport: (userId: string | number, week?: string) =>
    request<WeeklyReport>("GET", `/patients/${userId}/reports/weekly${week ? `?week=${week}` : ""}`),
  monthlyReport: (userId: string | number, month?: string) =>
    request<MonthlyReport>("GET", `/patients/${userId}/reports/monthly${month ? `?month=${month}` : ""}`),
}
