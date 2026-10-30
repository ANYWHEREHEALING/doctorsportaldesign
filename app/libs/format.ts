// Display helpers shared by all pages. Dates follow the portal language
// (set by the LanguageProvider through setFormatLanguage).

let LANG: "en" | "es" = "en"
let LOCALE: string | undefined = undefined
export function setFormatLanguage(lang: "en" | "es") {
  LANG = lang
  LOCALE = lang === "es" ? "es-MX" : "en-US"
}
export const currentLocale = () => LOCALE

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
  new Date(key + "T00:00:00Z").toLocaleDateString(LOCALE, { month: "short", day: "numeric", ...UTC })

/** "Mon 26" */
export const weekday = (key: string): string =>
  new Date(key + "T00:00:00Z").toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", ...UTC })

/** "October 2026" from "2026-10" */
export const monthName = (month: string): string =>
  new Date(month + "-01T00:00:00Z").toLocaleDateString(LOCALE, { month: "long", year: "numeric", ...UTC })

/** "3 hours ago", "2 days ago", "never" */
export const ago = (iso: string | null | undefined): string => {
  const es = LANG === "es"
  if (!iso) return es ? "nunca" : "never"
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 90) return es ? "justo ahora" : "just now"
  if (s < 3600) return es ? `hace ${Math.round(s / 60)} min` : `${Math.round(s / 60)} min ago`
  if (s < 86400) return es ? `hace ${Math.round(s / 3600)} h` : `${Math.round(s / 3600)} h ago`
  const d = Math.round(s / 86400)
  if (d === 1) return es ? "ayer" : "yesterday"
  return es ? `hace ${d} días` : `${d} days ago`
}

/** Short local date of an ISO timestamp, e.g. "30/10/2026" or "10/30/2026". */
export const dateText = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString(LOCALE) : "—"

/** Clock time in the PATIENT's time zone (offset minutes east of UTC). */
export const clock = (iso: string | null | undefined, offsetMinutes: number): string => {
  if (!iso) return "—"
  const d = new Date(new Date(iso).getTime() + offsetMinutes * 60000)
  return d.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit", ...UTC })
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

// Titles are translated with t() where shown.
export const SCOPE_TITLES: Record<string, string> = {
  profile: "Name & age",
  sleep: "Sleep",
  heartRate: "Heart rate",
  hrv: "HRV",
  stress: "Stress",
  sessions: "Sessions",
}

export const KIND_TITLES: Record<string, string> = {
  deepSleep: "Deep Sleep",
  calm: "Calm & Relax",
  focus: "Focus",
  recovery: "Recovery",
  any: "Any session",
}

/** Server metric keys → English label (translated with t()). */
export const METRIC_TITLES: Record<string, string> = {
  sleepMinutes: "Sleep that night",
  deepMinutes: "Deep sleep that night",
  restingHr: "Resting heart rate that night",
  morningHrv: "HRV next morning",
  morningStress: "Stress next morning",
}
