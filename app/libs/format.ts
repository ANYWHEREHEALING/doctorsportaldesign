// Display helpers shared by all pages.

export const minutesText = (m: number | null | undefined): string => {
  if (m === null || m === undefined || !isFinite(m)) return "—"
  const v = Math.round(m)
  const h = Math.floor(v / 60)
  return h ? `${h}h ${String(v % 60).padStart(2, "0")}m` : `${v}m`
}

export const num = (v: number | null | undefined, unit = ""): string =>
  v === null || v === undefined || !isFinite(v) ? "—" : `${Math.round(v)}${unit ? " " + unit : ""}`

/** "+12", "−4", "±0" with unit; null → "" */
export const signed = (v: number | null | undefined, unit = ""): string => {
  if (v === null || v === undefined || !isFinite(v)) return ""
  const r = Math.round(v)
  const s = r > 0 ? "+" : r < 0 ? "−" : "±"
  return `${s}${Math.abs(r)}${unit ? " " + unit : ""}`
}

const UTC = { timeZone: "UTC" } as const

/** "Oct 26" from "2026-10-26" */
export const shortDay = (key: string): string =>
  new Date(key + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", ...UTC })

/** "Mon 26" */
export const weekday = (key: string): string =>
  new Date(key + "T00:00:00Z").toLocaleDateString(undefined, { weekday: "short", day: "numeric", ...UTC })

/** "October 2026" from "2026-10" */
export const monthName = (month: string): string =>
  new Date(month + "-01T00:00:00Z").toLocaleDateString(undefined, { month: "long", year: "numeric", ...UTC })

/** "3 hours ago", "2 days ago", "never" */
export const ago = (iso: string | null | undefined): string => {
  if (!iso) return "never"
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 90) return "just now"
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  const d = Math.round(s / 86400)
  return d === 1 ? "yesterday" : `${d} days ago`
}

/** Clock time in the PATIENT's time zone (offset minutes east of UTC). */
export const clock = (iso: string | null | undefined, offsetMinutes: number): string => {
  if (!iso) return "—"
  const d = new Date(new Date(iso).getTime() + offsetMinutes * 60000)
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", ...UTC })
}

export const addDays = (key: string, n: number): string =>
  new Date(Date.parse(key + "T00:00:00Z") + n * 86400000).toISOString().slice(0, 10)

export const addMonths = (month: string, n: number): string => {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  return d.toISOString().slice(0, 7)
}

export const avg = (values: Array<number | null | undefined>): number | null => {
  const v = values.filter((x): x is number => typeof x === "number" && isFinite(x))
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

export const SCOPE_TITLES: Record<string, string> = {
  profile: "Name & age",
  sleep: "Sleep",
  heartRate: "Heart rate",
  hrv: "HRV",
  stress: "Stress",
  sessions: "Sessions",
}
